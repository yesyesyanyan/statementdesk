import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Bank statement to Excel, CSV, Xero & QuickBooks`, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
            <Link href="/" className="text-base font-semibold">{SITE.name}</Link>
            <div className="flex gap-5">
              <Link href="/convert/bank-statement-to-excel" className="hover:underline">Excel</Link>
              <Link href="/convert/bank-statement-to-xero" className="hover:underline">Xero</Link>
              <Link href="/convert/bank-statement-to-qbo" className="hover:underline">QuickBooks</Link>
              <Link href="/banks" className="hover:underline">Banks</Link>
              <Link href="/pricing" className="hover:underline">Pricing</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} {SITE.name}</span>
            <Link href="/privacy" className="hover:underline">Privacy & security</Link>
            <Link href="/banks" className="hover:underline">Supported banks</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
