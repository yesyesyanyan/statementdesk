import ExcelJS from "exceljs";
import type { Issue, Statement } from "./schema";

export const FORMATS = ["xlsx", "csv", "xero", "qbo"] as const;
export type Format = (typeof FORMATS)[number];

const csvCell = (v: string | number | null) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const row = (cells: (string | number | null)[]) => cells.map(csvCell).join(",");

/** Generic CSV: one row per transaction, debit/credit split, Excel-safe UTF-8 BOM. */
export function toCsv(s: Statement): string {
  const lines = [row(["Date", "Description", "Debit", "Credit", "Balance", "Currency"])];
  for (const t of s.transactions) {
    lines.push(row([t.date, t.description, t.amount < 0 ? -t.amount : null, t.amount > 0 ? t.amount : null, t.balance, s.currency]));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/** Xero bank statement import (Date, Amount, Payee, Description, Reference, Check Number). */
export function toXeroCsv(s: Statement): string {
  const lines = [row(["*Date", "*Amount", "Payee", "Description", "Reference", "Check Number"])];
  for (const t of s.transactions) {
    lines.push(row([t.date ? xeroDate(t.date) : "", t.amount, "", t.description, "", ""]));
  }
  return lines.join("\r\n") + "\r\n";
}
const xeroDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

/** QuickBooks Web Connect (.qbo) = OFX 1.x SGML. */
export function toQbo(s: Statement): string {
  const ofxDate = (iso: string | null) => (iso ? iso.replace(/-/g, "") + "120000" : "19700101120000");
  const now = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  const cur = s.currency ?? "EUR";
  const acct = (s.account_number_masked ?? "0000").replace(/\D/g, "").slice(-4).padStart(4, "0");
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").slice(0, 255);
  const txs = s.transactions
    .map((t, i) => {
      const type = t.amount < 0 ? "DEBIT" : "CREDIT";
      return `<STMTTRN>
<TRNTYPE>${type}
<DTPOSTED>${ofxDate(t.date)}
<TRNAMT>${t.amount.toFixed(2)}
<FITID>${ofxDate(t.date)}${String(i + 1).padStart(4, "0")}
<NAME>${esc(t.description.slice(0, 32))}
<MEMO>${esc(t.description)}
</STMTTRN>`;
    })
    .join("\n");
  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:NONE
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<DTSERVER>${now}
<LANGUAGE>ENG
<FI><ORG>${esc(s.bank_name ?? "BANK")}<FID>00000</FI>
<INTU.BID>00000
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS><CODE>0<SEVERITY>INFO</STATUS>
<STMTRS>
<CURDEF>${cur}
<BANKACCTFROM><BANKID>000000000<ACCTID>${acct}<ACCTTYPE>CHECKING</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${ofxDate(s.period_start)}
<DTEND>${ofxDate(s.period_end)}
${txs}
</BANKTRANLIST>
<LEDGERBAL><BALAMT>${(s.closing_balance ?? 0).toFixed(2)}<DTASOF>${ofxDate(s.period_end)}</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`;
}

/** Reviewer-friendly workbook: Transactions (with a check column) + Issues + Summary. */
export async function toXlsx(s: Statement, issues: Issue[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Transactions");
  ws.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Description", key: "description", width: 48 },
    { header: "Debit", key: "debit", width: 12 },
    { header: "Credit", key: "credit", width: 12 },
    { header: "Balance", key: "balance", width: 14 },
    { header: "Check", key: "check", width: 40 },
  ];
  ws.getRow(1).font = { bold: true };
  const flagged = new Map(issues.filter((i) => i.row).map((i) => [i.row!, i]));
  s.transactions.forEach((t, i) => {
    const issue = flagged.get(i + 1);
    const r = ws.addRow({
      date: t.date,
      description: t.description,
      debit: t.amount < 0 ? -t.amount : null,
      credit: t.amount > 0 ? t.amount : null,
      balance: t.balance,
      check: issue ? issue.message : "",
    });
    if (issue) r.fill = { type: "pattern", pattern: "solid", fgColor: { argb: issue.level === "error" ? "FFFFC7CE" : "FFFFEB9C" } };
  });
  for (const col of ["debit", "credit", "balance"]) ws.getColumn(col).numFmt = "#,##0.00";

  const sum = wb.addWorksheet("Summary");
  sum.addRows([
    ["Bank", s.bank_name],
    ["Account holder", s.account_holder],
    ["Account", s.account_number_masked],
    ["Currency", s.currency],
    ["Period", `${s.period_start ?? "?"} to ${s.period_end ?? "?"}`],
    ["Opening balance", s.opening_balance],
    ["Closing balance", s.closing_balance],
    ["Transactions", s.transactions.length],
    ["Issues", issues.length],
  ]);
  sum.getColumn(1).width = 18;
  sum.getColumn(2).width = 40;

  const iss = wb.addWorksheet("Issues");
  iss.columns = [
    { header: "Level", key: "level", width: 10 },
    { header: "Row", key: "row", width: 6 },
    { header: "Code", key: "code", width: 18 },
    { header: "Message", key: "message", width: 90 },
  ];
  iss.getRow(1).font = { bold: true };
  issues.forEach((i) => iss.addRow(i));

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export const CONTENT_TYPES: Record<Format, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv; charset=utf-8",
  xero: "text/csv; charset=utf-8",
  qbo: "application/x-ofx",
};

export async function exportAs(format: Format, s: Statement, issues: Issue[]): Promise<Buffer | string> {
  switch (format) {
    case "xlsx":
      return toXlsx(s, issues);
    case "csv":
      return toCsv(s);
    case "xero":
      return toXeroCsv(s);
    case "qbo":
      return toQbo(s);
  }
}
