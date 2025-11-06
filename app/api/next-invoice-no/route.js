// app/api/next-invoice-no/route.js
import { NextResponse } from 'next/server';
import { connect } from '../../../lib/mongodb';
import Counter from '../../../models/counterModel';

export async function GET() {
  try {
    await connect();

    const counter = await Counter.findOne(
      { name: 'invoiceNo' },
    );

    return NextResponse.json({ invoiceNo: counter.value+1 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
