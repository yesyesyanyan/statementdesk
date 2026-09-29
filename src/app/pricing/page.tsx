import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing", description: "Free daily pages, Pro for accountants and bookkeepers." };

export default function Pricing() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-3 text-gray-600">Start free. Upgrade when you convert statements every week.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Free</h2>
          <div className="mt-2 text-3xl font-bold">$0</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>5 pages per day</li><li>All export formats</li><li>Balance check</li><li>No account needed</li>
          </ul>
        </div>
        <div className="rounded-xl border-2 border-blue-600 bg-white p-6">
          <h2 className="text-lg font-semibold">Pro</h2>
          <div className="mt-2 text-3xl font-bold">$12<span className="text-base font-normal text-gray-500">/month</span></div>
          <div className="text-sm text-gray-500">or $99/year</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>500 pages per month</li><li>Batch upload (many statements → one workbook)</li><li>Conversion history</li><li>Priority processing</li>
          </ul>
          <button className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" disabled title="Coming soon">Coming soon</button>
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-500">Payments will be handled by Paddle, which issues the invoice and collects VAT for your country.</p>
    </div>
  );
}
