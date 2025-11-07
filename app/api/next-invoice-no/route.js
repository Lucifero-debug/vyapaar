import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Invoice from "../../../models/invoiceModel";

export async function GET() {
  try {
    await connect();

    const lastInvoice = await Invoice.findOne().sort({ invoiceNo: -1 }).lean();

    let nextInvoiceNo = 1; // Default starting number
    if (lastInvoice && lastInvoice.invoiceNo) {
      nextInvoiceNo = Number(lastInvoice.invoiceNo) + 1;
    }

    console.log("Last Invoice:", lastInvoice?.invoiceNo || "None");
    console.log("Next Invoice No:", nextInvoiceNo);

    return NextResponse.json({ invoiceNo: nextInvoiceNo });
  } catch (err) {
    console.error("Error fetching next invoice number:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
