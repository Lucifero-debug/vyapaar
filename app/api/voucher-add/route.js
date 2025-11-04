import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Voucher from "../../../models/voucherModel";
import Ledger from "../../../models/ledgerModel";
import Customer from "../../../models/custModel";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();
    const { acName, date, againstBill, acType, paymentType, narration, customers } = body;

    if (!acName || !date || !paymentType || !customers?.length) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Create Voucher
    const newVoucher = await Voucher.create({
      acName,
      date,
      againstBill,
      acType,
      paymentType,
      narration, // ✅ main narration stored
      customers,
      createdAt: new Date(),
    });

    // -------------------------
    // LEDGER ENTRIES CREATION
    // -------------------------
    let totalDebit = 0;
    let totalCredit = 0;

    for (const cust of customers) {
      const { name, debit = 0, credit = 0, narration: custNarration } = cust;

      totalDebit += debit;
      totalCredit += credit;

      // 🧾 Customer Ledger Entry
      await Ledger.create({
        customerName: name,
        date,
        account: acName,
        paymentType,
        debit,
        credit,
        narration: custNarration || `Against ${acName}`,
        voucherId: newVoucher._id,
      });

      // 🔄 Update Customer Balance
      const customer = await Customer.findOne({ name });
      if (customer) {
        const newBal =
          customer.lastBal + (debit || 0) - (credit || 0);
        customer.lastBal = Math.abs(newBal);
        customer.lastMode = newBal >= 0 ? "Dr" : "Cr";
        await customer.save();
      }
    }

    // 💰 MAIN ACCOUNT LEDGER ENTRY
    await Ledger.create({
      customerName: acName,
      date,
      account: paymentType, // e.g. Cash or Bank
      paymentType,
      debit: totalCredit, // opposite side
      credit: totalDebit,
      narration: narration || "Main account entry",
      voucherId: newVoucher._id,
    });

    return NextResponse.json(
      { message: "Voucher and ledger entries added successfully", id: newVoucher._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding voucher:", error);
    return NextResponse.json(
      { error: "Failed to add voucher", details: error.message },
      { status: 500 }
    );
  }
}
