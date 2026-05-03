import { connect } from "../../../lib/mongodb";
import Item from "@/models/itemModel";
import Customer from '../../../models/custModel'
import Invoice from "../../../models/invoiceModel";
import Hsn from "../../../models/hsnModel";
import Voucher from "../../../models/voucherModel";
import ItemLedger from "@/models/itemLedgerModel";
import Ledger from "../../../models/ledgerModel";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    await connect();

    await Promise.all([
      Item.deleteMany({}),
      Customer.deleteMany({}),
      Invoice.deleteMany({}),
      Hsn.deleteMany({}),
      Voucher.deleteMany({}),
        ItemLedger.deleteMany({}),
        Ledger.deleteMany({}),
    ]);

    return NextResponse.json({
      success: true,
      message: "All data cleared successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}