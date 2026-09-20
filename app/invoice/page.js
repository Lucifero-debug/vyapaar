'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { splitGst } from '@/lib/gst.mjs';
import AddIcCallOutlinedIcon from '@mui/icons-material/AddIcCallOutlined';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSaleOptions } from '@/context/SaleOptionContext';

const PageContent = () => {

    const { options } = useSaleOptions();
  const isRollStationary = options.rollStationary;
  const searchParams = useSearchParams();
  const contentRef = useRef();
const generatePDF = async (contentRef) => {
  if (!contentRef.current) return null;

  try {
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scaleFactor = 0.7;
    const imgRatio = canvasHeight / canvasWidth;
    const imgPDFHeight = pdfWidth * imgRatio * scaleFactor;

    let heightLeft = imgPDFHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgPDFHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgPDFHeight);
      heightLeft -= pdfHeight;
    }

    // Return the PDF blob URL
    return pdf.output("dataurlstring");
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};


const downloadPDF = async () => {
  const pdfBase64 = await generatePDF(contentRef);

  if (!pdfBase64) {
    alert("Failed to generate PDF");
    return;
  }

  const link = document.createElement("a");
  link.href = pdfBase64;
  link.download = `Invoice_${invoiceNo || "invoice"}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  const sendInvoice = async () => {
    const pdfBase64 = await generatePDF(contentRef);

    if (!pdfBase64) {
      alert("Failed to generate PDF");
      return;
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail: "superstrong8700@gmail.com",
        subject: "Your Invoice from Prashant Enterprise",
        htmlContent: "<p>Please find your invoice attached.</p>",
        pdfBase64: pdfBase64.split(",")[1],
      }),
    });

    if (response.ok) {
      alert("Invoice sent successfully!");
    } else {
      alert("Failed to send invoice");
    }
  };
  
  /**
   * The invoice is READ BACK from the database, by number.
   *
   * Every field used to be packed into the URL -- each line item with the whole
   * item master spread into it, double-encoded. A twenty-line bill came to
   * ~18,000 characters, past both Node's 16KB request-header limit and
   * Vercel's, so printing or reloading such an invoice failed outright. It also
   * meant the printed document was whatever the URL said rather than what was
   * actually saved.
   */
  const invoiceNo = searchParams.get('invoiceNo');
  const [invoice, setInvoice] = useState(null);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    if (!invoiceNo) {
      setLoadState('missing');
      return;
    }

    let cancelled = false;
    setLoadState('loading');

    (async () => {
      try {
        const res = await fetch('/api/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: invoiceNo }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data?.success && data.final) {
          setInvoice(data.final);
          setLoadState('ready');
        } else {
          setLoadState('missing');
        }
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();

    return () => { cancelled = true; };
  }, [invoiceNo]);

  const items = invoice?.items || [];
  const partyTaxes = invoice?.partyTaxes || [];

  // Stored as an array of { hsn, amount, total }; the table below reads a map.
  const hsnTotals = (invoice?.hsnTotals || []).reduce((acc, row) => {
    acc[row.hsn] = { gstRate: row.gstRate, gstAmount: row.amount, total: row.total };
    return acc;
  }, {});

  const date = invoice?.date ? new Date(invoice.date).toISOString().substring(0, 10) : '';
  const customer = invoice?.customer?.name || '';
  const phone = invoice?.customer?.phone || '';
  const taxType = invoice?.taxType || 'local';
  const finalAmount = Number(invoice?.finalAmount) || 0;
  const received = Number(invoice?.received) || 0;
  const balanceDue = Number(invoice?.balanceDue) || 0;
  const stateOfSupply = invoice?.stateOfSupply || '';
  const shippedTo = invoice?.shippedTo || '';
  const dispatchFrom = invoice?.dispatchFrom || '';
  const transport = invoice?.transport || '';
  const grNo = invoice?.grNo || '';
  const grDate = invoice?.grDate ? new Date(invoice.grDate).toLocaleDateString('en-IN') : '';
  const pvtMark = invoice?.pvtMark || '';
  const caseDetails = invoice?.caseDetails || '';
  const freight = invoice?.freight || '';
  const weight = invoice?.weight || '';
  const ewayBillNo = invoice?.ewayBillNo || '';
  const ewayBillDate = invoice?.ewayBillDate ? new Date(invoice.ewayBillDate).toLocaleDateString('en-IN') : '';
  const orderNo = invoice?.orderNo || '';
  const orderDate = invoice?.orderDate ? new Date(invoice.orderDate).toLocaleDateString('en-IN') : '';

// Compute total taxable amount and GST totals.
//
// `??` rather than `||`: a free line or one discounted to nothing has a
// taxableAmount of 0, which is falsy, so it used to fall back to cost x
// quantity and print at full value with full GST on it.
const lineTaxable = (item) =>
  Number(item.taxableAmount ?? (Number(item.cost) || 0) * (Number(item.quantity) || 0)) || 0;

const totalTaxableAmount = items.reduce((sum, item) => sum + lineTaxable(item), 0);
const totalGstAmount = items.reduce(
  (sum, item) => sum + (lineTaxable(item) * (Number(item.gstRate) || 0)) / 100,
  0
);

// SGST and CGST have to add up to the tax actually charged. Halving and
// rounding each side independently disagreed with the total on half of all
// amounts, by a paisa.
const { sgst, cgst } = splitGst(totalGstAmount);

  if (loadState === 'loading') {
    return <div className="page-shell text-sm text-muted-foreground">Loading invoice {invoiceNo}...</div>;
  }

  if (loadState !== 'ready') {
    return (
      <div className="page-shell text-sm text-destructive">
        {loadState === 'missing'
          ? `Invoice ${invoiceNo || ''} could not be found.`
          : 'Could not load this invoice. Please try again.'}
      </div>
    );
  }

  return (
    <>
<div 
  ref={contentRef} 
  className={`mx-auto my-6 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-900 font-sans transition-all duration-300
    ${isRollStationary ? 'max-w-[480px] p-3 text-[12px]' : 'max-w-3xl p-8 text-[14px]'}`}
  style={{
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: "hidden",
  }}
>

        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
     <div className="flex items-center gap-4">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">Prashant Enterprise</h1>
      <p className="mt-1 text-sm text-gray-600">GSTIN: 12ABCDE3456F7Z8</p>
      <p className="mt-1 text-gray-700 flex items-center gap-1">
        <AddIcCallOutlinedIcon fontSize="small" /> +91 87007 23774
      </p>
    </div>
      <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 shadow-md flex-shrink-0">
      <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
    </div>
  </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Invoice No:</p>
            <p className="font-semibold text-lg">{invoiceNo}</p>
            <p className="text-sm text-gray-500 mt-2">Date:</p>
            <p className="font-semibold">{date}</p>
          </div>
        </header>

        {/* Customer Info */}
        <section className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 border-t border-b border-gray-300 py-4">
          <div>
            <h2 className="font-semibold text-gray-700">Bill To:</h2>
            <p className="mt-1">{customer}</p>
            <p>{phone}</p>
            <p>{stateOfSupply}</p>
              {shippedTo && (
      <>
        <h2 className="font-semibold text-gray-700 mt-4">Shipped To:</h2>
        <p>{shippedTo}</p>
      </>
    )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-700">Tax Details:</h2>
            <p className="mt-1">Tax Type: {taxType}</p>
            {taxType === 'local' ? (
              <>
                <p>SGST: {sgst.toFixed(2)}</p>
                <p>CGST: {cgst.toFixed(2)}</p>
              </>
            ) : (
              <p>IGST: {totalGstAmount.toFixed(2)}</p>
            )}
               {dispatchFrom && (
      <>
        <h2 className="font-semibold text-gray-700 mt-4">Dispatch From:</h2>
        <p>{dispatchFrom}</p>
      </>
    )}
          </div>
        </section>

        {/* Transport Details */}
{(transport || grNo || grDate || pvtMark || caseDetails || freight || weight || ewayBillNo || ewayBillDate || orderNo || orderDate) && (
  <section className="mb-6 border border-gray-300 rounded-md p-4 bg-gray-50">
    <h3 className="text-md font-semibold text-gray-700 mb-3">Order Details</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-700">
      {transport && (
        <div><span className="font-medium">Transport:</span> {transport}</div>
      )}
      {grNo && (
        <div><span className="font-medium">GR No:</span> {grNo}</div>
      )}
      {grDate && (
        <div><span className="font-medium">GR Date:</span> {grDate}</div>
      )}
      {pvtMark && (
        <div><span className="font-medium">Pvt Mark:</span> {pvtMark}</div>
      )}
      {caseDetails && (
        <div><span className="font-medium">Case:</span> {caseDetails}</div>
      )}
      {freight && (
        <div><span className="font-medium">Freight:</span> {freight}</div>
      )}
      {weight && (
        <div><span className="font-medium">Weight:</span> {weight} kg</div>
      )}
      {ewayBillNo && (
        <div><span className="font-medium">E-Way Bill No:</span> {ewayBillNo}</div>
      )}
      {ewayBillDate && (
        <div><span className="font-medium">E-Way Bill Date:</span> {ewayBillDate}</div>
      )}
            {orderNo && (
        <div><span className="font-medium">Order No:</span> {orderNo}</div>
      )}
            {orderDate && (
        <div><span className="font-medium">Order Date:</span> {orderDate}</div>
      )}
    </div>
  </section>
)}


        {/* Items Table */}
<table
  className={`border-collapse mb-6 w-full ${
    isRollStationary ? 'text-[11px]' : 'text-sm'
  }`}
  style={{
    tableLayout: "fixed", // ✅ Ensures proper column wrapping
    wordBreak: "break-word",
  }}
>

          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Quantity</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Price (₹)</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Discount (%)</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">HSN Code</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">GST</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
            </tr>
          </thead>
    <tbody>
  {items.map((item, i) => {

    return (
      <React.Fragment key={i}>
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="py-3 px-4 text-gray-800">{item.name}</td>
          <td className="py-3 px-4 text-center">{item.quantity}</td>
          <td className="py-3 px-4 text-right">₹{(Number(item.cost) || 0).toFixed(2)}</td>
          <td className="py-3 px-4 text-right">{(Number(item.discount) || 0).toFixed(2)}%</td>
          <td className="py-3 px-4 text-right">{item.hsn}</td>
          <td className="py-3 px-4 text-right">{item.gstRate || 0}%</td>
          <td className="py-3 px-4 text-right font-semibold">₹{(Number(item.total) || 0).toFixed(2)}</td>
        </tr>
        {item.description && (
          <tr className="border-b border-gray-200 bg-gray-50">
            <td colSpan={5} className="px-4 py-2 text-sm italic text-gray-600">
              Description: {item.description}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>
        </table>

{Object.keys(hsnTotals).length > 0 && (
  <section className="mt-10" style={{ breakInside: 'avoid' }}>
    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-1">
      HSN Code-wise Summary
    </h2>
    <div className="flex justify-start">
<table
  className={`border border-gray-300 w-full ${
    isRollStationary ? 'text-[11px]' : 'text-sm'
  }`}
  style={{
    tableLayout: "fixed",
    wordBreak: "break-word",
  }}
>

        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left border-b border-gray-300">HSN Code</th>
            <th className="py-2 px-4 text-right border-b border-gray-300">GST Rate (%)</th>
            <th className="py-2 px-4 text-right border-b border-gray-300">Taxable Amount (₹)</th>
            <th className="py-2 px-4 text-right border-b border-gray-300">GST Amount (₹)</th>
            <th className="py-2 px-4 text-right border-b border-gray-300">Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(hsnTotals).map(([hsn, data]) => (
            <tr key={hsn} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-4">{hsn}</td>
              <td className="py-2 px-4 text-right">{data.gstRate?.toFixed?.(2) || 0}%</td>
              <td className="py-2 px-4 text-right">
                ₹{(Number(data.total || 0) - Number(data.gstAmount || 0)).toFixed(2)}
              </td>
              <td className="py-2 px-4 text-right">₹{Number(data.gstAmount || 0).toFixed(2)}</td>
              <td className="py-2 px-4 text-right font-medium">₹{Number(data.total || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold">
          <tr>
            <td className="py-2 px-4 text-right" colSpan={2}>Grand Total</td>
            <td className="py-2 px-4 text-right">
              ₹{Object.values(hsnTotals)
                .reduce((sum, d) => sum + ((d.total || 0) - (d.gstAmount || 0)), 0)
                .toFixed(2)}
            </td>
            <td className="py-2 px-4 text-right">
              ₹{Object.values(hsnTotals).reduce((sum, d) => sum + (d.gstAmount || 0), 0).toFixed(2)}
            </td>
            <td className="py-2 px-4 text-right">
              ₹{Object.values(hsnTotals).reduce((sum, d) => sum + (d.total || 0), 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
)}

{partyTaxes?.length > 0 && (
  <section className="max-w-xs ml-auto mt-4 text-right space-y-1">
    <h3 className="text-md font-semibold text-gray-700 mb-2">Additional Overhead:</h3>
    {partyTaxes.map((tax, idx) => (
      <div key={idx} className="text-sm text-gray-600 flex justify-between">
        <span>{tax.name} ({tax.rate ? `${tax.rate}%` : `₹${tax.total}`}):</span>
        <span>₹{parseFloat(tax.total).toFixed(2)}</span>
      </div>
    ))}
  </section>
)}

        {/* Summary */}
           <section className="mt-10 max-w-sm ml-auto text-right" style={{ breakInside: 'avoid' }}>
          <h2 className="text-md font-bold text-gray-800 mb-2 border-b pb-1">Invoice Summary</h2>
          <p><strong>Total:</strong> ₹{finalAmount.toFixed(2)}</p>
          <p><strong>Received:</strong> ₹{received.toFixed(2)}</p>
          <p><strong>Balance Due:</strong> ₹{balanceDue.toFixed(2)}</p>
{taxType === 'local' ? (
  <>
    <p><strong>Taxable Amount:</strong> ₹{totalTaxableAmount.toFixed(2)}</p>
    <p><strong>SGST:</strong> ₹{sgst.toFixed(2)}</p>
    <p><strong>CGST:</strong> ₹{cgst.toFixed(2)}</p>
  </>
) : (
  <>
    <p><strong>Taxable Amount:</strong> ₹{totalTaxableAmount.toFixed(2)}</p>
    <p><strong>IGST:</strong> ₹{totalGstAmount.toFixed(2)}</p>
  </>
)}

        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-300 pt-6 text-center text-gray-600 text-sm">
          <p>Thank you for doing business with us.</p>
          <p>Please contact us if you have any questions about this invoice.</p>
        </footer>
      </div>

      {/* Button */}
      <div className='no-print sticky bottom-0 mt-6 flex items-center justify-center gap-3 border-t border-border bg-card/90 px-4 py-4 backdrop-blur'>
        <button onClick={() => window.print()} className='btn btn-secondary' type="button">
          Print
        </button>
        <button onClick={downloadPDF} className='btn btn-primary' type="button">
          Download Invoice
        </button>
      </div>
    </>
  );
}

const page = () => {
  return (
    <Suspense fallback={<div className="page-shell text-sm text-muted-foreground">Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default page;
