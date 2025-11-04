import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Voucher from "../../../models/voucherModel";
import Ledger from "../../../models/ledgerModel";
import Customer from "../../../models/custModel";

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Voucher ID missing" }, { status: 400 });
    }

    // 1️⃣ Fetch voucher before deletion
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    const { acName, customers } = voucher;

    // 2️⃣ Rollback balances (reverse what was done originally)
    for (const entry of customers) {
      const { name, debit = 0, credit = 0 } = entry;
      const amount = debit || credit;

      // Reverse balance change
      if (debit > 0) {
        // Originally customer was debited → reduce that now
        await Customer.findOneAndUpdate(
          { name },
          { $inc: { lastBal: -amount } }
        );
        await Customer.findOneAndUpdate(
          { name: acName },
          { $inc: { lastBal: +amount } }
        );
      } else if (credit > 0) {
        // Originally customer was credited → reverse that now
        await Customer.findOneAndUpdate(
          { name },
          { $inc: { lastBal: +amount } }
        );
        await Customer.findOneAndUpdate(
          { name: acName },
          { $inc: { lastBal: -amount } }
        );
      }
    }

    // 3️⃣ Delete related ledger entries
    await Ledger.deleteMany({ voucherId: id });

    // 4️⃣ Delete voucher itself
    const deletedVoucher = await Voucher.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Voucher and related ledger entries deleted successfully.",
      deletedVoucher,
    });

  } catch (error) {
    console.error("Delete Voucher Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
