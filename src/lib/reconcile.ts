import type { Issue, Statement } from "./schema";

const round2 = (n: number) => Math.round(n * 100) / 100;
const close = (a: number, b: number) => Math.abs(a - b) <= 0.011;
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Deterministic checks that don't trust the model: recompute the running
 * balance from the opening balance and compare it with what the statement
 * prints. A single misread or skipped row shows up as the first mismatch.
 */
export function reconcile(s: Statement): Issue[] {
  const issues: Issue[] = [];
  const tx = s.transactions;

  if (tx.length === 0) {
    issues.push({ level: "error", code: "no_transactions", message: "No transactions were found." });
    return issues;
  }
  if (s.opening_balance === null) {
    issues.push({ level: "warning", code: "missing_opening", message: "No opening balance found; the running balance could not be verified from the start." });
  }
  if (s.closing_balance === null) {
    issues.push({ level: "warning", code: "missing_closing", message: "No closing balance found." });
  }

  const sum = round2(tx.reduce((acc, t) => acc + t.amount, 0));

  // Row-by-row running balance, anchored on the opening balance or, failing
  // that, on the first printed balance.
  let running: number | null = s.opening_balance;
  let firstMismatch = false;
  tx.forEach((t, i) => {
    if (t.date === null) {
      issues.push({ level: "warning", code: "missing_date", message: `Row ${i + 1}: no readable date.`, row: i + 1 });
    }
    if (running === null) {
      if (t.balance !== null) running = round2(t.balance);
      return;
    }
    running = round2(running + t.amount);
    if (t.balance !== null && !close(running, t.balance) && !firstMismatch) {
      firstMismatch = true;
      issues.push({
        level: "error",
        code: "balance_break",
        row: i + 1,
        message: `Row ${i + 1} ("${t.description.slice(0, 40)}"): expected balance ${fmt(running)} but the statement shows ${fmt(t.balance)} (difference ${fmt(t.balance - running)}). A row may be missing or misread here.`,
      });
      // re-anchor so later rows are judged on their own
      running = round2(t.balance);
    }
  });

  if (s.opening_balance !== null && s.closing_balance !== null) {
    const expected = round2(s.opening_balance + sum);
    if (!close(expected, s.closing_balance)) {
      issues.push({
        level: "error",
        code: "closing_mismatch",
        message: `Opening ${fmt(s.opening_balance)} + net movement ${fmt(sum)} = ${fmt(expected)}, but the closing balance is ${fmt(s.closing_balance)} (difference ${fmt(s.closing_balance - expected)}).`,
      });
    }
  }

  // Dates should not go backwards by much (statements are chronological).
  for (let i = 1; i < tx.length; i++) {
    const a = tx[i - 1].date, b = tx[i].date;
    if (a && b && b < a) {
      issues.push({ level: "warning", code: "date_order", row: i + 1, message: `Row ${i + 1} is dated ${b}, before row ${i} (${a}).` });
      break;
    }
  }

  return issues;
}

export function statusFor(issues: Issue[]): "ok" | "review" | "failed" {
  if (issues.some((i) => i.code === "no_transactions")) return "failed";
  if (issues.some((i) => i.level === "error")) return "review";
  return "ok";
}
