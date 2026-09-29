import { describe, expect, it } from "vitest";
import { reconcile, statusFor } from "../reconcile";
import { toCsv, toQbo, toXeroCsv, toXlsx } from "../export";
import type { Statement } from "../schema";

const clean: Statement = {
  bank_name: "Test Bank",
  account_holder: "A",
  account_number_masked: "****1234",
  currency: "EUR",
  language: "fr",
  period_start: "2026-06-01",
  period_end: "2026-06-30",
  opening_balance: 100,
  closing_balance: 130.5,
  transactions: [
    { date: "2026-06-02", description: "Café", amount: -4.5, balance: 95.5 },
    { date: "2026-06-05", description: "Salaire", amount: 50, balance: 145.5 },
    { date: "2026-06-09", description: "Loyer", amount: -15, balance: 130.5 },
  ],
};

describe("reconcile", () => {
  it("passes a consistent statement", () => {
    const issues = reconcile(clean);
    expect(issues).toEqual([]);
    expect(statusFor(issues)).toBe("ok");
  });

  it("flags the first row whose printed balance breaks the chain", () => {
    const broken = { ...clean, transactions: clean.transactions.map((t, i) => (i === 1 ? { ...t, balance: 155.5 } : t)) };
    const issues = reconcile(broken);
    const brk = issues.find((i) => i.code === "balance_break");
    expect(brk?.row).toBe(2);
    expect(brk?.message).toContain("10.00");
    expect(statusFor(issues)).toBe("review");
  });

  it("flags a closing balance that doesn't match the movements", () => {
    const issues = reconcile({ ...clean, closing_balance: 131 });
    expect(issues.map((i) => i.code)).toContain("closing_mismatch");
  });

  it("catches a missing row via the balance chain", () => {
    const missing = { ...clean, transactions: [clean.transactions[0], clean.transactions[2]] };
    const issues = reconcile(missing);
    expect(issues.some((i) => i.code === "balance_break" && i.row === 2)).toBe(true);
    expect(issues.some((i) => i.code === "closing_mismatch")).toBe(true);
  });

  it("fails on an empty statement", () => {
    const issues = reconcile({ ...clean, transactions: [] });
    expect(statusFor(issues)).toBe("failed");
  });
});

describe("exports", () => {
  it("writes a debit/credit CSV with BOM", () => {
    const csv = toCsv(clean);
    expect(csv.startsWith("﻿Date,Description,Debit,Credit,Balance,Currency")).toBe(true);
    expect(csv).toContain("2026-06-02,Café,4.5,,95.5,EUR");
  });

  it("writes Xero's column layout with DD/MM/YYYY dates", () => {
    const x = toXeroCsv(clean);
    expect(x.split("\r\n")[0]).toBe("*Date,*Amount,Payee,Description,Reference,Check Number");
    expect(x).toContain("02/06/2026,-4.5,,Café,,");
  });

  it("writes an OFX/QBO with one STMTTRN per row", () => {
    const q = toQbo(clean);
    expect(q.startsWith("OFXHEADER:100")).toBe(true);
    expect(q.match(/<STMTTRN>/g)?.length).toBe(3);
    expect(q).toContain("<CURDEF>EUR");
    expect(q).toContain("<BALAMT>130.50");
  });

  it("writes an xlsx workbook with three sheets", async () => {
    const buf = await toXlsx(clean, reconcile(clean));
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 2).toString()).toBe("PK");
  });
});
