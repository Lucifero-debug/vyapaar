'use client';
import React, { useEffect, useState } from 'react';

const toNum = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const round2 = (n) => Number(parseFloat(n || 0).toFixed(2));
const formatAmount = (n = 0) => round2(n).toFixed(2);

export default function VoucherPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/get-invoice');
        const data = await res.json();
        setInvoices(data.invoice || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateEntries = (invoice) => {
    const entries = [];

    // 1️⃣ Parse components safely
    const items = invoice.items || [];
    const taxes = invoice.partyTaxes || [];

    const taxableTotal = round2(
      items.reduce((s, i) => s + toNum(i.taxableAmount || i.total), 0)
    );
    const gstTotal = round2(
      taxes.reduce((s, t) => s + toNum(t.total || t.Amount || 0), 0)
    );

    const freight = round2(toNum(invoice.freight));
    const discount = round2(toNum(invoice.discount || 0));

    // 2️⃣ True Final Amount (for debit)
    const finalComputed = round2(taxableTotal + gstTotal + freight - discount);

    // ========== CREDIT SIDE ==========
    taxes.forEach((t) => {
      entries.push({
        description: `BY ${t.name?.toUpperCase() || 'GST OUTPUT'}`,
        debit: 0,
        credit: round2(toNum(t.total || t.Amount || 0)),
      });
    });

    const saleLabel =
      invoice.taxType?.toLowerCase() === 'central'
        ? 'CENTRAL SALES'
        : 'LOCAL SALES';
    const gstLabel = invoice.gst ? `${invoice.gst}%` : '';
    entries.push({
      description: `BY ${saleLabel} ${gstLabel}`,
      debit: 0,
      credit: taxableTotal,
    });

    if (freight > 0) {
      entries.push({
        description: 'BY CARTAGE ACCOUNT',
        debit: 0,
        credit: freight,
      });
    }

    // ========== DEBIT SIDE ==========
    if (discount > 0) {
      entries.push({
        description: 'TO DISCOUNT ALLOWED',
        debit: discount,
        credit: 0,
      });
    }

    entries.push({
      description: `TO ${invoice.customer?.name?.toUpperCase() || 'CUSTOMER'}`,
      debit: finalComputed,
      credit: 0,
    });

    entries.push({
      description: `(Invoice No. ${invoice.invoiceNo || 'N/A'})`,
      debit: 0,
      credit: 0,
      info: true,
    });

    const totalDebit = round2(entries.reduce((s, e) => s + toNum(e.debit), 0));
    const totalCredit = round2(entries.reduce((s, e) => s + toNum(e.credit), 0));

    return { invoice, entries, totalDebit, totalCredit };
  };

  const processed = invoices.map(generateEntries);
  const grandDebit = round2(processed.reduce((s, p) => s + p.totalDebit, 0));
  const grandCredit = round2(processed.reduce((s, p) => s + p.totalCredit, 0));

  return (
    <div className="max-w-4xl mx-auto my-10 bg-[#f8f9f6] p-6 rounded-xl shadow border border-gray-300 font-mono text-[#222]">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase">DURGA HARDWARE</h2>
        <p className="text-sm">FOR THE PERIOD FROM 01-04-2024 TO 31-03-2026</p>
        <p className="text-xs text-gray-700">SIGFA STYLE VOUCHER REPORT</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        <>
          {processed.map(({ invoice, entries, totalDebit, totalCredit }, idx) => (
            <div
              key={idx}
              className="mb-8 border border-gray-300 rounded-lg bg-[#fcfcfa]"
            >
              <table className="w-full table-fixed text-sm border-collapse">
                <thead>
                  <tr className="bg-[#e9ece3] border-b border-gray-400">
                    <th className="w-[15%] px-2 py-1 text-left">DATE</th>
                    <th className="w-[55%] px-2 py-1 text-left">DESCRIPTION</th>
                    <th className="w-[15%] px-2 py-1 text-right">DEBIT</th>
                    <th className="w-[15%] px-2 py-1 text-right">CREDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-200 ${
                        e.info ? 'text-gray-500 italic' : ''
                      }`}
                    >
                      {i === 0 ? (
                        <td
                          rowSpan={entries.length}
                          className="px-2 py-2 align-top"
                        >
                          {invoice.date
                            ? new Date(invoice.date).toLocaleDateString('en-IN')
                            : ''}
                        </td>
                      ) : null}
                      <td className="px-2 py-1 whitespace-pre-line">
                        {e.description}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {e.debit ? formatAmount(e.debit) : ''}
                      </td>
                      <td className="px-2 py-1 text-right">
                        {e.credit ? formatAmount(e.credit) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-[#e9ece3] border-t border-gray-400">
                    <td colSpan="2" className="text-right px-2 py-1">
                      TOTAL :-
                    </td>
                    <td className="text-right px-2 py-1">
                      {formatAmount(totalDebit)}
                    </td>
                    <td className="text-right px-2 py-1">
                      {formatAmount(totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}

          <div className="border-t border-gray-400 pt-4">
            <table className="w-full table-fixed text-sm border-collapse">
              <tfoot>
                <tr className="font-bold bg-yellow-100 border-t border-gray-400">
                  <td colSpan="2" className="px-2 py-3 text-right text-lg">
                    GRAND TOTAL :-
                  </td>
                  <td className="px-2 py-3 text-right text-lg">
                    {formatAmount(grandDebit)}
                  </td>
                  <td className="px-2 py-3 text-right text-lg">
                    {formatAmount(grandCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
