import { NextResponse } from 'next/server';
import {connect} from '../../../lib/mongodb'
import Voucher from '../../../models/voucherModel';
import Ledger from '../../../models/ledgerModel';
import Customer from '../../../models/custModel';


export async function POST(req) {
  try {
    await connect();

    const body = await req.json();

    const {
      acName,
      date,
      customers,
      againstBill,
      acType,
      paymentType
    } = body;

    if (!acName || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    console.log("Received data:",req.body)

    const newVoucher = await Voucher.create({
      acName,
      date,
      customers,
      againstBill,
      acType,
      paymentType
    });
 let totalAmount = 0;

    for (const entry of customers) {
      const { name, debit = 0, credit = 0 } = entry;
  const amount = debit || credit;
  totalAmount += amount;

      // Ledger for customer (credited)
      await Ledger.create({
        date,
        account: name,
        type: 'customer',
        debit: 0,
        credit: amount,
        narration: `Voucher entry via ${acName}`,
        voucherId: newVoucher._id
      });

      // Ledger for cash/bank (debited)
      await Ledger.create({
        date,
        account: acName,
        type: acType,
        debit: amount,
        credit: 0,
        narration: `Voucher entry for ${name}`,
        voucherId: newVoucher._id
      });

    // Update customer balance (reduce since payment received)
      await Customer.findOneAndUpdate(
        { name },
        { $inc: { lastBal: +amount } }
      );
    }

    // Update payer (acName) balance (increase since amount is paid out)
    await Customer.findOneAndUpdate(
      { name: acName },
      { $inc: { lastBal: -totalAmount } }
    );

    return NextResponse.json({ message: 'Voucher created successfully', voucher: newVoucher }, { status: 201 });
  } catch (error) {
    console.error('[VOUCHER_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
