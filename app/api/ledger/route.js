import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Ledger from "../../../models/ledgerModel";
import Customer from "../../../models/custModel";

export async function GET(req) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // 🟡 CASE 1: ALL CUSTOMERS (customerId = "0")
    if (customerId === "0") {
      const [ledgers, customers] = await Promise.all([
        Ledger.find().sort({ date: 1 }).lean(),
        Customer.find().lean(),
      ]);

      return NextResponse.json({
        success: true,
        all: true,
        customers,
        ledgers,
      });
    }

    // 🟡 CASE 2: SPECIFIC CUSTOMER
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Customer ID is required (use 0 for all customers)." },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(customerId).lean();
    if (!customer)
      return NextResponse.json(
        { success: false, error: "Customer not found." },
        { status: 404 }
      );

    const ledgers = await Ledger.find({
      $or: [{ customerName: customer.name }, { account: customer.name }],
    })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ success: true, customer, ledgers });
  } catch (err) {
    console.error("Ledger API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ledger data.", details: err.message },
      { status: 500 }
    );
  }
}
