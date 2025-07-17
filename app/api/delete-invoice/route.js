import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";
import Ledger from "../../../models/ledgerModel"; // Optional

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const invoiceNo = url.searchParams.get("id");

    if (!invoiceNo) {
      return NextResponse.json({ error: "Invoice number missing in query." }, { status: 400 });
    }

    const deletedInvoice = await Invoice.findOneAndDelete({ invoiceNo: Number(invoiceNo) });

    if (!deletedInvoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // === Update Customer Balance ===
    const customer = await Customer.findOne({ name: deletedInvoice.customer.name });

    if (customer) {
      let prevBalance = customer.lastBal || 0;
      const invoiceAmount = deletedInvoice.balanceDue || 0;
      let updatedBalance;

      if (deletedInvoice.type === 'Sale') {
        updatedBalance = deletedInvoice.return
          ? prevBalance + invoiceAmount // Reverse of sale return
          : prevBalance - invoiceAmount; // Reverse of normal sale
        customer.lastMode = updatedBalance >= 0 ? 'Dr' : 'Cr';
      } else if (deletedInvoice.type === 'Purchase') {
        updatedBalance = deletedInvoice.return
          ? prevBalance - invoiceAmount // Reverse of purchase return
          : prevBalance + invoiceAmount; // Reverse of purchase
        customer.lastMode = updatedBalance >= 0 ? 'Cr' : 'Dr';
      }

      customer.lastBal = Math.abs(updatedBalance);
      await customer.save();

    }

    return NextResponse.json({
      message: "Invoice deleted successfully",
      success: true,
      deletedInvoice,
      updatedCustomer: customer ? {
        name: customer.name,
        balance: customer.lastBal,
        mode: customer.lastMode
      } : null
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
