import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Converter from "@/components/Converter";
import { BANKS, bankBySlug, FORMAT_PAGES } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BANKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const bank = bankBySlug((await params).slug);
  if (!bank) return {};
  return {
    title: `Convert ${bank.name} Bank Statement (PDF) to Excel, CSV, Xero & QBO`,
    description: `Upload a ${bank.name} statement PDF (${bank.language}) and download the transactions as Excel, CSV, a Xero import file or a QuickBooks QBO — with the running balance verified.`,
    alternates: { canonical: `/banks/${bank.slug}` },
  };
}

export default async function BankPage({ params }: Params) {
  const bank = bankBySlug((await params).slug);
  if (!bank) notFound();
  const faq = [
    { q: `How do I convert a ${bank.name} statement to Excel?`, a: `Download the PDF statement from ${bank.name} online banking or the app, drop it into the box above, and click Download Excel. The reader handles ${bank.language} statements and keeps the descriptions as printed.` },
    { q: `Does it work with scanned or photographed ${bank.name} statements?`, a: "Yes. Scans and phone photos (PNG/JPG) are read visually; a clean, straight photo with the whole table visible gives the best result." },
    { q: "Is the result checked?", a: `The running balance is recomputed from the opening balance and compared with the balance ${bank.name} printed on each row. Any mismatch is highlighted before you download.` },
  ];
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const others = BANKS.filter((b) => b.slug !== bank.slug).slice(0, 12);
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold tracking-tight">Convert a {bank.name} bank statement to Excel, CSV, Xero or QuickBooks</h1>
      <p className="mt-3 max-w-3xl text-gray-600">
        {bank.name} ({bank.country}) issues statements in {bank.language}. {bank.notes} Drop the PDF below and get a spreadsheet with the balance checked.
      </p>
      <div className="mt-8 max-w-3xl"><Converter /></div>
      <section className="mt-14 max-w-3xl">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        <dl className="mt-4 space-y-5">
          {faq.map((f) => (
            <div key={f.q}><dt className="font-medium">{f.q}</dt><dd className="mt-1 text-sm text-gray-600">{f.a}</dd></div>
          ))}
        </dl>
      </section>
      <section className="mt-12 text-sm">
        <h2 className="font-semibold">Export formats</h2>
        <ul className="mt-2 flex flex-wrap gap-4">
          {FORMAT_PAGES.map((f) => <li key={f.slug}><Link href={`/convert/${f.slug}`} className="text-blue-700 hover:underline">{f.h1}</Link></li>)}
        </ul>
        <h2 className="mt-6 font-semibold">Other banks</h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {others.map((b) => <li key={b.slug}><Link href={`/banks/${b.slug}`} className="text-blue-700 hover:underline">{b.name}</Link></li>)}
        </ul>
      </section>
    </article>
  );
}
