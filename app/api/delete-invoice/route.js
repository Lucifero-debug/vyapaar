import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";
import Ledger from "../../../models/ledgerModel";
import ItemLedger from "../../../models/itemLedgerModel";

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const invoiceNo = url.searchParams.get("id");

    if (!invoiceNo) {
      return NextResponse.json({ error: "Invoice number missing in query." }, { status: 400 });
    }

    // === Delete the Invoice ===
    const deletedInvoice = await Invoice.findOneAndDelete({ invoiceNo: Number(invoiceNo) });

    if (!deletedInvoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // === Build Safe Ledger Delete Query ===
    const query = [
      { narration: { $regex: `By Invoice No:?\\s*${invoiceNo}`, $options: "i" } },
    ];

    // Add voucherId filter only if it’s a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(deletedInvoice._id)) {
      query.push({ voucherId: deletedInvoice._id });
    }

    const deleteResult = await Ledger.deleteMany({ $or: query });

    console.log("🧾 Ledger delete result:", deleteResult);

        const deleteItemLedgerResult = await ItemLedger.deleteMany({
      invoiceNo: Number(invoiceNo),
    });
    console.log("📦 ItemLedger delete result:", deleteItemLedgerResult);

    // === Update Customer Balance ===
    const customer = await Customer.findOne({ name: deletedInvoice.customer.name });

    if (customer) {
      let prevBalance = customer.lastBal || 0;
      const invoiceAmount = deletedInvoice.balanceDue || 0;
      let updatedBalance;

      if (deletedInvoice.type === "Sale") {
        updatedBalance = deletedInvoice.return
          ? prevBalance + invoiceAmount // reverse sale return
          : prevBalance - invoiceAmount; // reverse normal sale
        customer.lastMode = updatedBalance >= 0 ? "Dr" : "Cr";
      } else if (deletedInvoice.type === "Purchase") {
        updatedBalance = deletedInvoice.return
          ? prevBalance - invoiceAmount // reverse purchase return
          : prevBalance + invoiceAmount; // reverse purchase
        customer.lastMode = updatedBalance >= 0 ? "Cr" : "Dr";
      }

      customer.lastBal = Math.abs(updatedBalance);
      await customer.save();
    }

    return NextResponse.json({
      message: "Invoice and related ledger entries deleted successfully",
      success: true,
      deletedLedgerCount: deleteResult.deletedCount,
      deletedInvoice,
      updatedCustomer: customer
        ? {
            name: customer.name,
            balance: customer.lastBal,
            mode: customer.lastMode,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
