import { connect } from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import Voucher from '../../../models/voucherModel';
import Ledger from '../../../models/ledgerModel';
import Customer from '../../../models/custModel';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connect();
    const data = await req.json();

    console.log("Received body:", data);

    const { id, acName, date, againstBill, acType, paymentType, customers } = data;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid voucher ID' }, { status: 400 });
    }

    // 1. Fetch the existing voucher
    const existingVoucher = await Voucher.findById(id);
    if (!existingVoucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    // 2. Reverse customer balances and delete old ledger entries
    const previousCustomers = existingVoucher.customers || [];
    for (const old of previousCustomers) {
      const prevAmount = old.debit || old.credit || 0;
      const direction = old.debit ? 1 : -1;

      // Reverse customer balance
      await Customer.findOneAndUpdate(
        { name: old.name },
        { $inc: { lastBal: -direction * prevAmount } }
      );

      // Reverse payer balance (opposite direction)
      await Customer.findOneAndUpdate(
        { name: existingVoucher.acName },
        { $inc: { lastBal: direction * prevAmount } }
      );
    }

    // Remove old ledger entries for this voucher
    await Ledger.deleteMany({ voucherId: id });

    // 3. Update the voucher document
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      id,
      { acName, date, againstBill, acType, paymentType, customers },
      { new: true }
    );

    let totalAmount = 0;

    // 4. Create new ledger entries and update balances
    for (const entry of customers) {
      const { name, debit = 0, credit = 0 } = entry;
      const amount = debit || credit;
      totalAmount += amount;

      // Ledger for customer
      await Ledger.create({
        date,
        account: name,
        type: 'customer',
        debit: 0,
        credit: amount,
        narration: `Voucher update via ${acName}`,
        voucherId: updatedVoucher._id,
      });

      // Ledger for acName (cash/bank)
      await Ledger.create({
        date,
        account: acName,
        type: acType,
        debit: amount,
        credit: 0,
        narration: `Voucher update for ${name}`,
        voucherId: updatedVoucher._id,
      });

      // Update customer balance
      await Customer.findOneAndUpdate(
        { name },
        { $inc: { lastBal: +amount } }
      );
    }

    // Update payer (acName) balance
    await Customer.findOneAndUpdate(
      { name: acName },
      { $inc: { lastBal: -totalAmount } }
    );

    return NextResponse.json({
      message: 'Voucher updated successfully',
      success: true,
      voucher: updatedVoucher,
    });

  } catch (error) {
    console.error("[VOUCHER_UPDATE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
