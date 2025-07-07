'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import AddIcCallOutlinedIcon from '@mui/icons-material/AddIcCallOutlined';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PageContent = () => {

  const searchParams = useSearchParams();
  const contentRef = useRef();

  const generatePDF = async (contentRef) => {
    if (!contentRef.current) return null;
  
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      return pdf.output("dataurlstring");
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
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
  
  const invoiceNo = searchParams.get('invoiceNo');
  const date = searchParams.get('date');
  const customer = searchParams.get('customer');
  const phone = searchParams.get('phone');
  const taxType = searchParams.get('taxType');
  const finalAmount = parseFloat(searchParams.get('finalAmount'));
  const gstAmount = parseFloat(searchParams.get('gstAmount'));
  const gst = parseInt(searchParams.get('gst'));
  const received = parseFloat(searchParams.get('received'));
  const balanceDue = parseFloat(searchParams.get('balanceDue'));
  const stateOfSupply = searchParams.get('stateOfSupply');
  const items = JSON.parse(decodeURIComponent(searchParams.get('items')));
  const partyTaxes = JSON.parse(decodeURIComponent(searchParams.get('partyTaxes')));
  const shippedTo = searchParams.get("shippedTo");
const dispatchFrom = searchParams.get("dispatchFrom");
const transport = searchParams.get("transport");
const grNo = searchParams.get("grNo");
const grDate = searchParams.get("grDate");
const pvtMark = searchParams.get("pvtMark");
const caseDetails = searchParams.get("caseDetails");
const freight = searchParams.get("freight");
const weight = searchParams.get("weight");
const ewayBillNo = searchParams.get("ewayBillNo");
const ewayBillDate = searchParams.get("ewayBillDate");
const orderNo=searchParams.get("orderNo")
const orderDate=searchParams.get("orderDate")



  return (
    <>
      <div 
        ref={contentRef} 
        className="max-w-3xl mx-auto bg-white p-8 border border-gray-300 rounded-md shadow-sm text-gray-900 font-sans"
        style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      >
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
     <div className="flex items-center gap-4">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">Prashant Enterprise</h1>
      <p className="mt-1 text-sm text-gray-600">GSTIN: 12ABCDE3456F7Z8</p>
      <p className="mt-1 text-gray-700 flex items-center gap-1">
        <AddIcCallOutlinedIcon fontSize="small" /> +91 87007 237742
      </p>
    </div>
      <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 shadow-md flex-shrink-0">
      <img src="https://yt3.googleusercontent.com/HxgiHavqWNI6ZLzqaiAI_mOiS6Cp0VKr-BarKsTR-9upQUcD8yv5k5J4rmPYQO8GhuhdscTT=s900-c-k-c0x00ffffff-no-rj" alt="Logo" className="w-full h-full object-cover" />
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
                <p>SGST: {(gst/2).toFixed(2)}%</p>
                <p>CGST: {(gst/2).toFixed(2)}%</p>
              </>
            ) : (
              <p>IGST: {gst}%</p>
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
        <div><span className="font-medium">Freight:</span> ₹{parseFloat(freight).toFixed(2)}</div>
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
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Quantity</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Price (₹)</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Discount (%)</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">HSN Code</th>
              <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
            </tr>
          </thead>
    <tbody>
  {items.map((item, i) => {
    const grossAmount = item.quantity * item.cost;
    const discountAmount = grossAmount * (item.discount / 100);
    const netAmount = grossAmount - discountAmount;

    return (
      <React.Fragment key={i}>
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="py-3 px-4 text-gray-800">{item.name}</td>
          <td className="py-3 px-4 text-center">{item.quantity}</td>
          <td className="py-3 px-4 text-right">₹{item.cost.toFixed(2)}</td>
          <td className="py-3 px-4 text-right">{item.discount.toFixed(2)}%</td>
          <td className="py-3 px-4 text-right">{item.hsn}</td>
          <td className="py-3 px-4 text-right font-semibold">₹{netAmount.toFixed(2)}</td>
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
{partyTaxes?.length > 0 && (
  <section className="max-w-xs ml-auto mt-4 text-right space-y-1">
    <h3 className="text-md font-semibold text-gray-700 mb-2">Additional Taxes:</h3>
    {partyTaxes.map((tax, idx) => (
      <div key={idx} className="text-sm text-gray-600 flex justify-between">
        <span>{tax.name} ({tax.rate ? `${tax.rate}%` : `₹${tax.amount}`}):</span>
        <span>₹{parseFloat(tax.total).toFixed(2)}</span>
      </div>
    ))}
  </section>
)}


        {/* Summary */}
        <section className="max-w-xs ml-auto text-right space-y-1">
          <p className="text-gray-700 text-lg font-semibold">Total: ₹{parseFloat(finalAmount).toFixed(2)}</p>
          <p className="text-gray-600">Received: ₹{received.toFixed(2)}</p>
          <p className="text-gray-600">Balance Due: ₹{balanceDue.toFixed(2)}</p>
           {taxType === 'local' ? (
              <>
                <p>SGST: {(gstAmount/2).toFixed(2)}</p>
                <p>CGST: {(gstAmount/2).toFixed(2)}</p>
              </>
            ) : (
              <p>IGST: {gstAmount}</p>
            )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-300 pt-6 text-center text-gray-600 text-sm">
          <p>Thank you for doing business with us.</p>
          <p>Please contact us if you have any questions about this invoice.</p>
        </footer>
      </div>

      {/* Button */}
      <div className='w-full bg-white flex items-center justify-center mt-6'>
        <button
          onClick={sendInvoice}
          className='w-[28vw] sm:w-[12vw] h-[8vh] sm:h-[6vh] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition-colors'
          type="button"
        >
          Send Invoice
        </button>
      </div>
    </>
  );
}

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default page;
