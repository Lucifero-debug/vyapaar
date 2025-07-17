import { NextResponse } from "next/server";
import { connect } from '../../../lib/mongodb';
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";
import Ledger from '../../../models/ledgerModel'; // Optional: if you're maintaining ledger

export async function POST(req) {
  try {
    await connect();
    const invoiceData = await req.json();
    const invoiceId = invoiceData.invoiceNo;

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { invoiceNo: invoiceId },
      {
        invoiceNo: invoiceData.invoiceNo,
        date: invoiceData.date,
        customer: {
          name: invoiceData.customer.name,
          phone: invoiceData.customer.phone,
          email: invoiceData.customer.email,
        },
        paymentType: invoiceData.paymentType,
        stateOfSupply: invoiceData.stateOfSupply,
        taxType: invoiceData.taxType,
        gst: invoiceData.gst,
        totalAmount: invoiceData.totalAmount,
        received: Number(invoiceData.received) || 0,
        balanceDue: invoiceData.balanceDue,
        items: invoiceData.items,
        partyTaxes: invoiceData.partyTaxes || [],
        weight: Number(invoiceData.weight) || 0,
        transport: invoiceData.transport || '',
        grNo: invoiceData.grNo || '',
        grDate: invoiceData.grDate ? new Date(invoiceData.grDate) : null,
        orderNo: Number(invoiceData.orderNo) || 0,
        orderDate: invoiceData.orderDate ? new Date(invoiceData.orderDate) : null,
        pvtMark: invoiceData.pvtMark || '',
        caseDetails: invoiceData.caseDetails || '',
        freight: invoiceData.freight || '',
        ewayBillNo: invoiceData.ewayBillNo || '',
        ewayBillDate: invoiceData.ewayBillDate ? new Date(invoiceData.ewayBillDate) : null,
        type: invoiceData.type,
        return: invoiceData.return || false,
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' });
    }

    // === Update Customer Balance Logic ===
    const customer = await Customer.findOne({ name: invoiceData.customer.name });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' });
    }

    let prevBalance = customer.lastBal || 0;
    let invoiceAmount = invoiceData.balanceDue || 0;
    let updatedBalance;

    if (invoiceData.type === 'Sale') {
      updatedBalance = invoiceData.return
        ? prevBalance - invoiceAmount
        : prevBalance + invoiceAmount;
      customer.lastMode = updatedBalance >= 0 ? 'Dr' : 'Cr';
    } else if (invoiceData.type === 'Purchase') {
      updatedBalance = invoiceData.return
        ? prevBalance + invoiceAmount
        : prevBalance - invoiceAmount;
      customer.lastMode = updatedBalance >= 0 ? 'Cr' : 'Dr';
    }

    customer.lastBal = Math.abs(updatedBalance);
    await customer.save();
    
    return NextResponse.json({
      message: "Invoice updated successfully",
      success: true,
      updatedInvoice,
      customerBalance: {
        name: customer.name,
        balance: customer.lastBal,
        mode: customer.lastMode
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
