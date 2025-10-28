import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Voucher from "../../../models/voucherModel";



export async function GET(req) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    let query = {};

    // 🧠 If a specific customerId is provided and not "0", filter by it
    if (customerId && customerId !== "0") {
      query = { "customers.custId": customerId };
    }

    const vouchers = await Voucher.find(query).sort({ date: -1 });
    console.log("dogli",vouchers)

    return NextResponse.json({ vouchers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { error: "Failed to fetch vouchers", details: error.message },
      { status: 500 }
    );
  }
}
