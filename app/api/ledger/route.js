import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Ledger from "../../../models/ledgerModel";
import Customer from "../../../models/custModel";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    // 🧩 CASE 1: ALL CUSTOMERS (customerId = "0")
    if (customerId === "0") {
      const ledgers = await Ledger.find().sort({ date: 1 }).lean();
      const customers = await Customer.find().lean();

      return NextResponse.json({
        all: true,
        customers,
        ledgers,
      });
    }

    // 🧩 CASE 2: SPECIFIC CUSTOMER
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required (use 0 for all customers)." },
        { status: 400 }
      );
    }

    const customer = await Customer.findById(customerId).lean();
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    // 🧩 Fetch ledger entries where this customer is involved
    const ledgers = await Ledger.find({
      $or: [
        { customerName: customer.name },
        { account: customer.name }
      ],
    })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({
      customer,
      ledgers,
    });
  } catch (error) {
    console.error("Ledger unified API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger data.", details: error.message },
      { status: 500 }
    );
  }
}
