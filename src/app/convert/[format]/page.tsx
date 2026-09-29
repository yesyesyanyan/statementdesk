import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Converter from "@/components/Converter";
import { FORMAT_PAGES, formatBySlug, SITE } from "@/lib/site";

type Params = { params: Promise<{ format: string }> };

export function generateStaticParams() {
  return FORMAT_PAGES.map((f) => ({ format: f.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = formatBySlug((await params).format);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/convert/${page.slug}` } };
}

export default async function FormatPage({ params }: Params) {
  const page = formatBySlug((await params).format);
  if (!page) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "SoftwareApplication", name: `${SITE.name} — ${page.h1}`, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
      { "@type": "FAQPage", mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold tracking-tight">{page.h1}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">{page.intro}</p>
      <div className="mt-8 max-w-3xl"><Converter defaultFormat={page.format} /></div>
      <section className="mt-14 max-w-3xl">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        <dl className="mt-4 space-y-5">
          {page.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-sm text-gray-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
