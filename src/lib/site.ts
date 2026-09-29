export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "StatementDesk",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "Convert European bank statements (PDF) to Excel, CSV, Xero and QuickBooks — in any language, with the balance checked.",
};

export type FormatPage = {
  slug: string;
  format: "xlsx" | "csv" | "xero" | "qbo";
  title: string;
  h1: string;
  description: string;
  intro: string;
  faq: { q: string; a: string }[];
};

export const FORMAT_PAGES: FormatPage[] = [
  {
    slug: "bank-statement-to-excel",
    format: "xlsx",
    title: "Bank Statement to Excel Converter (PDF to XLSX, balance-checked)",
    h1: "Convert a bank statement PDF to Excel",
    description: "Upload a PDF bank statement in English, French, German, Spanish or Chinese and download a clean Excel workbook with every transaction, debit/credit split and a running-balance check.",
    intro: "Drop a PDF (or a photo) of a statement. You get an .xlsx with one row per transaction, separate Debit and Credit columns, the printed running balance, and a Check column that flags any row where the numbers don't add up.",
    faq: [
      { q: "Which banks work?", a: "Any bank whose statement lists transactions in a table: Revolut, N26, Wise, BNP Paribas, Crédit Agricole, Société Générale, Deutsche Bank, Sparkasse, ING, Rabobank, CaixaBank, Barclays, HSBC, Chase and hundreds more. The reader is language-aware, so French, German, Spanish, Italian, Dutch and Chinese statements convert as well as English ones." },
      { q: "What does the balance check do?", a: "It recomputes the running balance from the opening balance, row by row, and compares it with the balance the bank printed. The first row where they disagree is highlighted, so a misread digit or a missed line never reaches your books silently." },
      { q: "Do you keep my statement?", a: "No. Files are processed in memory and discarded when the response is sent. Nothing is stored." },
    ],
  },
  {
    slug: "bank-statement-to-csv",
    format: "csv",
    title: "Bank Statement to CSV Converter (PDF to CSV, any language)",
    h1: "Convert a bank statement PDF to CSV",
    description: "Turn a PDF bank statement into a clean CSV with Date, Description, Debit, Credit and Balance columns. Works with French, German, Spanish and Chinese statements.",
    intro: "A plain CSV that opens in Excel, Google Sheets, Numbers or any accounting tool. UTF-8 with BOM, so accented characters and Chinese descriptions survive the round trip into Excel.",
    faq: [
      { q: "What's the column layout?", a: "Date (YYYY-MM-DD), Description, Debit, Credit, Balance, Currency. Debits and credits are split into two columns so the file imports into most accounting software without remapping." },
      { q: "Can I import this into Xero or QuickBooks?", a: "Yes, but use the dedicated Xero CSV or QuickBooks QBO export instead; those follow each product's import format exactly." },
    ],
  },
  {
    slug: "bank-statement-to-xero",
    format: "xero",
    title: "Bank Statement to Xero CSV Converter (PDF to Xero import file)",
    h1: "Convert a bank statement PDF to a Xero CSV",
    description: "Convert PDF bank statements into Xero's bank statement import format (*Date, *Amount, Payee, Description, Reference) in seconds.",
    intro: "Xero only accepts CSV, OFX, QIF or QBO for manual statement imports. This export writes Xero's own CSV template, with dates in DD/MM/YYYY and one signed Amount column, ready for Accounting → Bank accounts → Import a statement.",
    faq: [
      { q: "How do I import into Xero?", a: "In Xero go to Accounting → Bank accounts, choose the account, click Manage account → Import a statement, and upload the CSV. Xero will show the columns already mapped." },
      { q: "Why is the amount one column?", a: "That's Xero's format: negative amounts are money out, positive amounts are money in." },
    ],
  },
  {
    slug: "bank-statement-to-qbo",
    format: "qbo",
    title: "PDF Bank Statement to QBO Converter (QuickBooks Web Connect)",
    h1: "Convert a bank statement PDF to QBO for QuickBooks",
    description: "Convert PDF bank statements into a .qbo (Web Connect) file you can upload to QuickBooks Online or Desktop, with every transaction checked against the running balance.",
    intro: "QuickBooks can't read PDFs. A .qbo file is the same format your bank's Web Connect download uses, so QuickBooks treats the transactions as a normal bank feed upload, with dates, amounts and payee names in place.",
    faq: [
      { q: "How do I upload a QBO file to QuickBooks Online?", a: "Go to Transactions → Bank transactions → Link account ▾ → Upload from file, pick the .qbo file, choose the account and follow the prompts." },
      { q: "Does this work for QuickBooks Desktop?", a: "Yes. Use File → Utilities → Import → Web Connect Files." },
    ],
  },
];

export type Bank = {
  slug: string;
  name: string;
  country: string;
  language: string; // human-readable
  notes: string; // what's special about this bank's PDF
};

export const BANKS: Bank[] = [
  { slug: "revolut", name: "Revolut", country: "Europe / UK", language: "English", notes: "Statements list one signed Amount column and a Balance column; card payments show the merchant after a middle dot. Multi-currency pockets each get their own statement." },
  { slug: "n26", name: "N26", country: "Germany / EU", language: "English or German", notes: "Clean single-table layout, amounts signed, dates as DD.MM.YYYY. Spaces (sub-accounts) appear as internal transfers." },
  { slug: "wise", name: "Wise", country: "UK / EU", language: "English", notes: "Statements are per currency balance and include exchange lines; the running balance is printed on every row." },
  { slug: "bnp-paribas", name: "BNP Paribas", country: "France", language: "French", notes: "Separate Débit and Crédit columns, dates as JJ/MM/AAAA, labels like PRLV SEPA, VIR SEPA and CARTE with the card date embedded in the description." },
  { slug: "credit-agricole", name: "Crédit Agricole", country: "France", language: "French", notes: "Regional caisses use slightly different layouts, but all print Débit/Crédit columns and a 'Solde' line at the start and end of the period." },
  { slug: "societe-generale", name: "Société Générale", country: "France", language: "French", notes: "Two-column débit/crédit layout with 'Solde précédent' and 'Nouveau solde' lines; amounts use a space as thousands separator and a comma for decimals." },
  { slug: "boursorama", name: "BoursoBank (Boursorama)", country: "France", language: "French", notes: "Online-bank PDF with one signed amount column; card transactions carry the merchant city." },
  { slug: "la-banque-postale", name: "La Banque Postale", country: "France", language: "French", notes: "Débit/Crédit columns and a running 'Solde' column; the period totals appear at the foot of the last page." },
  { slug: "lcl", name: "LCL", country: "France", language: "French", notes: "Classic French layout with Débit and Crédit columns and dates as JJ/MM." },
  { slug: "qonto", name: "Qonto", country: "France / EU", language: "French or English", notes: "Business account statements with VAT columns for card payments; one signed amount column." },
  { slug: "deutsche-bank", name: "Deutsche Bank", country: "Germany", language: "German", notes: "Kontoauszug with Buchungstag / Valuta, Verwendungszweck and a signed Betrag column; amounts as 1.234,56." },
  { slug: "commerzbank", name: "Commerzbank", country: "Germany", language: "German", notes: "Multi-line Verwendungszweck entries; Soll/Haben marked with a trailing S or H on older layouts." },
  { slug: "sparkasse", name: "Sparkasse", country: "Germany", language: "German", notes: "Hundreds of regional Sparkassen share the same Kontoauszug layout: Buchungstag, Verwendungszweck, Betrag, Kontostand." },
  { slug: "dkb", name: "DKB", country: "Germany", language: "German", notes: "Kontoauszug with Buchungsdatum and Wertstellung, Betrag in EUR signed." },
  { slug: "ing", name: "ING", country: "Netherlands / Germany / Spain", language: "Dutch, German or Spanish", notes: "Layouts differ per country; the Dutch afschrift uses Af/Bij columns instead of signed amounts." },
  { slug: "rabobank", name: "Rabobank", country: "Netherlands", language: "Dutch", notes: "Rekeningafschrift with Af/Bij columns and a running Saldo." },
  { slug: "abn-amro", name: "ABN AMRO", country: "Netherlands", language: "Dutch", notes: "Afschrift with separate Af and Bij columns; descriptions are wrapped across several lines." },
  { slug: "caixabank", name: "CaixaBank", country: "Spain", language: "Spanish", notes: "Extracto with Fecha, Concepto, Importe and Saldo; dates as DD/MM/YYYY." },
  { slug: "bbva", name: "BBVA", country: "Spain", language: "Spanish", notes: "Extracto de cuenta with signed Importe and Saldo columns." },
  { slug: "santander", name: "Santander", country: "Spain / UK", language: "Spanish or English", notes: "Spanish extractos use Fecha/Concepto/Importe/Saldo; UK statements use Money out / Money in / Balance." },
  { slug: "unicredit", name: "UniCredit", country: "Italy", language: "Italian", notes: "Estratto conto with Data, Valuta, Dare/Avere columns and a Saldo line per page." },
  { slug: "intesa-sanpaolo", name: "Intesa Sanpaolo", country: "Italy", language: "Italian", notes: "Estratto conto with Dare and Avere columns; amounts as 1.234,56." },
  { slug: "ubs", name: "UBS", country: "Switzerland", language: "German, French or Italian", notes: "Kontoauszug/relevé with Belastung and Gutschrift columns; CHF amounts sometimes use an apostrophe as thousands separator (1'234.50)." },
  { slug: "barclays", name: "Barclays", country: "United Kingdom", language: "English", notes: "Money out / Money in / Balance columns with dates as DD Mon YYYY." },
  { slug: "hsbc", name: "HSBC", country: "UK / Hong Kong / France", language: "English, Chinese or French", notes: "UK statements use Paid out / Paid in / Balance; Hong Kong statements can be bilingual English/Chinese." },
  { slug: "lloyds", name: "Lloyds Bank", country: "United Kingdom", language: "English", notes: "Date, Description, Type (DEB, FPI, DD...), Money out, Money in, Balance." },
  { slug: "monzo", name: "Monzo", country: "United Kingdom", language: "English", notes: "Statement PDF with signed Amount and Balance columns; category shown in the description." },
  { slug: "starling", name: "Starling Bank", country: "United Kingdom", language: "English", notes: "One signed amount column, references and counterparty in separate fields." },
  { slug: "nordea", name: "Nordea", country: "Nordics", language: "Swedish, Danish, Finnish or Norwegian", notes: "Kontoutdrag layouts per country; amounts use a comma decimal." },
  { slug: "chase", name: "Chase", country: "United States", language: "English", notes: "Sections for Deposits and Withdrawals rather than one table; dates as MM/DD." },
  { slug: "bank-of-america", name: "Bank of America", country: "United States", language: "English", notes: "Deposits and other additions / Withdrawals and other subtractions sections; dates as MM/DD/YY." },
  { slug: "bank-of-china", name: "Bank of China (中国银行)", country: "China / Hong Kong", language: "Chinese", notes: "交易明细 with 交易日期、摘要、收入、支出、余额 columns; the reader keeps descriptions in Chinese." },
];

export const bankBySlug = (slug: string) => BANKS.find((b) => b.slug === slug);
export const formatBySlug = (slug: string) => FORMAT_PAGES.find((f) => f.slug === slug);
