import type { Metadata } from "next";
import Link from "next/link";
import { BANKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Supported banks — statement converters by bank",
  description: "Bank statement to Excel/CSV/Xero/QBO converters for Revolut, N26, Wise, BNP Paribas, Crédit Agricole, Deutsche Bank, Sparkasse, ING, CaixaBank, Barclays, HSBC and more.",
};

export default function BanksIndex() {
  const byCountry = new Map<string, typeof BANKS>();
  for (const b of BANKS) byCountry.set(b.country, [...(byCountry.get(b.country) ?? []), b]);
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Supported banks</h1>
      <p className="mt-3 max-w-3xl text-gray-600">Any statement with a transaction table works. These are the banks we test against and describe in detail.</p>
      {[...byCountry.entries()].map(([country, banks]) => (
        <section key={country} className="mt-8">
          <h2 className="font-semibold">{country}</h2>
          <ul className="mt-2 grid gap-1 sm:grid-cols-3 text-sm">
            {banks.map((b) => <li key={b.slug}><Link href={`/banks/${b.slug}`} className="text-blue-700 hover:underline">{b.name} statement to Excel</Link></li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
