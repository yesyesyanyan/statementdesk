import Link from "next/link";
import Converter from "@/components/Converter";
import { BANKS, FORMAT_PAGES, SITE } from "@/lib/site";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Bank statement PDF → Excel, CSV, Xero or QuickBooks</h1>
        <p className="mt-4 text-lg text-gray-600">
          Built for European banks and statements in any language. Every conversion recomputes the running balance and flags the first row that doesn&apos;t add up.
        </p>
      </section>
      <section className="mx-auto mt-10 max-w-3xl">
        <Converter />
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          ["Any language", "French relevés, German Kontoauszüge, Spanish extractos, Chinese 流水 — descriptions stay in the original language, headers come out in English."],
          ["Balance-checked", "Opening balance + every row = printed balance, or you hear about it. A missed line or misread digit is highlighted, not hidden."],
          ["Nothing stored", "Files are processed in memory and discarded when the response is sent. No account needed to try it."],
        ].map(([h, p]) => (
          <div key={h} className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">{h}</h2>
            <p className="mt-2 text-sm text-gray-600">{p}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Export formats</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {FORMAT_PAGES.map((f) => (
            <li key={f.slug}><Link href={`/convert/${f.slug}`} className="text-blue-700 hover:underline">{f.h1}</Link></li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Supported banks</h2>
        <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-3 text-sm">
          {BANKS.map((b) => (
            <li key={b.slug}><Link href={`/banks/${b.slug}`} className="text-blue-700 hover:underline">{b.name} statement to Excel</Link></li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-gray-500">{SITE.name} reads any statement with a transaction table; these pages describe the banks we test against most.</p>
      </section>
    </div>
  );
}
