import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Invoice from "../../../models/invoiceModel";

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const invoiceNo = url.searchParams.get("id"); // still using 'id' param for invoiceNo

    if (!invoiceNo) {
      return NextResponse.json({ error: "Invoice number missing in query." }, { status: 400 });
    }

    const deletedInvoice = await Invoice.findOneAndDelete({ invoiceNo: Number(invoiceNo) });

    if (!deletedInvoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice deleted successfully",
      success: true,
      deletedInvoice,
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
