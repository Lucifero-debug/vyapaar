import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Voucher from "../../../models/voucherModel";

/**
 * 🧾 POST: Add a new voucher
 */
export async function POST(req) {
  try {
    await connect();
    const body = await req.json();
    const { acName, date, againstBill, acType, paymentType, customers } = body;

    if (!acName || !date || !paymentType || !customers?.length) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const newVoucher = await Voucher.create({
      acName,
      date,
      againstBill,
      acType,
      paymentType,
      customers,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Voucher added successfully", id: newVoucher._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding voucher:", error);
    return NextResponse.json(
      { error: "Failed to add voucher", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 🧮 GET: Fetch vouchers (optionally filtered by customerId)
 * Example: /api/voucher?customerId=123
 */
export async function GET(req) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    let query = {};
    if (customerId) {
      query = { "customers.custId": customerId };
    }

    const vouchers = await Voucher.find(query).sort({ date: -1 });
    console.log("ani;l",vouchers)

    return NextResponse.json({ vouchers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers", details: error.message },
      { status: 500 }
    );
  }
}
