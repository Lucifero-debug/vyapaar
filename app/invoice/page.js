'use client'
import React, { Suspense, useRef } from 'react'
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
      const canvas = await html2canvas(contentRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 160);
      return pdf.output("dataurlstring"); // Returns the PDF as a base64 string
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
        pdfBase64: pdfBase64.split(",")[1], // Remove the dataurl prefix
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
  const totalAmount = searchParams.get('totalAmount');
  const gst = parseInt(searchParams.get('gst'));
  const received = parseFloat(searchParams.get('received'));
  const balanceDue = parseFloat(searchParams.get('balanceDue'));
  const stateOfSupply = searchParams.get('stateOfSupply');
  const items = JSON.parse(decodeURIComponent(searchParams.get('items')));

  console.log("project",customer)

  return (
    <>
    <div className="p-8 bg-white border rounded-lg" ref={contentRef}>
      <h1 className="text-2xl font-bold bg-white">Prashant enterprise</h1>
      <div className='bg-white flex mt-4'>
        <AddIcCallOutlinedIcon style={{background:'white'}}/>
        &nbsp;87007237742
      </div>
      <hr className="my-4 bg-black" />
      <p className='bg-white'>Invoice Number: {invoiceNo}</p>
      <p className='bg-white'>Date: {date}</p>
      <p className='bg-white'>Customer: {customer}</p>
      <p className='bg-white'>Phone No: {phone}</p>
      <p className='bg-white'>State: {stateOfSupply}</p>
      <hr className="my-4" />
      <table className="w-full border-collapse">
        <thead className='bg-gray-500'>
          <tr>
            <th className="border p-2 bg-gray-400">Item</th>
            <th className="border p-2 bg-gray-400">Quantity</th>
            <th className="border p-2 bg-gray-400">Price</th>
            <th className="border p-2 bg-gray-400">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border p-2 bg-gray-300">{item.name}</td>
              <td className="border p-2 bg-gray-300">{item.quantity}</td>
              <td className="border p-2 bg-gray-300">
                <div className='flex flex-col'>
                  <p className='bg-gray-300'>₹{item.cost}</p>
                  <p className='bg-gray-300'>Discount: {item.discount}%</p>
                </div>
              </td>
              <td className="border p-2 bg-gray-300">₹{item.quantity*item.cost-(item.quantity*item.cost*(item.discount/100))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-right font-bold mt-4 bg-white">Total: ₹{totalAmount}</p>
      <p className="text-right bg-white">Received: ₹{received.toFixed(2)}</p>
      <p className="text-right bg-white">Balance: ₹{balanceDue.toFixed(2)}</p>
      {taxType=='local'?(
        <>
        <p className="text-right bg-white">Tax IGST {gst/2}%</p>
        <p className="text-right bg-white">Tax CGST {gst/2}%</p>
        </>
      ):(
        <p className="text-right bg-white">Tax CGST {gst}%</p>
      )}
      <p className='bg-white mt-6'>Thanks For Doing Business With Us</p>
    </div>
    <div className='w-full bg-white flex items-center justify-center'>
      <button className='w-[24vw] sm:w-[8vw] h-[8vh] sm:h-[6vh] bg-red-500' onClick={sendInvoice}>Generate Image</button>
    </div>
    </>
  )
}

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default page;
