# Vyapaar — Project Context for AI Assistants

**Read this file before changing anything.** It is written for an AI assistant
(ChatGPT, Gemini, Claude, Copilot — any of them) that has no prior knowledge of
this codebase. It contains the architecture, the data model, the accounting
rules that must not be broken, the UI vocabulary, and the known landmines.

Paste the whole file, or paste §1–§6 plus the section relevant to your task.

**Last verified: 2 October 2026.** When you change the shape of the data, the
posting rules, or the page conventions, update this file in the same commit.
A stale context file is worse than none — it will confidently mislead.

---

## 1. What Vyapaar is

A **GST billing and accounting app for a small Indian trading business.** It
replaces desktop accounting software of the SIGFA/Tally generation, so its
screens deliberately echo those: dense keyboard-driven grids, Dr/Cr columns,
HSN summaries. The pilot customer is a textiles trader (the name is currently
hard-coded into the ledger header — see §9.7).

It is in **prototype stage, being tested by a single real customer.** It is
not multi-tenant and has no sign-in (see §9).

What it does:

| Area | Screens |
|---|---|
| Masters | Customers/parties, Items, HSN codes, Party price lists |
| Transactions | Sale, Sale Return, Purchase, Purchase Return invoices |
| Money | Receipt/payment vouchers |
| Reports | Party ledger, Stock (item) ledger, Voucher register, Invoice print, Date-range invoice print |
| Extras | AI invoice-image import (separate Python service), email invoice |

**Vocabulary.** "Party" = customer or supplier; both live in the same
`customers` collection. "Voucher" = a receipt or payment entry, not an invoice.
"Item ledger" = stock ledger. Dr = debit, Cr = credit.

---

## 2. Running it

```bash
npm install
npm run dev        # http://localhost:3000  (Next.js, turbopack)
npm run build      # production build
npm test           # the full test suite — run this before you call anything done
```

**Environment** — `.env.local` at the repo root:

```
MONGO_URI=mongodb+srv://...      # REQUIRED. Must be a replica set (Atlas is one) — see §6.7
RESEND_API_KEY=...               # optional, only for emailing an invoice
INVOICE_FROM_EMAIL=...           # optional; an address on a Resend-verified domain.
                                 # Without it, mail only reaches the Resend account owner.
NEXT_PUBLIC_AI_IMPORT_URL=...    # optional; the backend/ invoice-image service
```

The Python AI-import service in `backend/` is separate and optional:

```bash
cd backend && pip install -r requirements.txt && uvicorn app:app --reload
# needs GOOGLE_API_KEY in backend/.env
```

> `backend/requirements.txt` is UTF-16 encoded and `pip install -r` fails on
> Linux/CI. Re-save it as UTF-8 if you touch it.

---

## 3. Stack and hard constraints

- **Next.js 16 (App Router), JavaScript — not TypeScript.** Do not introduce
  `.ts`/`.tsx` files; keep the codebase in plain JS/JSX.
- **React 18.2.0.** Not 19. Do not use React 19-only APIs.
- **MongoDB + Mongoose 8.** No SQL, no Prisma.
- **Tailwind CSS 3** plus a hand-written component layer in `app/globals.css`
  (see §8.1). A few **shadcn/ui** primitives live in `components/ui/`.
  **MUI is installed and used only for icons** (`@mui/icons-material`) — do not
  build new UI with MUI components.
- **Path alias:** `@/*` → repo root. `import X from '@/lib/balance.mjs'`.
- `.mjs` files in `lib/` are **pure, dependency-free modules** that must run
  under bare `node` (the tests import them directly). **Never import Mongoose
  or a model into a `.mjs` file in `lib/`** unless it is already there —
  `lib/cashAccount.mjs`, `lib/itemLedger.mjs` and `lib/runningBalances.mjs` are
  the three that do, and they are therefore not unit-testable.
- Also shipped as an **Electron desktop app** (`main.js`) that simply loads the
  deployed Vercel URL in a window. A **Capacitor** config exists but is unused.
- `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` — lint errors will
  not fail a build. Do not rely on lint to catch your mistakes.

---

## 4. Directory map

```
app/
  layout.js              Root layout: header, nav, SaleOptionProvider
  globals.css            Design tokens + the component class vocabulary (§8.1)
  page.js                Dashboard / home — nav tiles, master pickers, counts
  saleadd/               Sale invoice entry          ─┐
  salereturn/            Sale return entry            │ four near-identical
  purchaseadd/           Purchase invoice entry       │ ~1,100-line pages
  purchasereturn/        Purchase return entry       ─┘ (see §9 — they have drifted)
  invoice/               Printable invoice (loads by ?invoiceNo=N)
  invoice-range/         Batch print invoices over a date range
  ledger/                Party ledger report
  item-ledger/           Stock ledger report
  voucher/               Voucher register
  voucheradd/            Voucher entry
  customeradd/           Party master form
  itemadd/               Item master form
  setup/                 Feature toggles + "clear all data"
  upload/                AI invoice-image import
  api/<name>/route.js    All API routes (§7)

components/
  InvoiceDocument.jsx    The printable invoice body. `forwardRef`, props
                         `{ invoice, isRollStationary }` — takes a whole saved
                         invoice document and renders it. Shared by /invoice and
                         /invoice-range so a bill looks identical either way.
                         Derives its HSN summary and CGST/SGST split from
                         lib/hsnTotals.mjs and lib/gst.mjs rather than trusting
                         stored totals.
  PriceListMaster.jsx    Party price list entry grid (modal)
  HsnMaster.jsx          HSN master (modal)
  ui/                    shadcn primitives: button, input, dialog, popover, tabs…
  Backbutton / NextButton / ReloadButton / suspense wrappers

lib/                     ← THE DOMAIN LAYER. Read §6 before touching any of it.
  balance.mjs            Signed-balance arithmetic. The single source of truth.
  invoicePosting.mjs     What one invoice posts (deltas + ledger rows)
  voucherLedger.mjs      What one voucher posts
  itemLedger.mjs         Stock rows for an invoice      (imports Mongoose)
  runningBalances.mjs    Recompute stored running figures (imports Mongoose)
  cashAccount.mjs        Resolve the cash/bank account   (imports Mongoose)
  paymentType.mjs        Cash vs bank decision (pure)
  withTransaction.mjs    MongoDB transaction wrapper
  getNextInvoiceNo.js    Atomic invoice-number reservation
  gst.mjs                CGST/SGST split, GST state-code normalisation
  hsnTotals.mjs          HSN code-wise summary, derived from line items
  priceList.mjs          Party price list resolution
  company.mjs            The firm's own name/address/GSTIN — ONE place. Every
                         document header reads it from here
  mongodb.js             Cached connection
  localStorageHelper.js  Invoice draft persistence
  utils.js               `cn()` — clsx + tailwind-merge

models/                  Mongoose schemas (§5)
context/SaleOptionContext.js   Feature toggles, persisted to localStorage
scripts/                 Tests (*.test.mjs) and maintenance scripts (§10)
backend/                 FastAPI + Gemini invoice-image extraction (separate service)
```

---

## 5. Data model

Ten collections. **There are no foreign keys — parties and items are joined by
NAME**, which is why renames cascade (§6.10) and why name uniqueness matters.

### `customers` (`models/custModel.js`) — parties AND cash/bank accounts

Both customers and suppliers live here, and so do the business's own cash and
bank accounts (distinguished by `group` being `cash` or `bank`).

| Field | Notes |
|---|---|
| `name` | **The join key used across every other collection.** No unique index — see §9 |
| `short`, `email`, `phone`, `address`, `city`, `state`, `pincode` | contact |
| `group` | free text; `'cash'` / `'bank'` give the account special meaning |
| `gstIn`, `pan`, `aadhar`, `stateCode` | `stateCode` is a **String** ("07", not 7) |
| `dealerType`, `discount`, `interest`, `bank` | trade terms |
| `openingBal` / `openingMode` | **Signed.** User-owned. Editing it adjusts `lastBal` by the difference |
| `lastBal` / `lastMode` | **Signed. SYSTEM-OWNED — forms must never write this.** The live running balance |
| `lastYearBal` / `lastYearMode` | User-owned reference data. No effect on anything |

### `items` (`models/itemModel.js`)

`name` (**join key**, no unique index), `hsn`, `short`, `group`, `unit`,
`mrp`, `cost`, `salePrice`, `purchasePrice`, `discount`, `gst`, `weight`,
`itemType`, `openingQuantity`, `lastQuantity`.

> **`lastQuantity` is dead data.** Nothing updates it from stock movement; only
> the item form writes it. Real stock comes from the item ledger. Never display
> it as "current stock".

### `Invoice` (`models/invoiceModel.js`)

One document per sale / purchase / return.

- `invoiceNo` — **Number, unique index.** Globally unique across all four types.
- `type` — `"Sale"` or `"Purchase"`; `return` — Boolean. **Together these four
  combinations define every document type.**
- `date`, `customer: { name, phone, email, custId }`
- `items[]` — `{ name, quantity, cost, discount, total, taxableAmount, gstAmount, hsn, gstRate, description }`
- `hsnTotals[]` — `{ hsn, gstRate, amount, total }`. ⚠ **`amount` is the GST
  charged, not the taxable value.** Taxable = `total - amount`. Prefer deriving
  this with `lib/hsnTotals.mjs` rather than trusting the stored array.
- Money: `totalAmount`, `finalAmount`, `received`, `balanceDue`
- `paymentType` (`Cash`/`Cheque`), `stateOfSupply`, `taxType` (`local`/`central`), `gst`
- Dispatch: `shippedTo`, `dispatchFrom`, `transport`, `grNo`, `grDate`,
  `pvtMark`, `caseDetails`, `freight`, `weight`, `orderNo`, `orderDate`,
  `ewayBillNo`, `ewayBillDate`
- `partyTaxes[]` — extra overheads `{ name, rate, Amount, total }`

### `Ledger` (`models/ledgerModel.js`) — the party ledger

| Field | Meaning |
|---|---|
| `customerName` | **whose ledger this row belongs to** — the grouping key |
| `account` | the **contra** side of the same row (e.g. "Sales Account", or the cash account) |
| `debit` / `credit` | this party's side |
| `balance` | running figure, recomputed by `lib/runningBalances.mjs` |
| `narration`, `paymentType`, `date` | |
| `voucherId` | the Invoice or Voucher `_id` that wrote the row. **This is how rows are found and deleted.** |

### `ItemLedger` (`models/itemLedgerModel.js`) — stock ledger

`itemName` (join key), `invoiceNo` (**String** here, Number on Invoice),
`date`, `typeOfVoucher`, `partyName`, `receiptQuantity`, `issueQuantity`,
`balanceQuantity`.

### `Voucher` (`models/voucherModel.js`) — receipts and payments

`acName` (the account money moved through), `date`, `paymentType`, `narration`,
`againstBill`, `acType`, and `customers[]` of `{ name, debit, credit, custId, narration }`.

### `pricelists` (`models/priceListModel.js`) — per-party item rates

`party` (ObjectId → customers), `partyName`, `date`, `remark`, and `items[]`:

`{ itemId, name, unit, salePrice, mrp, discount }`

- `salePrice` / `mrp` are **nullable** — `null` means "use the item master",
  which is **not** the same as `0` (zero means free).
- `discount` is **one** percentage.
- `dis1`/`dis2`/`dis3` and `price` are **legacy fields**, still declared so old
  documents load. Nothing writes them. `lib/priceList.mjs` collapses an old
  three-discount chain into the one equivalent percentage.

### `hsn`, `Counter`, `TotalSale`

- `hsn`: `hsncode` (unique), `hsnname`, `gst`, `gstunit`
- `Counter`: `{ name, value }` — only `name: 'invoiceNo'` is used
- `TotalSale`: legacy, effectively unused

---

## 6. The accounting rules — DO NOT BREAK THESE

**This is the most important section of the file.** Everything below was
written to fix a real bug that corrupted real books. If you are changing
anything that touches money or stock, read it all.

**The governing principle: one rule, one place.** Creating, editing and
deleting a document must derive their figures from the *same function*. Every
serious bug this project has had was two code paths computing the same thing
differently and drifting apart.

### 6.1 Balances are signed

`lib/balance.mjs` is the single source of truth.

```
lastBal > 0  →  Dr  (the party owes us / receivable)
lastBal < 0  →  Cr  (we owe the party / payable)
```

`lastMode` is a **denormalised cache of the sign**, never an independent input.
Always change a balance through `applyDelta()`, `setBalance()` or
`balancePipeline()` so the two cannot drift. The UI shows magnitude + a Dr/Cr
dropdown; convert at the boundary with `toSigned()` in and `toDisplay()` out.

Use `round2()` on every money figure. Floats drift otherwise.

### 6.2 An invoice posts TWO legs

This is the rule most likely to be broken by someone "simplifying" things.

| Leg | Effect |
|---|---|
| **Document** | The party moves by the **full** invoice value, against Sales/Purchase Account |
| **Receipt** | Anything paid at the counter moves the party **back** and lands on cash/bank |

They net to `balanceDue`. Posting only the net is what once made fully-paid
sales vanish from the books entirely — no party movement, no cash, no trace.

Direction, from `invoiceDelta({ type, isReturn, amount })`:

| Document | Party balance | Stock |
|---|---|---|
| Sale | **+** amount | out |
| Sale return | **−** amount | in |
| Purchase | **−** amount | in |
| Purchase return | **+** amount | out |

### 6.3 Stock direction comes from the same table

`isInwardStock({ type, isReturn })` in `balance.mjs` sits **deliberately beside**
`invoiceDelta` and reads the same two inputs. These two rules drifted apart
once — the stock side keyed off a `returnType` field no caller ever sent, so
both return types moved stock backwards while the money was right. Keep them
together.

### 6.4 Vouchers balance; invoices do not

A voucher writes one row per party line **plus one aggregate row** for the
account the money moved through, on the opposite side. It nets to zero.

An invoice does **not**: "Sales Account" and "Purchase Account" are only labels
in the `account` column — there is no Customer document holding them, and no
counter-row. **This app is a subsidiary ledger (parties, cash/bank, stock), not
a general ledger. There is no trial balance, P&L or balance sheet.** Do not
promise one without building the nominal-account side first.

### 6.5 Derive figures; never trust the client

`balanceDue` is recomputed server-side as `round2(finalAmount - received)` in
both `save-invoice` and `sale-alter`, and `delete-invoice` reverses using
`invoicePostingDeltas()` — the same function that posts.

Reversing by a stored figure while posting from a computed one leaves
permanent drift whenever a client's arithmetic disagrees. The AI import path
(`app/upload/`) passes an extractor's numbers straight through, so this is not
hypothetical.

### 6.6 Running balances are recomputed, not patched

`Ledger.balance` and `ItemLedger.balanceQuantity` are rewritten **end to end for
the affected account or item**, in `(date, _id)` order, from the opening
position — `lib/runningBalances.mjs`.

Patching one row is wrong twice over: same-day rows have no defined order, and
a back-dated entry never rewrites what follows it. Call
`recomputeLedgerBalances()` / `recomputeItemBalances()` after **any** write that
touches ledger or stock rows.

### 6.7 Every money write is in a transaction

Wrap it in `withTransaction()` from `lib/withTransaction.mjs`.

- **Every query inside the callback must be passed `{ session }`.** One that
  isn't runs outside the transaction — it won't roll back and can't see the
  uncommitted writes around it. This is the single easy mistake here.
- Throw `AbortTransaction(payload, status)` to reject the work deliberately and
  still control the HTTP response.
- **Requires a replica set.** Transactions do not exist on a standalone
  `mongod`. Atlas is always a replica set. There is deliberately **no silent
  non-transactional fallback** — adding one would reintroduce exactly the
  partial-write corruption this exists to prevent.
- `withTransaction` retries on transient errors, so the callback must be safe
  to run more than once.

### 6.8 Ledger rows are found by `voucherId`, never by narration

`delete-invoice` once also matched rows whose narration ended with
"Invoice No: 12". A user typing "Against Invoice No: 12" on a *receipt voucher*
then lost that voucher's row when the invoice was deleted — and the party's
balance disagreed with its own ledger permanently. Match on `voucherId` only.

### 6.9 GST

- Per line: `taxable = cost × qty − discount%`, `gst = taxable × rate/100`,
  `total = taxable + gst`.
- `taxType: 'local'` → CGST + SGST; `'central'` → IGST.
- **Split with `splitGst()` from `lib/gst.mjs`, never `(total/2).toFixed(2)`
  twice** — that disagrees with the tax charged on half of all amounts, by a
  paisa, on a document that must foot.
- `taxType` is a **manual** radio button, not derived from `stateOfSupply`.
  Choosing it wrong produces a legally wrong invoice.
- GST state codes are two-digit **strings** — Delhi is `"07"`. Normalise with
  `normalizeStateCode()`.
- The HSN summary is **derived from the line items** by `lib/hsnTotals.mjs`.
  Use it rather than the stored `hsnTotals` array, which was being silently
  truncated by strict mode on older documents.
- Use `??` not `||` when falling back on `taxableAmount` or `total` — `0` is a
  real value (a free line), and `||` would re-charge it at full price.

### 6.10 Renames cascade

Because joins are by name, renaming a party or item must update every
collection that names it, inside one transaction:
`Ledger.customerName`, `Ledger.account`, `ItemLedger.partyName`/`itemName`,
`Invoice.customer.name`, `Voucher.acName`, `Voucher.customers[].name`.
See `api/customer-alter` and `api/item-alter` for the pattern. A rename onto an
existing name is refused (409) — merging two parties' history is never intended.

### 6.11 Payment type decides which account receives the money

`resolvePaymentAccount(paymentType, session)` in `lib/cashAccount.mjs`:
exact name match → group (`cash`/`bank`) → default name → create. Cash and
cheque must not land in the same account.

### 6.12 Invoice numbers: peek vs reserve

`GET /api/next-invoice-no` is a **peek** for display — opening a form and
walking away must not burn a number. The number is only claimed on save, where
`save-invoice` re-checks it and reserves atomically via `getNextInvoiceNo()`.

### 6.13 Price lists

`lib/priceList.mjs`. `resolveItemPricing(item, priceList)` returns
`{ rate, discount, mrp, unit, source }`, falling back to the item master
**field by field** — a row with only a discount still bills at the master rate.

---

## 7. API routes

All under `app/api/<name>/route.js`. **All are unauthenticated** (§9).
Most mutations are `POST`, including deletes (id in the query string).

### Invoices
| Route | Method | Notes |
|---|---|---|
| `save-invoice` | POST | Create. Transactional. Derives `balanceDue`, posts both legs, writes ledger + stock, recomputes |
| `sale-alter` | POST | Edit. Reverses the old posting and applies the new one. Looks the row up by `originalInvoiceNo` because `invoiceNo` is itself editable |
| `delete-invoice` | POST `?id=<invoiceNo>` | Reverses via `invoicePostingDeltas`, deletes rows by `voucherId` |
| `invoice` | POST `{value:<no>}` | Fetch one by number |
| `get-invoice` | GET | **All** invoices |
| `invoices-by-date` | GET `?from&to&type` | Date range, capped at 500 |
| `next-invoice-no` | GET | Peek, not a reservation |

### Vouchers
`voucher-add` (POST), `voucher-alter` (POST), `delete-voucher` (POST `?id`),
`voucher` (POST, lookup), `get-voucher` (GET, all). All transactional; all
derive their balance deltas from `buildVoucherBalanceDeltas()`.

### Masters
`customer-add`, `customer-alter`, `delete-cust`, `customer` (lookup),
`get-customer`; `item-add`, `item-alter`, `delete-item`, `item`, `get-item`;
`hsn-add`, `hsn-update`, `delete-hsn`, `get-hsn`;
`price-list-add`, `price-list-update`, `delete-price-list`, `get-price-list`.

Delete routes refuse with **409** when history references the record:
`delete-cust` checks invoices, vouchers and ledger rows; `delete-hsn` checks
items using that code; `delete-item` checks invoices (weakly — see §9.4).
`delete-price-list` is the exception and always succeeds, because invoices keep
the rate they were billed at and nothing else references a list.

### Reports and other
`ledger` (GET `?customerId=<id|0>`), `item-ledger` (GET `?itemId=<id|0>`),
`send-email` (POST, Resend),
`clear-all-data` (DELETE — requires body `{"confirm": "DELETE ALL DATA"}`).

**Response shape.** `{ success: true, ... }` or `{ success: false, error }`.
Not perfectly consistent across older routes; follow the one you are editing.

---

## 8. Frontend conventions

### 8.1 Use the CSS vocabulary — do not hand-roll Tailwind for everything

`app/globals.css` defines a component layer. **Use these classes.** A new page
built from raw Tailwind will not match the app.

```
Layout     .page-shell  .page-shell-wide  .page-header  .page-title
           .page-subtitle  .section-title
Surfaces   .panel  .panel-head  .panel-title  .panel-body
Forms      .field  .field-label  .field-input  .field-input-sm
           .field-select  .field-check  .field-hint
Buttons    .btn + .btn-primary | .btn-secondary | .btn-ghost
                 | .btn-success | .btn-danger ;  .btn-sm  .btn-icon
Tables     .table-wrap  .data-table  (thead/tbody/tfoot are styled for you)
           .data-table .row-opening   — highlights an opening-balance row
Numbers    .num (right + tabular)  .money-dr (green)  .money-cr (red)
Reports    .doc-sheet  .doc-head  .doc-org  .doc-meta  .doc-kind
Modals     .modal-overlay  .modal-card  .modal-title   (non-Radix prompts)
Home       .nav-tile  .nav-tile-icon  .stat-card  .stat-label  .stat-value
Misc       .chip  .empty-state  .no-print
Print      .invoice-doc  .invoice-print-page  .inv-table  .inv-scroll
           .pdf-export  .pdf-export-wide
```

Colours come from HSL CSS variables with a full dark set — use
`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
`bg-primary`, `text-destructive`, `bg-accent`, etc. **Never hard-code a hex
colour.** Every figure in the app lines up on the decimal: put `.num` on money
cells.

### 8.2 Page template

```jsx
'use client';
import React, { useEffect, useState } from 'react';

export default function MyPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-item')
      .then((r) => r.json())
      .then((d) => setRows(d.item || []))
      .catch(() => alert('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-shell text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Page</h1>
          <p className="page-subtitle">What this screen is for.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head"><h2 className="panel-title">Rows</h2></div>
        <div className="panel-body">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th className="num">Rate</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td className="num">{Number(r.salePrice || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <div className="empty-state">Nothing here yet.</div>}
        </div>
      </section>
    </div>
  );
}
```

### 8.3 Patterns in use

- **Every page is `'use client'`** (all 15 of them). Data is fetched in
  `useEffect` from `/api/*`. There is no server-component data fetching, no
  SWR, no React Query.
- Anything reading `useSearchParams` must be wrapped in `<Suspense>` — see
  `components/suspense.jsx`, `LedgerSuspense.jsx`, `VoucherSearchparams.jsx`.
- `alert()` is the error-reporting mechanism throughout. Not pretty, but
  consistent; do not introduce a toast library for one page.
- **Feature toggles** live in `context/SaleOptionContext.js`, persisted to
  `localStorage`, edited on `/setup`: `description`, `shipped`, `dispatch`,
  `calculateByPack`, `rollStationary`, `usePriceList`.
- Invoice drafts persist to `localStorage` via `lib/localStorageHelper.js`.
- **The print page loads by number** — `/invoice?invoiceNo=123` — and fetches
  the saved document. It used to carry the whole invoice in the query string,
  which blew past the request-header limit at ~20 line items. Never put document
  data back in the URL.
- PDF export: `html2canvas` + `jsPDF`, with the `.pdf-export` class pinning the
  node to paper width during capture so a phone produces the same sheet as a
  desktop.

---

## 9. Known issues, drift and landmines

Honest list. Some are deliberate prototype trade-offs; none are secret.

**Blocking before this is used by anyone but the pilot customer**

1. **There is no authentication anywhere.** No login, no session, no API key, no
   middleware. Every route is open to anyone with the URL, including
   `clear-all-data` (which does at least require a confirmation phrase in the
   body) and `get-customer`, which returns every party with PAN, Aadhaar, GST
   number and bank details. There is also **no tenancy** — no `companyId` on any
   model. Making this multi-tenant is a schema change across all ten models.

**Data integrity**

2. **`customers.name` and `items.name` are indexed but NOT unique.** They are
   the join key for every other collection, so a duplicate makes two parties'
   ledgers ambiguous permanently. Duplicates are refused at the application
   level in `customer-add` / `item-add` / `*-alter` (409, case-insensitive),
   which is reliable. A true unique index is still worth adding — but
   de-duplicate the existing data first, because Mongo builds a unique index
   over dirty data by silently failing, leaving you believing you are
   protected. The schema comments say the same.
3. ~~Almost nothing is indexed.~~ **Fixed.** `Ledger`, `ItemLedger`,
   `Invoice`, `Voucher`, `customers` and `items` now carry indexes on the
   fields the reports and the posting routes actually query. New indexes build
   on first connection after deploy.
4. ~~`delete-item` is weaker than its siblings.~~ **Fixed.** It now guards by
   item **name** (so AI-imported lines count) and refuses when stock movements
   exist.

**Duplication — four copies of the billing screen**

5. `saleadd`, `salereturn`, `purchaseadd` and `purchasereturn` are four
   **1,128-line copies of the same screen**, currently differing only in the
   two or three lines that set `type`, `return` and the page heading. All four
   use `resolveItemPricing()`, take the party's latest price list automatically,
   and honour the `usePriceList` toggle in Setup.

   They are in sync today, but nothing keeps them that way — **every change
   must be made four times, and they have drifted before.** The real fix is to
   collapse them into one component parameterised by
   `{ type, isReturn, title, subtitle }`; ~3,300 duplicated lines go away and
   the drift cannot recur.

   *(`saleadd/page.js` is LF, the other three are CRLF, so a raw `diff` looks
   like every line changed. Compare with `diff <(tr -d '\r' < a) <(tr -d '\r' < b)`.)*

**Smaller things**

6. `items.lastQuantity` is never maintained (§5). The stock *report* is correct
   because it recomputes; the master field is stale.
7. ~~The business's details are hard-coded in two places and disagree.~~
   **Fixed.** Everything now reads `lib/company.mjs`. ⚠ **`gstin` and `phone`
   in that file are blank and must be filled in** — blank fields are simply not
   printed, so nothing false goes out, but a GST invoice without a GSTIN is not
   a valid tax invoice.
8. ~22 `console.log` calls and ~55 `alert()`s in production paths. `alert()` is
   the app's only error-reporting mechanism.
9. `save-invoice` spreads `{...body}` into `Invoice.create` — mass assignment.
10. Master-data routes (`customer-add`, `item-add`, `hsn-*`, `delete-item`,
    `delete-hsn`) are **not** transactional. The money paths all are.
11. Deployment URLs still disagree between `main.js` (Electron →
    `vyapaar-ten.vercel.app`) and the FastAPI CORS list
    (`vyapaar-aspx.vercel.app`). The AI-import URL is now configurable via
    `NEXT_PUBLIC_AI_IMPORT_URL` (defaulting to the Render deploy).
12. `capacitor.config.ts` still says `com.example.app`; `README.md` is the
    untouched `create-next-app` template.

---

## 10. Tests and maintenance scripts

```bash
npm test
```

Runs nine suites in `scripts/`. **Run it after any change to `lib/` or to a
posting route.** The suites that matter most:

| Suite | Guards |
|---|---|
| `posting-invariants.test.mjs` | Replays the routes against an in-memory store. Asserts that posting-then-deleting leaves balances untouched and no rows behind, that every account's balance equals its own ledger rows, and that edits cancel exactly |
| `posting-consistency.test.mjs` | Create/edit/delete derive the same figures |
| `invoice-posting.test.mjs` | The two-leg posting rule |
| `voucher-ledger.test.mjs` | Voucher rows and deltas |
| `price-list.test.mjs` | Rate/discount resolution, legacy chain collapse |
| `backfill-hsn-totals.test.mjs` | HSN summary derivation |
| `clear-zero-units.test.mjs`, `migrate-balances.test.mjs`, `rebuild-voucher-ledger.test.mjs` | The migration scripts |

Tests are plain `node:assert` with a tiny `test()` helper — no Jest, no Vitest.
They import `lib/*.mjs` directly, which is why those files must stay free of
Mongoose. `migrate-balances.test.mjs` and `rebuild-voucher-ledger.test.mjs` do
need `mongoose` installed.

**When you fix a bug in posting logic, add a case to
`posting-invariants.test.mjs`, then verify the test fails without your fix.**
A test that cannot fail is worth nothing.

**Maintenance scripts** all follow one pattern: dry-run by default, `--apply` to
commit, and a timestamped JSON backup under `backups/`.

```bash
npm run migrate:balances            # then :apply
npm run rebuild:voucher-ledger      # rebuild ledger rows from vouchers
npm run backfill:hsn-totals         # repair hsnTotals on old invoices
npm run clear:zero-units
npm run reset:data
```

---

## 11. Recipes

### Add a new page

1. `app/<name>/page.js`, `'use client'`, default export.
2. Build it from the §8.2 template and the §8.1 class vocabulary.
3. Fetch from an existing `/api/*` route if one fits; otherwise add
   `app/api/<name>/route.js` returning `{ success, ... }`.
4. Link it from `app/page.js` (a `.nav-tile`) and/or `app/layout.js` if it is
   top-level.
5. If it reads `useSearchParams`, wrap in `<Suspense>`.
6. If it shows money, use `.num` and `toFixed(2)`.

### Add a field to an existing document

1. Declare it in the Mongoose schema. **Mongoose strict mode silently drops
   undeclared fields** — this has bitten this project at least three times
   (`hsnTotals.gstRate`, `hsnTotals.total`, `items.gstAmount`,
   `voucher.customers[].narration`, `shippedTo`/`dispatchFrom`).
2. Add it to the create route **and** the alter route. A field added to only
   one means editing a document wipes it.
3. Add it to the form, and to the print/report view if it should appear there.
4. Old documents will not have it — give it a default or handle `undefined`.

### Add a new master (collection)

Follow the HSN or price-list pattern: model in `models/`, four routes
(`-add`, `-update`/`-alter`, `delete-`, `get-`), a modal component in
`components/`, and wiring in `app/page.js`. Delete routes must refuse when
history references the record.

### Change anything about posting

1. Read §6 in full.
2. Change the rule in `lib/`, in **one** place.
3. Make sure create, edit and delete all call it.
4. Add a case to `posting-invariants.test.mjs`.
5. `npm test`.

---

## 12. Prompt to paste into ChatGPT or Gemini

> I'm working on **Vyapaar**, a Next.js 16 + MongoDB GST billing app for a small
> Indian business. I'm pasting its context file below. Read it fully before
> answering — especially §6, the accounting rules.
>
> Constraints: **JavaScript, not TypeScript. React 18. Mongoose. Tailwind plus
> the component classes in §8.1 — do not hand-roll styling or hard-code
> colours.** Every money write goes through `withTransaction` and passes
> `{ session }` to every query inside it. Create, edit and delete must derive
> their figures from the same function in `lib/`.
>
> When you give me code, give me **complete files or exact
> find-and-replace blocks** — I'll be pasting them in by hand, so partial
> snippets with "..." are not useful. Tell me every file that needs to change,
> including the three sibling billing pages if you touch one of them (§9.5).
>
> My task: _<describe it here>_
>
> ---
>
> _<paste PROJECT_CONTEXT.md here>_

Then paste the specific source files the task touches. For a billing change
that is usually `lib/balance.mjs`, `lib/invoicePosting.mjs` and the route you
are editing; for a UI change, `app/globals.css` plus the nearest existing page
as a style reference.
