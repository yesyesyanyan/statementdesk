import { NextResponse } from "next/server";
import { extractStatement } from "@/lib/extract";
import { reconcile, statusFor } from "@/lib/reconcile";
import type { ConvertResult } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a file in the 'file' field." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is larger than 20 MB." }, { status: 413 });
  }
  const mediaType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "");
  if (!ALLOWED.has(mediaType)) {
    return NextResponse.json({ error: "Only PDF, PNG, JPG and WebP files are supported." }, { status: 415 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const statement = await extractStatement({ bytes, mediaType, name: file.name });
    const issues = reconcile(statement);
    const result: ConvertResult = { statement, issues, status: statusFor(issues), pages: countPages(bytes, mediaType) };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// Cheap page count for PDFs (counts /Type /Page objects); images are 1 page.
function countPages(bytes: Buffer, mediaType: string): number {
  if (mediaType !== "application/pdf") return 1;
  const m = bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
  return Math.max(1, m?.length ?? 1);
}
