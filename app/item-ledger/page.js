'use client';
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import ItemLedgerSearchParams from "../../components/ItemLedgerSearchParams";

const formatQty = (num = 0) => parseFloat(num).toFixed(2);

export default function ItemLedgerPage() {
  const [itemId, setItemId] = useState("");
  const [item, setItem] = useState(null);
  const [ledgers, setLedgers] = useState([]);
  const [allItems, setAllItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch item ledger data
  useEffect(() => {
    if (!itemId) return;

    const fetchItemLedger = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/item-ledger?itemId=${itemId}`);
        if (!res.ok) throw new Error("Failed to fetch item ledger data.");
        const data = await res.json();
if (data.all) {
  // handle all items case
  setAllItems(data.items || []);
  setLedgers(data.ledgers || []);
} else {
  setItem(data.item || null);
  setLedgers(data.ledgers || []);
}

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItemLedger();
  }, [itemId]);

  // Filter by Date
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

  // Group entries by item name
  const groupByItemName = (data) => {
    return data.reduce((acc, entry) => {
      const itemName = entry.itemName || "Unknown Item";
      if (!acc[itemName]) acc[itemName] = [];
      acc[itemName].push(entry);
      return acc;
    }, {});
  };

  if (!itemId)
    return (
      <>
        <Suspense fallback={null}>
          <ItemLedgerSearchParams onValue={setItemId} />
        </Suspense>
        <div className="p-6 text-center text-red-500">No item selected.</div>
      </>
    );

  if (loading) return <div className="p-6 text-center">Loading Item Ledger...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  const filteredEntries = filterByDate(ledgers);
  const groupedItems = groupByItemName(filteredEntries);

  // ==========================
  // 🧮 Render
  // ==========================
  return (
    <>
      <Suspense fallback={null}>
        <ItemLedgerSearchParams onValue={setItemId} />
      </Suspense>

      <div className="max-w-6xl mx-auto my-10 bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 font-mono">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold uppercase text-gray-800">DURGA HARDWARE</h2>
          <p className="text-sm text-gray-600">
            LIG FLATS NO.68, IIIIRD FLOOR, SARITA VIHAR, NEW DELHI-110076
          </p>
          <p className="mt-2 font-semibold text-gray-700 text-lg">
            STOCK LEDGER {item ? `- ${item.name}` : ""}
          </p>
        </div>

        {/* Date Filters */}
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

        {/* Multiple Item Tables */}
{Object.entries(groupedItems).length > 0 ? (
  Object.entries(groupedItems).map(([itemName, entries], idx) => {
    // 🧮 Initialize running balance and totals
const currentItem =
  itemId === "0"
    ? allItems.find((i) => i.name === itemName)
    : item;

let runningQty = currentItem?.openingQuantity || 0;
    let totalReceipt = 0;
    let totalIssue = 0;
    // 🟡 Create opening balance entry
    const openingEntry = {
      date: entries.length > 0 ? entries[0].date : new Date(),
      invoiceNo: "-",
      typeOfVoucher: "Opening Stock",
      partyName: "-",
      receiptQuantity: runningQty > 0 ? runningQty : 0,
      issueQuantity: runningQty < 0 ? Math.abs(runningQty) : 0,
      balanceQuantity: runningQty,
      isOpening: true,
    };

    // 🧾 Process entries with running balance
    const computedEntries = entries.map((entry) => {
      const receipt = entry.receiptQuantity || 0;
      const issue = entry.issueQuantity || 0;
      runningQty += receipt - issue;
      totalReceipt += receipt;
      totalIssue += issue;

      return {
        ...entry,
        balanceQuantity: runningQty,
      };
    });

    // Combine both
    const allEntries = [openingEntry, ...computedEntries];

    // Final balance after all entries
    const finalBalance = runningQty;

    return (
      <div key={idx} className="mb-10 bg-white border border-gray-300 rounded-xl shadow-sm">
        {/* Item Header */}
        <div className="bg-blue-50 border-b border-gray-300 px-4 py-3 flex justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {itemName.toUpperCase()}
          </h3>
          <span className="text-sm text-gray-500">({entries.length} Entries)</span>
        </div>

        {/* Table */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-3 py-2 text-left w-[10%]">DATE</th>
              <th className="px-3 py-2 text-left w-[10%]">INVOICE NO.</th>
              <th className="px-3 py-2 text-left w-[15%]">TYPE OF VOUCHER</th>
              <th className="px-3 py-2 text-left w-[25%]">PARTY NAME</th>
              <th className="px-3 py-2 text-right w-[10%]">RECEIPT QTY</th>
              <th className="px-3 py-2 text-right w-[10%]">ISSUE QTY</th>
              <th className="px-3 py-2 text-right w-[10%]">BALANCE QTY</th>
            </tr>
          </thead>
          <tbody>
            {allEntries.map((entry, i) => (
              <tr
                key={i}
                className={`border-b border-gray-200 ${
                  entry.isOpening ? "bg-yellow-50 font-semibold" : ""
                }`}
              >
                <td className="px-3 py-2 text-gray-700">
                  {entry.date ? new Date(entry.date).toLocaleDateString("en-IN") : "N/A"}
                </td>
                <td className="px-3 py-2 text-gray-700">{entry.invoiceNo || "-"}</td>
                <td className="px-3 py-2 text-gray-700">{entry.typeOfVoucher}</td>
                <td className="px-3 py-2 text-gray-700">{entry.partyName}</td>
                <td className="px-3 py-2 text-right text-green-700">
                  {entry.receiptQuantity ? formatQty(entry.receiptQuantity) : ""}
                </td>
                <td className="px-3 py-2 text-right text-red-700">
                  {entry.issueQuantity ? formatQty(entry.issueQuantity) : ""}
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gray-800">
                  {formatQty(entry.balanceQuantity)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* 🟢 TOTAL ROW */}
          <tfoot>
            <tr className="font-bold bg-gray-100 border-t border-gray-300">
              <td colSpan="4" className="px-3 py-2 text-right">
                TOTAL:
              </td>
              <td className="px-3 py-2 text-right text-green-700">
                {formatQty(totalReceipt)}
              </td>
              <td className="px-3 py-2 text-right text-red-700">
                {formatQty(totalIssue)}
              </td>
              <td className="px-3 py-2 text-right text-gray-800">
                {formatQty(finalBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  })
) : (
  <div className="text-center text-gray-500 italic py-8">
    No item ledger entries found for this item within the selected date range.
  </div>
)}

      </div>
    </>
  );
}
