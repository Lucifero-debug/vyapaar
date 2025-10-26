import { NextResponse } from "next/server";
import { connect } from '../../../lib/mongodb';// utility to connect MongoDB
import Voucher from '../../../models/voucherModel'; // Mongoose model

export async function POST(req) {
  try {
    await connect();
    // Parse request body
    const body = await req.json();
    const { acName, date, againstBill, acType, paymentType, customers } = body;

    if (!acName || !date || !paymentType || !customers?.length) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Connect DB

    // Create new voucher document
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
