'use client';
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import LedgerSearchParams from "../../components/LedgerSuspense";

const formatAmount = (amount = 0) => parseFloat(amount).toFixed(2);

export default function LedgerPage() {
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ------------------------
  // Fetch Ledger Data
  // ------------------------
  useEffect(() => {
    if (!customerId) return;

    const fetchLedger = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ledger?customerId=${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch ledger data.");
        const data = await res.json();
if (data.all) {
  setAllCustomers(data.customers || []);
  setLedgers(data.ledgers || []);
  setCustomer(null);
} else {
  setCustomer(data.customer || null);
  setLedgers(data.ledgers || []);
  setAllCustomers([]);
}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [customerId]);

  // ------------------------
  // Date window
  // ------------------------
  // A row is either before the window, inside it, or after it. Anything before
  // it has to be folded into the opening balance rather than dropped: showing a
  // period while starting from the account's original opening balance is what
  // made every filtered ledger disagree with the unfiltered one.
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  if (to) to.setHours(23, 59, 59, 999);

  const placeInWindow = (entry) => {
    const on = new Date(entry.date);
    if (from && on < from) return "before";
    if (to && on > to) return "after";
    return "inside";
  };

  const movement = (entry) => (entry.debit || 0) - (entry.credit || 0);

  if (!customerId)
    return (
      <>
        <Suspense fallback={null}>
          <LedgerSearchParams onValue={setCustomerId} />
        </Suspense>
        <div className="page-shell">
          <div className="empty-state">No customer selected.</div>
        </div>
      </>
    );

  if (loading) return <div className="page-shell text-center text-sm text-muted-foreground">Loading ledger...</div>;
  if (error) return <div className="page-shell text-center text-sm text-destructive">Error: {error}</div>;

  // ------------------------
  // 🧾 Process Ledgers
  // ------------------------
  // Group EVERY row, not just the ones in the window — the rows before it are
  // what the opening balance is built from.
  const sorted = [...ledgers].sort((a, b) => new Date(a.date) - new Date(b.date));

  const groupedByCustomer = sorted.reduce((acc, entry) => {
    const cust = entry.customerName || "Unknown";
    if (!acc[cust]) acc[cust] = { before: [], inside: [] };
    const place = placeInWindow(entry);
    if (place === "before") acc[cust].before.push(entry);
    else if (place === "inside") acc[cust].inside.push(entry);
    return acc;
  }, {});

  // ------------------------
  // 🧮 Render
  // ------------------------
  return (
    <>
      <Suspense fallback={null}>
        <LedgerSearchParams onValue={setCustomerId} />
      </Suspense>

      <div className="page-shell">
        {/* Header */}
        <div className="doc-head">
          <h2 className="doc-org">DURGA HARDWARE</h2>
          <p className="doc-meta">
            LIG FLATS NO.68, IIIIRD FLOOR, SARITA VIHAR, NEW DELHI-110076
          </p>
          <p className="doc-kind">
            LEDGER {customerId === "0" ? "(ALL ACCOUNTS)" : `- ${customer?.name || "Customer"}`}
          </p>
        </div>

        {/* Date Filter Section */}
        <div className="no-print mb-6 flex flex-wrap items-end justify-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="field">
            <label className="field-label">From:</label>
            <input
              type="date"
              className="field-input w-44"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">To:</label>
            <input
              type="date"
              className="field-input w-44"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-secondary"
          >
            Print
          </button>
        </div>

        {/* Ledgers */}
{Object.entries(groupedByCustomer).length > 0 ? (
  Object.entries(groupedByCustomer).map(([custName, { before, inside }], idx) => {
 const currentCustomer =
    customerId === "0"
      ? allCustomers.find((c) => c.name === custName)
      : customer;

  // Opening as at the START OF THE WINDOW: the account's own opening balance
  // plus everything that happened before it. With no from-date, `before` is
  // empty and this is just the account's opening balance.
  const openingBalance =
    (currentCustomer?.openingBal || 0) +
    before.reduce((sum, e) => sum + movement(e), 0);

  let runningBalance = openingBalance;

  // The opening row carries a debit or a credit like any other, so it counts
  // towards the column totals. Leaving it out meant the Dr and Cr columns
  // visibly failed to add up to the figures printed beneath them.
  let totalDebit = openingBalance > 0 ? openingBalance : 0;
  let totalCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;

    // 🔹 Prepare opening entry
    const computedEntries = [
      {
        date: from || (inside.length > 0 ? inside[0].date : new Date()),
        description: from ? "Opening Balance (as at from-date)" : "Opening Balance",
        debit: openingBalance > 0 ? openingBalance : 0,
        credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
        balance: Math.abs(openingBalance),
        mode: openingBalance >= 0 ? "Dr" : "Cr",
        isOpening: true,
      },
      ...inside.map((e) => {
        const debit = e.debit || 0;
        const credit = e.credit || 0;
        runningBalance += debit - credit;
        totalDebit += debit;
        totalCredit += credit;

        return {
          date: e.date,
          description: e.narration || `Transaction with ${e.account || ""}`,
          debit,
          credit,
          balance: Math.abs(runningBalance),
          mode: runningBalance >= 0 ? "Dr" : "Cr",
        };
      }),
    ];

    return (
      <div key={idx} className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/60 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">{custName.toUpperCase()}</h3>
          <span className="chip">({inside.length} Entries)</span>
        </div>

        <div className="overflow-x-auto"><table className="data-table min-w-[560px]">
          <thead>
            <tr>
              <th className="w-[15%]">DATE</th>
              <th className="w-[45%]">DESCRIPTION</th>
              <th className="w-[10%] text-right">DEBIT</th>
              <th className="w-[10%] text-right">CREDIT</th>
              <th className="w-[20%] text-right">BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {computedEntries.map((entry, i) => (
              <tr
                key={i}
                className={entry.isOpening ? "row-opening" : ""}
              >
                <td className="">
                  {entry.date ? new Date(entry.date).toLocaleDateString("en-IN") : "N/A"}
                </td>
                <td className="">{entry.description}</td>
                <td className="money-dr">
                  {entry.debit ? formatAmount(entry.debit) : ""}
                </td>
                <td className="money-cr">
                  {entry.credit ? formatAmount(entry.credit) : ""}
                </td>
                <td className="num font-semibold">
                  {formatAmount(entry.balance)} {entry.mode}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2" className="num">
                TOTAL:
              </td>
              <td className="num">{formatAmount(totalDebit)}</td>
              <td className="num">{formatAmount(totalCredit)}</td>
              <td className="num">
                {formatAmount(Math.abs(runningBalance))}{" "}
                {runningBalance >= 0 ? "Dr" : "Cr"}
              </td>
            </tr>
          </tfoot>
        </table></div>
      </div>
    );
  })
) : (
  <div className="empty-state">
    No ledger entries found for this customer within the selected date range.
  </div>
)}

      </div>
    </>
  );
}
