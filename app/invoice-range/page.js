'use client'
import React, { useState } from 'react'
import { Printer } from 'lucide-react';
import InvoiceDocument from '@/components/InvoiceDocument';
import { useSaleOptions } from '@/context/SaleOptionContext';

const today = () => new Date().toISOString().substring(0, 10);
const firstOfMonth = () => `${today().substring(0, 8)}01`;

const TYPE_OPTIONS = [
  { value: 'all', label: 'All invoices' },
  { value: 'sale', label: 'Sale' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'salereturn', label: 'Sale Return' },
  { value: 'purchasereturn', label: 'Purchase Return' },
];

// Print every invoice in a date range in one go, one invoice per sheet.
const Page = () => {
  const { options } = useSaleOptions();
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [type, setType] = useState('all');
  const [invoices, setInvoices] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Any filter change invalidates what is on screen, so Print can't send a stale batch
  const changeFilter = (setter) => (e) => {
    setter(e.target.value);
    setInvoices(null);
  };

  const loadInvoices = async () => {
    if (!from || !to) {
      alert('Please pick both dates');
      return;
    }
    if (from > to) {
      alert('The From date must be on or before the To date');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invoices-by-date?from=${from}&to=${to}&type=${type}`);
      const data = await res.json();
      if (!data.success) {
        alert(`Failed to load invoices: ${data.error}`);
        return;
      }
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading invoices:', err);
      alert('Error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = (invoices || []).reduce((sum, inv) => sum + (Number(inv.finalAmount) || 0), 0);

  return (
    <>
      <div className="no-print page-shell space-y-4">
        <header className="page-header mb-0">
          <div>
            <h1 className="page-title">Print Invoices</h1>
            <p className="page-subtitle">Print every invoice between two dates, one per page.</p>
          </div>
        </header>

        <div className="panel panel-body flex flex-wrap items-end gap-4">
          <div className="field w-44">
            <label className="field-label mb-1">From</label>
            <input type="date" className="field-input" value={from} onChange={changeFilter(setFrom)} />
          </div>
          <div className="field w-44">
            <label className="field-label mb-1">To</label>
            <input type="date" className="field-input" value={to} onChange={changeFilter(setTo)} />
          </div>
          <div className="field w-48">
            <label className="field-label mb-1">Type</label>
            <select className="field-select" value={type} onChange={changeFilter(setType)}>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadInvoices} disabled={loading}>
            {loading ? 'Loading…' : 'Show Invoices'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
            disabled={!invoices || invoices.length === 0}
          >
            <Printer className="h-4 w-4" /> Print All
          </button>
        </div>

        {invoices && (
          <p className="text-sm text-muted-foreground">
            {invoices.length === 0
              ? 'No invoices in this range.'
              : `${invoices.length} ${invoices.length === 1 ? 'invoice' : 'invoices'} · ₹${grandTotal.toFixed(2)} total`}
            {total > invoices.length &&
              ` Showing the first ${invoices.length} of ${total}; narrow the range to print the rest.`}
          </p>
        )}
      </div>

      {invoices && invoices.length > 0 && (
        <div className="px-3 sm:px-4">
          {invoices.map((inv) => (
            <div key={inv._id} className="invoice-print-page">
              <InvoiceDocument invoice={inv} isRollStationary={options.rollStationary} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Page;
