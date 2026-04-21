import { NextResponse } from "next/server";
import Invoice from "@/models/invoiceModel";
import { getNextInvoiceNo } from "@/lib/getNextInvoiceNo";
import Customer from "../../../models/custModel";
import Ledger from "../../../models/ledgerModel";
import { connect } from "../../../lib/mongodb";
import ItemLedger from "../../../models/itemLedgerModel";


export async function POST(req) {
  try {
    await connect();
    const body = await req.json();

    // 1️⃣ Create the invoice first
    const newInvoice = await Invoice.create(body);
    const invoiceNo = newInvoice.invoiceNo || (await getNextInvoiceNo());

    // Flag to check if we should skip customer/accounting logic
    const isUpload = body.source === "upload";

    let updatedBalance = 0;
    let ledgerEntry = null;

    console.log("hello",isUpload)
    // 2️⃣ CUSTOMER & LEDGER LOGIC (Skipped if source is upload)
    if (!isUpload) {
      const customer = await Customer.findOne({ name: body.customer.name });

      if (!customer) {
        return NextResponse.json({
          success: false,
          error: "Customer not found",
        });
      }

      let prevBalance = customer.lastBal || 0;
      let invoiceAmount = body.balanceDue || 0;

      if (body.type === "Sale") {
        updatedBalance = body.return ? prevBalance - invoiceAmount : prevBalance + invoiceAmount;
        customer.lastMode = updatedBalance >= 0 ? "Dr" : "Cr";
      } else if (body.type === "Purchase") {
        updatedBalance = body.return ? prevBalance + invoiceAmount : prevBalance - invoiceAmount;
        customer.lastMode = updatedBalance >= 0 ? "Cr" : "Dr";
      }

      customer.lastBal = Math.abs(updatedBalance);
      await customer.save();

      // Create Ledger Entry
      const narrationText = `By Invoice No: ${invoiceNo}`;
      ledgerEntry = {
        customerName: body.customer.name,
        date: newInvoice.date || new Date(),
        account: body.type === "Sale" ? "Sales Account" : "Purchase Account",
        paymentType: body.paymentType || "Credit",
        debit: body.type === "Sale" ? invoiceAmount : 0,
        credit: body.type === "Purchase" ? invoiceAmount : 0,
        balance: updatedBalance,
        narration: narrationText,
        voucherId: newInvoice._id,
      };
      await Ledger.create(ledgerEntry);
    }

    // 3️⃣ ITEM LEDGER LOGIC (Always runs)
    const existingEntries = await ItemLedger.find({ invoiceNo: invoiceNo });
    if (existingEntries.length === 0 && body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        const receiptQty = body.type === "Purchase" || body.returnType === "SaleReturn" ? item.quantity : 0;
        const issueQty = body.type === "Sale" || body.returnType === "PurchaseReturn" ? item.quantity : 0;

        const lastEntry = await ItemLedger.findOne({ itemName: item.name }).sort({ date: -1 }).lean();
        const prevItemBal = lastEntry ? lastEntry.balanceQuantity : 0;
        const newItemBal = prevItemBal + receiptQty - issueQty;

        await ItemLedger.create({
          date: newInvoice.date || new Date(),
          invoiceNo: invoiceNo,
          typeOfVoucher: body.type,
          partyName: body.customer?.name || "Bulk Upload",
          receiptQuantity: receiptQty,
          issueQuantity: issueQty,
          balanceQuantity: newItemBal,
          itemName: item.name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: isUpload ? "Invoice uploaded successfully (Ledger skipped)" : "Invoice created and Ledger updated",
    });

  } catch (err) {
    console.error("Error creating invoice:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}