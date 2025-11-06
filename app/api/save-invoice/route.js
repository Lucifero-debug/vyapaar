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

    // 2️⃣ Get the next invoice number (for display + narration)
    const invoice = await getNextInvoiceNo();

    // 3️⃣ Find the customer
    const customer = await Customer.findOne({ name: body.customer.name });

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: "Customer not found",
      });
    }

    // 4️⃣ Calculate updated balance
    let prevBalance = customer.lastBal || 0;
    let invoiceAmount = body.balanceDue || 0;
    let updatedBalance;

    if (body.type === "Sale") {
      updatedBalance = body.return
        ? prevBalance - invoiceAmount // Sale return → you owe them
        : prevBalance + invoiceAmount; // Normal sale → they owe you
      customer.lastMode = updatedBalance >= 0 ? "Dr" : "Cr";
    } else if (body.type === "Purchase") {
      updatedBalance = body.return
        ? prevBalance + invoiceAmount // Purchase return → they owe you
        : prevBalance - invoiceAmount; // Purchase → you owe them
      customer.lastMode = updatedBalance >= 0 ? "Cr" : "Dr";
    }

    customer.lastBal = Math.abs(updatedBalance);
    await customer.save();

    // 5️⃣ Create Ledger Entry
    const narrationText = `By Invoice No: ${newInvoice.invoiceNo || invoice}`;

    const ledgerEntry = {
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

const existingEntries = await ItemLedger.find({ invoiceNo: newInvoice.invoiceNo });
if (existingEntries.length === 0) {
if (body.items && Array.isArray(body.items)) {
  let newBalance=0;
  for (const item of body.items) {
    const receiptQty =
      body.type === "Purchase" || body.returnType === "SaleReturn"
        ? item.quantity
        : 0;
    const issueQty =
      body.type === "Sale" || body.returnType === "PurchaseReturn"
        ? item.quantity
        : 0;

    // find previous item ledger balance
    const lastEntry = await ItemLedger.findOne({ itemName: item.name }).sort({
      date: -1,
    });



 newBalance = newBalance+receiptQty - issueQty;

await ItemLedger.create({
  date: newInvoice.date || new Date(),
  invoiceNo: newInvoice.invoiceNo || invoice,
  typeOfVoucher: body.type,
  partyName: body.customer.name,
  receiptQuantity: receiptQty,
  issueQuantity: issueQty,
  balanceQuantity: newBalance,
  itemName: item.name,
});

  }
}

}

    // 6️⃣ Create Item Ledger Entries


    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      customerBalance: {
        name: customer.name,
        balance: customer.lastBal,
        mode: customer.lastMode,
      },
      ledgerEntry,
    });
  } catch (err) {
    console.error("Error creating invoice:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
