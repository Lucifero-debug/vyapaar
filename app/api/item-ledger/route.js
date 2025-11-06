import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import ItemLedger from "@/models/itemLedgerModel";
import Item from "@/models/itemModel";

export async function GET(req) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ success: false, error: "Item ID is required" });
    }
        if (itemId === "0") {
          const ledgers = await ItemLedger.find().sort({ date: 1 }).lean();
    
          return NextResponse.json({
            all: true,
            ledgers,
          });
        }

    const item = await Item.findById(itemId);
    const ledgers = await ItemLedger.find({ itemName: item.name }).sort({ date: 1 });

    return NextResponse.json({ success: true, item, ledgers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
