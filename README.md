# StatementDesk

Convert bank statement PDFs (any language, European banks first) into Excel, CSV, Xero CSV and QuickBooks QBO — with the running balance recomputed and checked.

## How it works

1. `POST /api/convert` receives a PDF or image, sends it to Claude with a strict JSON schema (`src/lib/extract.ts`) and gets back the transactions.
2. `src/lib/reconcile.ts` recomputes the running balance from the opening balance and flags the first row that disagrees with the printed balance, plus a closing-balance check.
3. `POST /api/export` turns the reviewed table into `.xlsx` (with an Issues sheet), CSV, Xero CSV or `.qbo` (OFX).
4. Pages under `/convert/[format]` and `/banks/[slug]` are generated from `src/lib/site.ts`, each with its own title, copy, FAQ and JSON-LD.

Files are processed in memory and never stored.

## Run locally

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY, or set MOCK_EXTRACTION=1 to demo without a key
npm run dev
```

`npm test` runs the reconciliation and export tests. `python3 scripts/make_samples.py` regenerates the synthetic statements in `samples/` (French, English/Revolut-style, German with a deliberate balance error).

## Deploy

Vercel: import the repo, set `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_NAME` and `NEXT_PUBLIC_SITE_URL`. No database is needed for this version.

## Roadmap

- Accounts + daily free quota (Supabase)
- Pro subscription via Paddle (500 pages/month, batch upload, history)
- More bank pages and per-language landing pages
