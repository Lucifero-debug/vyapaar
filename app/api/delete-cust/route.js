import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Customer from "@/models/custModel";
import Invoice from "../../../models/invoiceModel";

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // still using 'id' param for invoiceNo

    if (!id) {
      return NextResponse.json({ error: "Id missing in query." }, { status: 400 });
    }

        const existingInvoice = await Invoice.findOne({ "customer.custId": id });

    if (existingInvoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer cannot be deleted because invoices exist for this customer.",
          invoiceNo: existingInvoice.invoiceNo,
        },
        { status: 409 } // Conflict
      );
    }

    const deletedCust = await Customer.findByIdAndDelete(id);

    if (!deletedCust) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice deleted successfully",
      success: true,
      deletedCust,
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
