'use client';
export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from 'react';
import LedgerSearchParams from '../../components/LedgerSuspense';

const formatAmount = (amount = 0) => amount.toFixed(2);

export default function LedgerPage() {
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [vouchers, setVouchers] = useState([]); // 👈 added
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) return;

    const fetchLedger = async () => {
      try {
        setLoading(true);

        // 🧾 Fetch invoices
        const invRes = await fetch(`/api/ledger?customerId=${customerId}`);
        if (!invRes.ok) throw new Error("Failed to fetch customer ledger.");
        const invData = await invRes.json();

        // 💳 Fetch vouchers
        const vouRes = await fetch(`/api/ledger-voucher?customerId=${customerId}`);
        const vouData = vouRes.ok ? await vouRes.json() : [];

        setCustomer(invData.customer || null);
        setInvoices(invData.invoices || []);
        setVouchers(vouData.vouchers || []); // 👈 set vouchers
        console.log("wow",vouData.vouchers[0])
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [customerId]);

  if (!customerId)
    return (
      <>
        <Suspense fallback={null}>
          <LedgerSearchParams onValue={setCustomerId} />
        </Suspense>
        <div className="p-6 text-red-500 text-center">No customer selected.</div>
      </>
    );

  if (loading)
    return <div className="p-6 text-center">Loading ledger...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  // 🧮 Generate voucher-style entries for each invoice
const generateEntries = (invoice) => {
  const itemTotal = invoice.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const taxTotal = (invoice.partyTaxes || []).reduce((sum, t) => sum + (t.total || 0), 0);
  const gstAmount = invoice.gst || 0;
  const finalAmount = invoice.finalAmount || 0;

  // ✅ Ensure debit = credit = finalAmount
  // Credit: Sales + GST + Other taxes
  // Debit: Customer
  const entries = [
    {
      description: `BY ${invoice.taxType?.toUpperCase() || 'SALE'} SALE`,
      debit: 0,
      credit: itemTotal,
    },
    ...(invoice.partyTaxes || []).map((tax) => ({
      description: `BY ${tax.name?.toUpperCase()}`,
      debit: 0,
      credit: tax.total || 0,
    })),
    gstAmount > 0 && {
      description: `BY GST`,
      debit: 0,
      credit: gstAmount,
    },
    {
      description: `TO ${invoice.customer?.name || 'CUSTOMER'}\n(Invoice No. ${invoice.invoiceNo || 'N/A'})`,
      debit: finalAmount,
      credit: 0,
    },
  ].filter(Boolean);

  // For double-checking consistency
  const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

  // If rounding mismatch occurs (like 0.01 difference)
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    const diff = totalDebit - totalCredit;
    entries.push({
      description: diff > 0 ? 'ADJ. CREDIT ROUNDING' : 'ADJ. DEBIT ROUNDING',
      debit: diff < 0 ? Math.abs(diff) : 0,
      credit: diff > 0 ? Math.abs(diff) : 0,
    });
  }

  return entries;
};


  const processedInvoices = invoices.map((invoice) => {
    const entries = generateEntries(invoice);
    const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { type: "invoice", invoice, entries, totalDebit, totalCredit };
  });

  // 🧾 Process vouchers (each voucher can have multiple customers)
// 🧾 Process vouchers (each voucher can have multiple customers)
const processedVouchers = vouchers
  .filter(v => v.customers?.some(c => c.custId === customerId))
  .map((voucher) => {
    // Get total debit/credit of all customers in this voucher
    const totalCustomerDebit = voucher.customers.reduce((sum, c) => sum + (c.debit || 0), 0);
    const totalCustomerCredit = voucher.customers.reduce((sum, c) => sum + (c.credit || 0), 0);

    // The ledger should show:
    // 1️⃣ Cash/Bank A/c
    // 2️⃣ Customer A/c (current customer only)
    const entries = [];

    // 1️⃣ Cash/Bank (Voucher Account)
    // If customer was credited, bank/cash must be debited (and vice versa)
    if (totalCustomerDebit > 0) {
      // Customer got DEBIT (payment received) → Cash/Bank is CREDIT
      entries.push({
        description: `${voucher.acName?.toUpperCase() || 'CASH/BANK'} A/C`,
        debit: 0,
        credit: totalCustomerDebit,
      });
    }
    if (totalCustomerCredit > 0) {
      // Customer got CREDIT (payment made) → Cash/Bank is DEBIT
      entries.push({
        description: `${voucher.acName?.toUpperCase() || 'CASH/BANK'} A/C`,
        debit: totalCustomerCredit,
        credit: 0,
      });
    }

    // 2️⃣ Customer Account (this customer only)
    voucher.customers
      .filter(c => c.custId === customerId)
      .forEach(cust => {
        if (cust.debit > 0) {
          entries.push({
            description: `TO ${voucher.paymentType?.toUpperCase() || ''} - ${voucher.acName || ''}`,
            debit: cust.debit,
            credit: 0,
          });
        }
        if (cust.credit > 0) {
          entries.push({
            description: `BY ${voucher.paymentType?.toUpperCase() || ''} - ${voucher.acName || ''}`,
            debit: 0,
            credit: cust.credit,
          });
        }
      });

    const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    return { type: "voucher", voucher, entries, totalDebit, totalCredit };
  });



  // Merge both for display
  const allEntries = [...processedInvoices, ...processedVouchers];

  const grandTotalDebit = allEntries.reduce((sum, inv) => sum + inv.totalDebit, 0);
  const grandTotalCredit = allEntries.reduce((sum, inv) => sum + inv.totalCredit, 0);

  return (
    <>
      <Suspense fallback={null}>
        <LedgerSearchParams onValue={setCustomerId} />
      </Suspense>

      <div className="max-w-4xl mx-auto my-10 bg-white p-6 rounded-xl shadow-xl border border-gray-200 font-mono">
        {/* 🧾 Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold uppercase">DURGA HARDWARE</h2>
          <p className="text-sm">LIG FLATS NO.68, IIIIRD FLOOR, SARITA VIHAR, NEW DELHI-110076</p>
          <p className="mt-1 font-semibold text-gray-700">
            LEDGER - {customer?.name || 'Customer'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            FOR THE PERIOD FROM <strong>01-04-2024 TO 31-03-2025</strong>
          </p>
        </div>

        {/* 🧾 Combined Invoices + Vouchers */}
        {allEntries.length > 0 ? (
          <>
            {allEntries.map((entryBlock, index) => {
              const date = entryBlock.type === "invoice"
                ? entryBlock.invoice.date
                : entryBlock.voucher.date;

              return (
                <div key={index} className="mb-8 border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full table-fixed text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="w-1/5 px-2 py-2 text-left">DATE</th>
                        <th className="w-2/5 px-2 py-2 text-left">DESCRIPTION</th>
                        <th className="w-1/5 px-2 py-2 text-right">DEBIT</th>
                        <th className="w-1/5 px-2 py-2 text-right">CREDIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-t border-gray-300 px-2 py-2 align-top">
                          {date ? new Date(date).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td colSpan="3" className="border-t border-gray-300 px-2 py-2">
                          {entryBlock.entries.map((entry, i) => (
                            <div key={i} className="flex justify-between items-start mb-1">
                              <span className="whitespace-pre-line">{entry.description}</span>
                              <span className="w-1/5 text-right">{entry.debit ? formatAmount(entry.debit) : ''}</span>
                              <span className="w-1/5 text-right">{entry.credit ? formatAmount(entry.credit) : ''}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-gray-100 border-t border-gray-300">
                        <td colSpan="2" className="px-2 py-2 text-right">TOTAL :-</td>
                        <td className="px-2 py-2 text-right">{formatAmount(entryBlock.totalDebit)}</td>
                        <td className="px-2 py-2 text-right">{formatAmount(entryBlock.totalCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })}

            <div className="border-t border-gray-400 pt-4">
              <table className="w-full table-fixed text-sm border-collapse">
                <tfoot>
                  <tr className="font-bold bg-yellow-100 border-t border-gray-400">
                    <td colSpan="2" className="px-2 py-3 text-right text-lg">GRAND TOTAL :-</td>
                    <td className="px-2 py-3 text-right text-lg">{formatAmount(grandTotalDebit)}</td>
                    <td className="px-2 py-3 text-right text-lg">{formatAmount(grandTotalCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 italic py-8">
            No invoices or vouchers found for this customer.
          </div>
        )}
      </div>
    </>
  );
}
