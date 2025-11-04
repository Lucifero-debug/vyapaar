'use client';
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import LedgerSearchParams from "../../components/LedgerSuspense";

const formatAmount = (amount = 0) => amount.toFixed(2);

export default function LedgerPage() {
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [ledgers, setLedgers] = useState([]);
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

        setCustomer(data.customer || null);
        setLedgers(data.ledgers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [customerId]);

  // ------------------------
  // Filter by Date
  // ------------------------
  const filterByDate = (data) => {
    if (!fromDate && !toDate) return data;
    return data.filter((entry) => {
      const entryDate = new Date(entry.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from && entryDate < from) return false;
      if (to && entryDate > to) return false;
      return true;
    });
  };

  if (!customerId)
    return (
      <>
        <Suspense fallback={null}>
          <LedgerSearchParams onValue={setCustomerId} />
        </Suspense>
        <div className="p-6 text-red-500 text-center">No customer selected.</div>
      </>
    );

  if (loading) return <div className="p-6 text-center">Loading ledger...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  // ------------------------
  // 🧾 Process Ledgers (single source)
  // ------------------------
  const processedEntries = ledgers.map((entry) => ({
    date: entry.date,
    customerName: entry.customerName || "Unknown",
    entries: [
      {
        description: entry.narration || `Transaction with ${entry.account || ""}`,
        debit: entry.debit || 0,
        credit: entry.credit || 0,
      },
    ],
    totalDebit: entry.debit || 0,
    totalCredit: entry.credit || 0,
  }));

  // ------------------------
  // Apply Date Filter
  // ------------------------
  const allEntries = filterByDate(processedEntries);

  // Group by customer
  const groupedByCustomer = allEntries.reduce((acc, entry) => {
    const cust = entry.customerName || "Unknown";
    if (!acc[cust]) acc[cust] = [];
    acc[cust].push(entry);
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

      <div className="max-w-6xl mx-auto my-10 bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 font-mono">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase text-gray-800">DURGA HARDWARE</h2>
          <p className="text-sm text-gray-600">
            LIG FLATS NO.68, IIIIRD FLOOR, SARITA VIHAR, NEW DELHI-110076
          </p>
          <p className="mt-2 font-semibold text-gray-700 text-lg">
            LEDGER {customerId === "0" ? "(ALL ACCOUNTS)" : `- ${customer?.name || "Customer"}`}
          </p>
        </div>

        {/* Date Filter Section */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium">From:</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-2 py-1"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium">To:</label>
            <input
              type="date"
              className="border border-gray-300 rounded-md px-2 py-1"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Ledgers */}
        {Object.entries(groupedByCustomer).length > 0 ? (
          Object.entries(groupedByCustomer).map(([custName, entries], idx) => {
            const totalDebit = entries.reduce((sum, e) => sum + e.totalDebit, 0);
            const totalCredit = entries.reduce((sum, e) => sum + e.totalCredit, 0);

            return (
              <div key={idx} className="mb-10 bg-white border border-gray-300 rounded-xl shadow-sm">
                <div className="bg-blue-50 border-b border-gray-300 px-4 py-3 flex justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {custName.toUpperCase()}
                  </h3>
                  <span className="text-sm text-gray-500">({entries.length} Entries)</span>
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-3 py-2 text-left w-[15%]">DATE</th>
                      <th className="px-3 py-2 text-left w-[55%]">DESCRIPTION</th>
                      <th className="px-3 py-2 text-right w-[15%]">DEBIT</th>
                      <th className="px-3 py-2 text-right w-[15%]">CREDIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((block, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="px-3 py-2 text-gray-700">
                          {block.date ? new Date(block.date).toLocaleDateString("en-IN") : "N/A"}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {block.entries.map((entry, j) => (
                            <div key={j}>{entry.description}</div>
                          ))}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-800">
                          {block.totalDebit ? formatAmount(block.totalDebit) : ""}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-800">
                          {block.totalCredit ? formatAmount(block.totalCredit) : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-gray-100 border-t border-gray-300">
                      <td colSpan="2" className="px-3 py-2 text-right">
                        TOTAL:
                      </td>
                      <td className="px-3 py-2 text-right">{formatAmount(totalDebit)}</td>
                      <td className="px-3 py-2 text-right">{formatAmount(totalCredit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 italic py-8">
            No ledger entries found for this customer within the selected date range.
          </div>
        )}
      </div>
    </>
  );
}
