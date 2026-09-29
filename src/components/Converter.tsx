"use client";

import { useCallback, useState } from "react";
import type { ConvertResult } from "@/lib/schema";
import type { Format } from "@/lib/export";

const FORMAT_LABELS: Record<Format, string> = {
  xlsx: "Excel (.xlsx)",
  csv: "CSV",
  xero: "Xero CSV",
  qbo: "QuickBooks (.qbo)",
};

const money = (n: number | null) =>
  n === null ? "" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Converter({ defaultFormat = "xlsx" }: { defaultFormat?: Format }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const convert = useCallback(async (f: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    const body = new FormData();
    body.append("file", f);
    try {
      const res = await fetch("/api/convert", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Conversion failed.");
      setResult(json as ConvertResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  const pick = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    void convert(f);
  };

  const download = async (format: Format) => {
    if (!result) return;
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, statement: result.statement, issues: result.issues }),
    });
    const blob = await res.blob();
    const name = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `statement.${format}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const flagged = new Map(result?.issues.filter((i) => i.row).map((i) => [i.row!, i]) ?? []);

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
        className={`block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="text-lg font-medium">{busy ? "Reading your statement…" : "Drop a statement PDF here, or click to choose"}</div>
        <div className="mt-2 text-sm text-gray-500">PDF, PNG or JPG · up to 20 MB · files are not stored</div>
        {file && !busy && <div className="mt-3 text-sm text-gray-700">{file.name}</div>}
      </label>

      {busy && <div className="mt-6 h-1 w-full overflow-hidden rounded bg-gray-200"><div className="h-full w-1/3 animate-pulse bg-blue-500" /></div>}
      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      {result && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xl font-semibold">{result.statement.bank_name ?? "Statement"}</div>
              <div className="text-sm text-gray-600">
                {result.statement.period_start ?? "?"} → {result.statement.period_end ?? "?"} · {result.statement.transactions.length} transactions · {result.statement.currency ?? ""}
              </div>
            </div>
            <StatusBadge status={result.status} />
          </div>

          {result.issues.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.issues.map((i, k) => (
                <li key={k} className={`rounded-lg border p-3 text-sm ${i.level === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                  {i.message}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => download(f)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${f === defaultFormat ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-300 bg-white hover:bg-gray-50"}`}
              >
                Download {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-2">Date</th><th className="p-2">Description</th>
                  <th className="p-2 text-right">Debit</th><th className="p-2 text-right">Credit</th><th className="p-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {result.statement.transactions.map((t, i) => {
                  const issue = flagged.get(i + 1);
                  return (
                    <tr key={i} className={issue ? (issue.level === "error" ? "bg-red-50" : "bg-amber-50") : i % 2 ? "bg-gray-50/50" : ""} title={issue?.message}>
                      <td className="whitespace-nowrap p-2">{t.date ?? "—"}</td>
                      <td className="p-2">{t.description}</td>
                      <td className="p-2 text-right tabular-nums">{t.amount < 0 ? money(-t.amount) : ""}</td>
                      <td className="p-2 text-right tabular-nums">{t.amount > 0 ? money(t.amount) : ""}</td>
                      <td className="p-2 text-right tabular-nums">{money(t.balance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ConvertResult["status"] }) {
  const map = {
    ok: ["bg-green-100 text-green-800", "Balances check out"],
    review: ["bg-red-100 text-red-800", "Needs review"],
    failed: ["bg-gray-200 text-gray-800", "Could not read"],
  } as const;
  const [cls, label] = map[status];
  return <span className={`rounded-full px-3 py-1 text-sm font-medium ${cls}`}>{label}</span>;
}
