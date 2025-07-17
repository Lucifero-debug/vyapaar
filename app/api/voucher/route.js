import { connect } from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import Voucher from '../../../models/voucherModel';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connect();
    const invoicedata = await req.json();
    const value = invoicedata.value;

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return NextResponse.json({ error: 'Invalid voucher ID' }, { status: 400 });
    }

    const voucher = await Voucher.findById(value);

    if (!voucher) {
      return NextResponse.json({ message: 'No matching voucher found', success: false });
    }

    return NextResponse.json({
      message: 'Voucher fetched successfully',
      success: true,
      final: voucher
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
