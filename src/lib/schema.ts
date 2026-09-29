import { z } from "zod";

// What the model must return for one statement. Kept flat and nullable so it
// works with strict structured output; money is a signed number in the
// account currency (negative = money out).
export const TransactionSchema = z.object({
  date: z.string().nullable().describe("YYYY-MM-DD"),
  description: z.string(),
  amount: z.number().describe("signed: negative for debits, positive for credits"),
  balance: z.number().nullable().describe("running balance printed on this row, or null"),
});

export const StatementSchema = z.object({
  bank_name: z.string().nullable(),
  account_holder: z.string().nullable(),
  account_number_masked: z.string().nullable().describe("last 4 digits only, e.g. ****1234"),
  currency: z.string().nullable().describe("ISO 4217"),
  language: z.string().nullable().describe("ISO 639-1 of the statement text, e.g. fr"),
  period_start: z.string().nullable().describe("YYYY-MM-DD"),
  period_end: z.string().nullable().describe("YYYY-MM-DD"),
  opening_balance: z.number().nullable(),
  closing_balance: z.number().nullable(),
  transactions: z.array(TransactionSchema),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type Statement = z.infer<typeof StatementSchema>;

export type Issue = {
  level: "error" | "warning";
  code: string;
  message: string;
  row?: number; // 1-based transaction index
};

export type ConvertResult = {
  statement: Statement;
  issues: Issue[];
  status: "ok" | "review" | "failed";
  pages: number;
};
