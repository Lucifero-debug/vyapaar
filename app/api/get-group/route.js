import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import CustomerGroup from "../../../models/customerGroupModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connect();
    const group = await CustomerGroup.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error("Error fetching customer groups:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
