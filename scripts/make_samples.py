"""Generate synthetic bank statements (PDF) for testing.

Every name, account number and transaction here is invented. Three statements:
  1. French retail bank, in French, with a running balance (clean)
  2. Revolut-style, English, multi-currency-looking descriptions (clean)
  3. German Sparkasse-style, in German, with ONE row that breaks the balance
     (to prove the reconciliation check catches it)
"""
from __future__ import annotations

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT = os.path.join(os.path.dirname(__file__), "..", "samples")
os.makedirs(OUT, exist_ok=True)
styles = getSampleStyleSheet()


def money_fr(v: float) -> str:
    s = f"{abs(v):,.2f}".replace(",", " ").replace(".", ",")
    return s


def money_de(v: float) -> str:
    return f"{abs(v):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def build(path: str, header_lines: list[str], columns: list[str], rows: list[list[str]], footer: list[str]):
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm, topMargin=15 * mm)
    story = []
    for i, line in enumerate(header_lines):
        story.append(Paragraph(line, styles["Title"] if i == 0 else styles["Normal"]))
    story.append(Spacer(1, 6 * mm))
    table = Table([columns] + rows, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8eef7")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f7f7")]),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 6 * mm))
    for line in footer:
        story.append(Paragraph(line, styles["Normal"]))
    doc.build(story)
    print("wrote", path)


# 1. French statement -------------------------------------------------------
fr_tx = [
    ("02/06/2026", "PRLV SEPA EDF CLIENTS PARTICULIERS", -64.30),
    ("03/06/2026", "CARTE 01/06 CARREFOUR MARKET PARIS", -42.17),
    ("05/06/2026", "VIR SEPA SALAIRE JUIN ACME SAS", 2450.00),
    ("06/06/2026", "CARTE 05/06 SNCF CONNECT", -58.00),
    ("09/06/2026", "PRLV SEPA FREE MOBILE", -19.99),
    ("12/06/2026", "CARTE 11/06 BOULANGERIE DU MARCHE", -6.40),
    ("15/06/2026", "VIR SEPA LOYER JUIN M. DURAND", -890.00),
    ("18/06/2026", "CARTE 17/06 AMAZON EU SARL", -23.90),
    ("22/06/2026", "REMBOURSEMENT CPAM", 27.50),
    ("26/06/2026", "CARTE 25/06 PHARMACIE CENTRALE", -14.85),
    ("30/06/2026", "FRAIS TENUE DE COMPTE", -2.50),
]
start = 1234.56
rows = []
bal = start
for d, lib, amt in fr_tx:
    bal = round(bal + amt, 2)
    rows.append([d, lib, money_fr(amt) if amt < 0 else "", money_fr(amt) if amt > 0 else "", money_fr(bal)])
build(
    os.path.join(OUT, "fr_banque_releve_juin_2026.pdf"),
    [
        "Banque Populaire de l'Ouest (fictif)",
        "Relevé de compte courant — M. Jean DUPONT",
        "IBAN FR76 1234 5678 9012 3456 7890 123 · Période du 01/06/2026 au 30/06/2026",
        f"Solde précédent au 31/05/2026 : {money_fr(start)} EUR",
    ],
    ["Date", "Libellé", "Débit (EUR)", "Crédit (EUR)", "Solde (EUR)"],
    rows,
    [f"Nouveau solde au 30/06/2026 : {money_fr(bal)} EUR", "Document fictif généré pour des tests."],
)

# 2. Revolut-style, English -------------------------------------------------
rev_tx = [
    ("1 Jul 2026", "Card payment · Tesco Express", -12.40),
    ("2 Jul 2026", "Transfer from Anna K.", 150.00),
    ("4 Jul 2026", "Card payment · Uber", -18.75),
    ("6 Jul 2026", "Top-Up by *4421", 500.00),
    ("8 Jul 2026", "Card payment · Netflix.com", -10.99),
    ("11 Jul 2026", "Exchanged to EUR", -200.00),
    ("14 Jul 2026", "Card payment · Ryanair", -89.98),
    ("19 Jul 2026", "Transfer to Savings Vault", -100.00),
    ("23 Jul 2026", "Refund · Ryanair", 89.98),
    ("28 Jul 2026", "Card payment · Pret A Manger", -7.25),
]
start = 312.44
rows = []
bal = start
for d, desc, amt in rev_tx:
    bal = round(bal + amt, 2)
    rows.append([d, desc, f"{amt:,.2f}", f"{bal:,.2f}"])
build(
    os.path.join(OUT, "en_revolut_style_statement_jul_2026.pdf"),
    [
        "Revolut-style Account Statement (fictional)",
        "Sam Taylor · Personal · GBP",
        "Generated on 1 August 2026 · Period 1 Jul 2026 – 31 Jul 2026",
        f"Opening balance: £{start:,.2f}",
    ],
    ["Date", "Description", "Amount (GBP)", "Balance (GBP)"],
    rows,
    [f"Closing balance: £{bal:,.2f}", "Fictional document for testing purposes."],
)

# 3. German statement with a deliberate error -------------------------------
de_tx = [
    ("01.08.2026", "Lastschrift  Stadtwerke Muenchen Strom", -71.20),
    ("03.08.2026", "Kartenzahlung  REWE Muenchen", -54.63),
    ("05.08.2026", "Gehalt August  Beispiel GmbH", 3100.00),
    ("07.08.2026", "Dauerauftrag  Miete August", -1150.00),
    ("10.08.2026", "Kartenzahlung  DB Vertrieb GmbH", -49.90),
    ("14.08.2026", "Lastschrift  Telekom Deutschland", -39.95),
    ("18.08.2026", "Ueberweisung  Rueckzahlung M. Schmidt", 120.00),
    ("21.08.2026", "Kartenzahlung  dm-drogerie markt", -23.47),
    ("27.08.2026", "Lastschrift  Fitnessstudio", -29.90),
    ("31.08.2026", "Kontofuehrungsgebuehr", -4.90),
]
start = 845.12
rows = []
bal = start
for i, (d, desc, amt) in enumerate(de_tx):
    bal = round(bal + amt, 2)
    printed = bal
    if i == 4:  # deliberate error: printed balance is 10 EUR off from here on
        printed = round(bal + 10, 2)
    # keep the error only on this row so the running balance breaks once
    sign = "-" if amt < 0 else "+"
    rows.append([d, desc, f"{sign}{money_de(amt)}", money_de(printed)])
build(
    os.path.join(OUT, "de_sparkasse_style_kontoauszug_aug_2026_fehler.pdf"),
    [
        "Sparkasse Musterstadt (fiktiv) — Kontoauszug",
        "Kontoinhaber: Maria Beispiel · IBAN DE89 3704 0044 0532 0130 00",
        "Auszug Nr. 8/2026 · Zeitraum 01.08.2026 bis 31.08.2026",
        f"Alter Kontostand: {money_de(start)} EUR",
    ],
    ["Buchungstag", "Verwendungszweck", "Betrag (EUR)", "Kontostand (EUR)"],
    rows,
    [f"Neuer Kontostand: {money_de(bal)} EUR", "Fiktives Dokument – enthaelt absichtlich einen Saldo-Fehler in Zeile 5."],
)
