import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required." },
        { status: 400 }
      );
    }

    // 🔹 Fetch customer info
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    // 🔹 Fetch invoices linked by customer.custId
    const invoices = await Invoice.find({ "customer.custId": customerId })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ customer, invoices });
  } catch (error) {
    console.error("Ledger API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger data." },
      { status: 500 }
    );
  }
}
