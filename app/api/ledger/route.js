import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // ✅ CASE 1: If customerId = 0 → fetch all customers & all invoices
    if (customerId === "0") {
      const customers = await Customer.find().lean();
      const invoices = await Invoice.find().sort({ date: 1 }).lean();

      return NextResponse.json({
        all: true,
        customers,
        invoices,
      });
    }

    // ✅ CASE 2: If no customerId provided
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required (use 0 for all customers)." },
        { status: 400 }
      );
    }

    // ✅ CASE 3: Fetch for a specific customer
    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

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
