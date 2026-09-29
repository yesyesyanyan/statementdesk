import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTENT_TYPES, exportAs, FORMATS } from "@/lib/export";
import { StatementSchema } from "@/lib/schema";

export const runtime = "nodejs";

const Body = z.object({
  format: z.enum(FORMATS),
  statement: StatementSchema,
  issues: z.array(z.object({ level: z.enum(["error", "warning"]), code: z.string(), message: z.string(), row: z.number().optional() })),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid export request." }, { status: 400 });
  }
  const { format, statement, issues } = parsed.data;
  const body = await exportAs(format, statement, issues);
  const base = (statement.bank_name ?? "statement").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const ext = format === "xero" ? "csv" : format;
  return new NextResponse(body as BodyInit, {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${base}-${statement.period_end ?? "export"}.${ext}"`,
    },
  });
}
