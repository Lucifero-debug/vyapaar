import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";
import Ledger from "../../../models/ledgerModel";
import ItemLedger from "../../../models/itemLedgerModel";
import { applyDelta, invoiceDelta, round2, toDisplay, voucherDelta } from "@/lib/balance.mjs";
import { findCashAccount } from "@/lib/cashAccount.mjs";
import {
  recomputeItemBalances,
  recomputeLedgerBalances,
} from "@/lib/runningBalances.mjs";
import { withTransaction, AbortTransaction } from "@/lib/withTransaction.mjs";

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const invoiceNo = url.searchParams.get("id");

    if (!invoiceNo) {
      return NextResponse.json({ error: "Invoice number missing in query." }, { status: 400 });
    }

    // Invoice, its ledger rows, its stock rows and the balance reversal all
    // commit together — a partial delete used to leave dangling ledger entries
    // or a balance reversed against an invoice that still existed.
    const { deletedInvoice, deleteResult, customer } = await withTransaction(
      async (session) => {
    // === Delete the Invoice ===
    const deletedInvoice = await Invoice.findOneAndDelete(
      { invoiceNo: Number(invoiceNo) },
      { session }
    );

    if (!deletedInvoice) {
      throw new AbortTransaction({ error: "Invoice not found." }, 404);
    }

    // === Build Safe Ledger Delete Query ===
    // Anchored at the end. Unanchored, deleting invoice 12 also matched
    // "By Invoice No: 120", "121" and "1200" and deleted their rows too.
    const escaped = String(invoiceNo).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = [
      {
        narration: {
          $regex: `Invoice No:?\\s*${escaped}\\s*$`,
          $options: "i",
        },
      },
    ];

    // Add voucherId filter only if it’s a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(deletedInvoice._id)) {
      query.push({ voucherId: deletedInvoice._id });
    }

    // Reverse the cash leg by what was actually written, not by recomputing
    // it: invoices raised before the receipt leg existed have no cash rows, and
    // recomputing would move cash that was never posted in the first place.
    const cashAccount = await findCashAccount(session);
    const cashRows = cashAccount
      ? await Ledger.find(
          { voucherId: deletedInvoice._id, customerName: cashAccount.name },
          null,
          { session }
        ).lean()
      : [];
    const cashPosted = cashRows.reduce(
      (sum, row) => round2(sum + voucherDelta({ debit: row.debit, credit: row.credit })),
      0
    );

    const deleteResult = await Ledger.deleteMany({ $or: query }, { session });

    await ItemLedger.deleteMany({ invoiceNo: Number(invoiceNo) }, { session });

    // === Update Customer Balance ===
    const customer = await Customer.findOne(
      { name: deletedInvoice.customer?.name },
      null,
      { session }
    );

    if (customer) {
      // Deleting an invoice reverses exactly what posting it did. The party's
      // NET movement is still balanceDue: the document leg and the receipt leg
      // are equal and opposite around it, so
      // invoiceDelta(final) - invoiceDelta(received) === invoiceDelta(balanceDue).
      applyDelta(
        customer,
        -invoiceDelta({
          type: deletedInvoice.type,
          isReturn: deletedInvoice.return,
          amount: deletedInvoice.balanceDue || 0,
        })
      );
      await customer.save({ session });
    }

    if (cashAccount && cashPosted !== 0) {
      applyDelta(cashAccount, -cashPosted);
      await cashAccount.save({ session });
    }

        await recomputeLedgerBalances(
          [deletedInvoice.customer?.name, cashAccount?.name],
          session
        );
        await recomputeItemBalances(
          (deletedInvoice.items || []).map((i) => i?.name),
          session
        );

        return { deletedInvoice, deleteResult, customer };
      }
    );

    return NextResponse.json({
      message: "Invoice and related ledger entries deleted successfully",
      success: true,
      deletedLedgerCount: deleteResult.deletedCount,
      deletedInvoice,
      updatedCustomer: customer
        ? {
            name: customer.name,
            balance: toDisplay(customer.lastBal).amount,
            signedBalance: customer.lastBal,
            mode: customer.lastMode,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof AbortTransaction) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    console.error("❌ Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
