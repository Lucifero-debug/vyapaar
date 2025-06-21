'use client';
import React, { useEffect, useState } from 'react';

const formatAmount = (amount) => amount.toFixed(2);

export default function VoucherPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-invoice');
        const data = await response.json();
        setInvoices(data.invoice || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateEntries = (invoice) => {
    const itemTotal = invoice.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    const entries = [
      ...(invoice.partyTaxes || []).map(tax => ({
        description: `BY ${tax.name?.toUpperCase() || 'TAX'}`,
        debit: 0,
        credit: tax.total || 0
      })),
    { description: `BY ${invoice.taxType?.toUpperCase() || 'SALE'} SALE`, debit: 0, credit: invoice.gstAmount },
        { description: `BY ITEM`, debit: 0, credit: itemTotal },
      {
        description: `TO ${invoice.customer?.name || 'Customer'}\n(Invoice No. ${invoice.invoiceNo || 'N/A'})`,
        debit: invoice.finalAmount || 0,
        credit: 0
      },
    ];
    return entries;
  };

  const processedInvoices = invoices.map((invoice) => {
    const entries = generateEntries(invoice);
    const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { invoice, entries, totalDebit, totalCredit };
  });

  const grandTotalDebit = processedInvoices.reduce((sum, inv) => sum + inv.totalDebit, 0);
  const grandTotalCredit = processedInvoices.reduce((sum, inv) => sum + inv.totalCredit, 0);

  return (
    <div className="max-w-4xl mx-auto my-10 bg-white p-6 rounded-xl shadow-xl border border-gray-200 font-mono">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase">DURGA HARDWARE</h2>
        <p className="text-sm">LIG FLATS NO.68, IIIIRD FLOOR, SARITA VIHAR, NEW DELHI-110076</p>
        <p className="mt-1 font-semibold text-gray-700">VOUCHER CHECKLIST</p>
        <p className="text-xs text-gray-600 mt-1">FOR THE PERIOD FROM <strong>01-04-2024 TO 31-03-2025</strong></p>
      </div>

      {!loading && processedInvoices.length > 0 && (
        <>
          {processedInvoices.map(({ invoice, entries, totalDebit, totalCredit }, index) => (
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
  {invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : 'N/A'}
</td>

                    <td colSpan="3" className="border-t border-gray-300 px-2 py-2">
                      {entries.map((entry, i) => (
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
                    <td className="px-2 py-2 text-right">{formatAmount(totalDebit)}</td>
                    <td className="px-2 py-2 text-right">{formatAmount(totalCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}

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
      )}
    </div>
  );
}
