import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import PriceList from "../../../models/priceListModel";
import Customer from "../../../models/custModel";
import { cleanPriceListItems } from "../../../lib/priceList.mjs";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();

    if (!body.party || !body.date) {
      return NextResponse.json({ success: false, error: "Party and date are required" }, { status: 400 });
    }

    const party = await Customer.findById(body.party);
    if (!party) {
      return NextResponse.json({ success: false, error: "Party not found" }, { status: 404 });
    }

    const priceList = await PriceList.create({
      party: party._id,
      partyName: party.name,
      date: body.date,
      items: cleanPriceListItems(body.items),
      remark: body.remark,
    });

    return NextResponse.json({ success: true, priceList }, { status: 201 });
  } catch (error) {
    console.error("Error adding price list:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
