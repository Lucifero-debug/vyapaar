import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import State from "../../../models/stateModel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connect();
    const state = await State.find({}).sort({ code: 1 }).lean();
    return NextResponse.json({ success: true, state });
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
