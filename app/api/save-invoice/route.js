import { NextResponse } from 'next/server';
import Invoice from '@/models/invoiceModel';    // your Invoice model
import { getNextInvoiceNo } from '@/lib/getNextInvoiceNo';

export async function POST(req) {

  try {
    const body = await req.json();
    
    const newInvoice = await Invoice.create(body);
    const invoice = await getNextInvoiceNo();
    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
