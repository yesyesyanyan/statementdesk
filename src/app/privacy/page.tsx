import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy & security", description: "How uploaded statements are handled." };

export default function Privacy() {
  return (
    <article className="prose mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Privacy & security</h1>
      <p className="mt-4 text-gray-700">Bank statements are sensitive, so {SITE.name} is built to hold them for as short a time as possible.</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
        <li><strong>No storage.</strong> Your file is kept in memory only while it is being read. It is not written to disk and not kept after the response is sent.</li>
        <li><strong>Reading.</strong> The page images are sent over TLS to an AI model provider to extract the table. The provider processes the request and does not use it to train models.</li>
        <li><strong>Exports are built in your browser session.</strong> The Excel, CSV, Xero and QBO files are generated from the extracted table you see on screen; nothing is uploaded again.</li>
        <li><strong>No account is needed</strong> for the free tier. If you create one, we store only your email and usage counts.</li>
        <li><strong>Redact if you prefer.</strong> You can black out account numbers before uploading; the converter only needs the transaction table and the opening/closing balance.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">Questions: hello@{SITE.url.replace(/^https?:\/\//, "")}</p>
    </article>
  );
}
