import { NextResponse } from "next/server";
import Invoice from "../../../models/invoiceModel";
import Customer from "../../../models/custModel";
import Ledger from "../../../models/ledgerModel";
import { balancePipeline, round2, toDisplay } from "@/lib/balance.mjs";
import { findPaymentAccount, resolvePaymentAccount } from "@/lib/cashAccount.mjs";
import {
  buildInvoiceLedgerRows,
  invoicePostingDeltas,
} from "@/lib/invoicePosting.mjs";
import { writeItemLedgerRows } from "@/lib/itemLedger.mjs";
import {
  recomputeItemBalances,
  recomputeLedgerBalances,
} from "@/lib/runningBalances.mjs";
import { withTransaction, AbortTransaction } from "@/lib/withTransaction.mjs";

export async function POST(req) {
  try {
    const invoiceData = await req.json();

    // The invoice number is an editable field on the form, so it cannot also be
    // the lookup key: changing #5 to #6 used to find invoice SIX and overwrite
    // it with #5's contents, leaving #5 untouched. The page sends the number it
    // opened with, and that is what identifies the row.
    const lookupNo = Number(
      invoiceData.originalInvoiceNo ?? invoiceData.invoiceNo
    );
    const nextNo = Number(invoiceData.invoiceNo);

    if (!Number.isFinite(lookupNo)) {
      return NextResponse.json(
        { success: false, error: "Invoice number missing." },
        { status: 400 }
      );
    }

    // Edit and every posting it implies commit together: a failure between them
    // used to leave the party's balance reflecting an invoice that no longer
    // existed in that form.
    const { updatedInvoice, partyName, partyBalance } = await withTransaction(
      async (session) => {
      // Snapshot the invoice as it stands so its old effect can be reversed
      // before the new one is applied.
      const previousInvoice = await Invoice.findOne({ invoiceNo: lookupNo })
        .session(session)
        .lean();

      if (!previousInvoice) {
        throw new AbortTransaction({ success: false, error: "Invoice not found" });
      }

      // Renumbering onto an invoice that already exists would destroy it.
      if (Number.isFinite(nextNo) && nextNo !== lookupNo) {
        const clash = await Invoice.findOne({ invoiceNo: nextNo })
          .session(session)
          .lean();
        if (clash) {
          throw new AbortTransaction({
            success: false,
            error: `Invoice No ${nextNo} already exists.`,
          });
        }
      }

      const nextCustomerName = invoiceData.customer?.name;
      const customer = await Customer.findOne(
        { name: nextCustomerName },
        { _id: 1, name: 1 },
        { session }
      ).lean();

      if (!customer) {
        throw new AbortTransaction({ success: false, error: "Customer not found" });
      }

      // Derived, never trusted — same rule as `save-invoice`, so that what a
      // delete later reverses is exactly what an edit applied.
      const finalAmount = round2(
        invoiceData.finalAmount ??
          Number(invoiceData.balanceDue || 0) + Number(invoiceData.received || 0)
      );
      const received = round2(invoiceData.received);
      const balanceDue = round2(finalAmount - received);

      const updatedInvoice = await Invoice.findOneAndUpdate(
        { invoiceNo: lookupNo },
        {
          invoiceNo: Number.isFinite(nextNo) ? nextNo : lookupNo,
          date: invoiceData.date,
          customer: {
            name: invoiceData.customer.name,
            phone: invoiceData.customer.phone,
            email: invoiceData.customer.email,
            custId: invoiceData.customer.custId,
          },
          paymentType: invoiceData.paymentType,
          stateOfSupply: invoiceData.stateOfSupply,
          taxType: invoiceData.taxType,
          gst: invoiceData.gst,
          totalAmount: invoiceData.totalAmount,
          // finalAmount used to be left out entirely, so an edited invoice kept
          // its original grand total while every other figure moved.
          finalAmount,
          received,
          balanceDue,
          items: invoiceData.items,
          partyTaxes: invoiceData.partyTaxes || [],
          hsnTotals: invoiceData.hsnTotals || [],
          weight: Number(invoiceData.weight) || 0,
          transport: invoiceData.transport || "",
          grNo: invoiceData.grNo || "",
          grDate: invoiceData.grDate ? new Date(invoiceData.grDate) : null,
          orderNo: Number(invoiceData.orderNo) || 0,
          orderDate: invoiceData.orderDate ? new Date(invoiceData.orderDate) : null,
          pvtMark: invoiceData.pvtMark || "",
          caseDetails: invoiceData.caseDetails || "",
          freight: invoiceData.freight || "",
          shippedTo: invoiceData.shippedTo || "",
          dispatchFrom: invoiceData.dispatchFrom || "",
          ewayBillNo: invoiceData.ewayBillNo || "",
          ewayBillDate: invoiceData.ewayBillDate
            ? new Date(invoiceData.ewayBillDate)
            : null,
          type: invoiceData.type,
          return: invoiceData.return || false,
        },
        { new: true, session }
      );

      if (!updatedInvoice) {
        throw new AbortTransaction({ success: false, error: "Invoice not found" });
      }

      // ---- what the invoice used to post, and what it posts now -----------
      const before = invoicePostingDeltas({
        type: previousInvoice.type,
        isReturn: previousInvoice.return,
        finalAmount:
          previousInvoice.finalAmount ??
          Number(previousInvoice.balanceDue || 0) +
            Number(previousInvoice.received || 0),
        received: previousInvoice.received,
      });

      const after = invoicePostingDeltas({
        type: invoiceData.type,
        isReturn: Boolean(invoiceData.return),
        finalAmount,
        received,
      });

      // The reversal belongs to whoever the invoice was billed to BEFORE the
      // edit. Applying it to the new name instead meant that moving an invoice
      // from A to B left A never reversed, and B carrying both A's reversal and
      // its own posting.
      const previousName = previousInvoice.customer?.name;

      // The money may have moved through a different account before the edit
      // (cash yesterday, cheque today), so the old leg is reversed against the
      // account it actually used and the new one applied where it goes now.
      let previousPayName;
      if (before.cashDelta !== 0) {
        const account = await findPaymentAccount(previousInvoice.paymentType, session);
        previousPayName = account?.name;
      }

      let nextPayName;
      if (after.cashDelta !== 0) {
        const account = await resolvePaymentAccount(invoiceData.paymentType, session);
        nextPayName = account.name;
      }

      // One net movement per account. Reversing and re-applying as separate
      // document loads clobbered any account that appeared on both sides --
      // which is every unchanged edit.
      const moves = new Map();
      const move = (name, delta) => {
        if (!name || !delta) return;
        moves.set(name, round2((moves.get(name) || 0) + delta));
      };
      move(previousName, -before.partyDelta);
      move(previousPayName, -before.cashDelta);
      move(customer.name, after.partyDelta);
      move(nextPayName, after.cashDelta);

      const balances = new Map();
      for (const [name, delta] of moves) {
        const updated = await Customer.findOneAndUpdate(
          { name },
          balancePipeline(delta),
          { new: true, session }
        );
        if (updated) balances.set(name, updated.lastBal);
      }

      // ---- rewrite the rows -------------------------------------------------
      // The ledger was never touched here at all, so an edited invoice left its
      // original rows in place and the report drifted from the balance forever.
      await Ledger.deleteMany({ voucherId: updatedInvoice._id }, { session });
      await Ledger.create(
        buildInvoiceLedgerRows({
          type: invoiceData.type,
          customerName: customer.name,
          cashAccountName: nextPayName,
          invoiceNo: updatedInvoice.invoiceNo,
          date: updatedInvoice.date || new Date(),
          paymentType: invoiceData.paymentType,
          voucherId: updatedInvoice._id,
          deltas: after,
          partyBalance: balances.get(customer.name) ?? 0,
          cashBalance: balances.get(nextPayName) ?? 0,
        }),
        { session }
      );

      // Stock was not maintained here either: changing a quantity left the old
      // one in the stock ledger. Clear the old number's rows too, in case the
      // invoice was renumbered.
      if (Number.isFinite(nextNo) && nextNo !== lookupNo) {
        await writeItemLedgerRows({
          session,
          invoiceNo: lookupNo,
          date: updatedInvoice.date || new Date(),
          type: invoiceData.type,
          isReturn: Boolean(invoiceData.return),
          items: [],
          partyName: customer.name,
        });
      }

      await writeItemLedgerRows({
        session,
        invoiceNo: updatedInvoice.invoiceNo,
        date: updatedInvoice.date || new Date(),
        type: invoiceData.type,
        isReturn: Boolean(invoiceData.return),
        items: invoiceData.items,
        partyName: customer.name,
      });

      await recomputeLedgerBalances([...moves.keys()], session);
      await recomputeItemBalances(
        [
          ...(previousInvoice.items || []).map((i) => i?.name),
          ...(invoiceData.items || []).map((i) => i?.name),
        ],
        session
      );

      return {
        updatedInvoice,
        partyName: customer.name,
        partyBalance: balances.get(customer.name) ?? 0,
      };
    });

    return NextResponse.json({
      message: "Invoice updated successfully",
      success: true,
      updatedInvoice,
      customerBalance: {
        name: partyName,
        balance: toDisplay(partyBalance).amount,
        signedBalance: partyBalance,
        mode: toDisplay(partyBalance).mode,
      },
    });
  } catch (error) {
    if (error instanceof AbortTransaction) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
