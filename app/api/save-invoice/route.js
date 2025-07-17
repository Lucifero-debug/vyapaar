import { NextResponse } from 'next/server';
import Invoice from '@/models/invoiceModel';    // your Invoice model
import { getNextInvoiceNo } from '@/lib/getNextInvoiceNo';
import Customer from '../../../models/custModel'

export async function POST(req) {

  try {
    const body = await req.json();
    
    const newInvoice = await Invoice.create(body);
    const invoice = await getNextInvoiceNo();
    const customer = await Customer.findOne({ name: body.customer.name });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' });
    }

   // After saving invoice and fetching the customer
let prevBalance = customer.lastBal || 0;
let invoiceAmount = body.balanceDue || 0;

let updatedBalance;

if (body.type === 'Sale') {
  updatedBalance = body.return
    ? prevBalance - invoiceAmount  // Sale return → you owe them
    : prevBalance + invoiceAmount; // Normal sale → they owe you
  customer.lastMode = updatedBalance >= 0 ? 'Dr' : 'Cr';
} else if (body.type === 'Purchase') {
  updatedBalance = body.return
    ? prevBalance + invoiceAmount  // Purchase return → they owe you
    : prevBalance - invoiceAmount; // Purchase → you owe them
  customer.lastMode = updatedBalance >= 0 ? 'Cr' : 'Dr'; // You are the debtor
}

customer.lastBal = Math.abs(updatedBalance);
await customer.save();

    return NextResponse.json({ success: true, invoice: newInvoice, customerBalance: {
        name: customer.name,
        balance: customer.lastBal,
        mode: customer.lastMode
      } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
