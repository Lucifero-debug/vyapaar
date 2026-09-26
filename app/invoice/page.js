'use client'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import InvoiceDocument from '@/components/InvoiceDocument';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSaleOptions } from '@/context/SaleOptionContext';

const PageContent = () => {

    const { options } = useSaleOptions();
  const isRollStationary = options.rollStationary;
  const searchParams = useSearchParams();
  const contentRef = useRef();

/**
 * The document on screen is responsive -- on a phone the item table scrolls
 * sideways instead of crushing seven columns into 360px. The PDF must not
 * inherit that: a bill downloaded from a phone has to be the same sheet as one
 * downloaded from a desktop. `pdf-export` (see globals.css) pins the node to
 * its paper width and unwraps the scrollers for the duration of the capture.
 */
const generatePDF = async (contentRef) => {
  const node = contentRef.current;
  if (!node) return null;

  node.classList.add('pdf-export');
  if (!isRollStationary) node.classList.add('pdf-export-wide');

  try {
    const canvas = await html2canvas(node, {
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
  } finally {
    node.classList.remove('pdf-export', 'pdf-export-wide');
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
      <div className="px-3 sm:px-4">
<InvoiceDocument ref={contentRef} invoice={invoice} isRollStationary={isRollStationary} />
      </div>

      {/* Button */}
      <div className='no-print sticky bottom-0 mt-6 flex flex-col items-center justify-center gap-2 border-t border-border bg-card/90 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:flex-row sm:gap-3 sm:py-4'>
        <button onClick={() => window.print()} className='btn btn-secondary w-full sm:w-auto' type="button">
          Print
        </button>
        <button onClick={downloadPDF} className='btn btn-primary w-full sm:w-auto' type="button">
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
