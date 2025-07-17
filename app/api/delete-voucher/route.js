import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Voucher from '../../../models/voucherModel';
import Ledger from '../../../models/ledgerModel';
import Customer from '../../../models/custModel';

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Id missing in query." }, { status: 400 });
    }

    // Fetch voucher before deletion for rollback
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found." }, { status: 404 });
    }

    const { acName, customers } = voucher;

    let totalAmount = 0;

    for (const entry of customers) {
      const { name, debit = 0, credit = 0 } = entry;
      const amount = debit || credit;
      totalAmount += amount;

      // Rollback customer balance
      await Customer.findOneAndUpdate(
        { name },
        { $inc: { lastBal: -amount } }
      );

      // Remove ledger entries for this customer related to the voucher
      await Ledger.deleteMany({
        account: name,
        voucherId: voucher._id,
      });
    }

    // Rollback payer (acName) balance
    await Customer.findOneAndUpdate(
      { name: acName },
      { $inc: { lastBal: +totalAmount } }
    );

    // Remove ledger entries for payer account (cash/bank)
    await Ledger.deleteMany({
      account: acName,
      voucherId: voucher._id,
    });

    // Now delete the actual voucher
    const deletedVoucher = await Voucher.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Voucher and ledger entries deleted successfully",
      success: true,
      deletedVoucher,
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
