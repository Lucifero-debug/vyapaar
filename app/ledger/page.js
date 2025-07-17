'use client';
import { useEffect, useState } from "react";

export default function LedgerPage() {
  const [ledger, setLedger] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await fetch("/api/ledger");
        if (!res.ok) throw new Error("Failed to fetch ledger data.");
        const data = await res.json();
        setLedger(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  if (loading) return <div className="p-6">Loading ledger...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-12">
      {Object.keys(ledger).map((account) => {
        const entries = ledger[account];
        const finalBalance = entries.length ? entries[entries.length - 1].balance : 0;

        return (
          <div key={account} className="border rounded-lg p-6 bg-white shadow-md">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-2xl font-bold">{account}</h2>
              <span className="text-lg font-semibold">
                Final Balance: ₹{finalBalance.toFixed(2)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm font-mono border border-gray-300">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 border text-left">Date</th>
                    <th className="px-3 py-2 border text-left">Type</th>
                    <th className="px-3 py-2 border text-left">Account</th>
                    <th className="px-3 py-2 border text-right">Debit (₹)</th>
                    <th className="px-3 py-2 border text-right">Credit (₹)</th>
                    <th className="px-3 py-2 border text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-1 border text-left whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-1 border text-left capitalize">
                        {entry.type}
                      </td>
                      <td className="px-3 py-1 border text-left">
                        {entry.account}
                      </td>
                      <td className="px-3 py-1 border text-right text-green-600">
                        {entry.debit > 0 ? entry.debit.toFixed(2) : ""}
                      </td>
                      <td className="px-3 py-1 border text-right text-red-600">
                        {entry.credit > 0 ? entry.credit.toFixed(2) : ""}
                      </td>
                      <td className="px-3 py-1 border text-right font-semibold">
                        {entry.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
