import { NextResponse } from "next/server";
import Invoice from "@/models/invoiceModel";
import { getNextInvoiceNo, raiseInvoiceCounter } from "@/lib/getNextInvoiceNo";
import Customer from "../../../models/custModel";
import Ledger from "../../../models/ledgerModel";
import { applyDelta } from "@/lib/balance.mjs";
import { resolveCashAccount } from "@/lib/cashAccount.mjs";
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
    const body = await req.json();

    // Invoice, balance, ledger and stock ledger commit together or not at all.
    // The invoice used to be written before the "customer not found" check,
    // which stranded an orphaned invoice on every miss.
    const newInvoice = await withTransaction(async (session) => {
      // Settle the number BEFORE writing. The form supplies one (from the
      // peek endpoint), which two people billing at once would both receive:
      // the unique index turned that into a failed save and a lost invoice.
      // A number that is still free is honoured; anything else is reserved
      // atomically from the counter.
      const requested = Number(body.invoiceNo);
      let invoiceNo;

      if (Number.isFinite(requested) && requested > 0) {
        const taken = await Invoice.findOne({ invoiceNo: requested }, { _id: 1 }, { session }).lean();
        if (taken) {
          invoiceNo = await getNextInvoiceNo(session);
        } else {
          invoiceNo = requested;
          await raiseInvoiceCounter(requested, session);
        }
      } else {
        invoiceNo = await getNextInvoiceNo(session);
      }

      const [invoice] = await Invoice.create([{ ...body, invoiceNo }], { session });

      let cashAccount = null;
      let cashAccountName;

      // CUSTOMER & LEDGER LOGIC
      // Uploads used to skip this entirely, so an AI-imported purchase bill
      // created an invoice and stock rows but never reached payables. An
      // invoice nobody can attribute is refused outright rather than quietly
      // kept outside the books.
      {
        const customer = await Customer.findOne(
          { name: body.customer.name },
          null,
          { session }
        );

        if (!customer) {
          // Rolls the invoice back instead of stranding it.
          throw new AbortTransaction({
            success: false,
            error: "Customer not found",
          });
        }

        // Posting the net `balanceDue` is what made a fully-paid sale vanish:
        // the delta came out as zero and the money received was never booked.
        const deltas = invoicePostingDeltas({
          type: body.type,
          isReturn: Boolean(body.return),
          finalAmount:
            body.finalAmount ??
            Number(body.balanceDue || 0) + Number(body.received || 0),
          received: body.received,
        });

        // `lastBal` is signed (+Dr / -Cr); never read it as a magnitude.
        applyDelta(customer, deltas.partyDelta);
        await customer.save({ session });

        cashAccount = null;
        if (deltas.settled !== 0) {
          cashAccount = await resolveCashAccount(session);
          cashAccountName = cashAccount.name;
          applyDelta(cashAccount, deltas.cashDelta);
          await cashAccount.save({ session });
        }

        await Ledger.create(
          buildInvoiceLedgerRows({
            type: body.type,
            customerName: body.customer.name,
            cashAccountName: cashAccount?.name,
            invoiceNo,
            date: invoice.date || new Date(),
            paymentType: body.paymentType,
            voucherId: invoice._id,
            deltas,
            partyBalance: customer.lastBal,
            cashBalance: cashAccount?.lastBal ?? 0,
          }),
          { session }
        );
      }

      // ITEM LEDGER LOGIC (always runs)
      await writeItemLedgerRows({
        session,
        invoiceNo,
        date: invoice.date || new Date(),
        type: body.type,
        isReturn: Boolean(body.return),
        items: body.items,
        partyName: body.customer?.name,
      });

      // The stored running figures only stay true if the whole account or item
      // is rewritten in order -- a back-dated entry changes everything after it.
      await recomputeLedgerBalances([body.customer?.name, cashAccountName], session);
      await recomputeItemBalances((body.items || []).map((i) => i?.name), session);

      return invoice;
    });

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: "Invoice created and Ledger updated",
    });
  } catch (err) {
    if (err instanceof AbortTransaction) {
      return NextResponse.json(err.payload, { status: err.status });
    }
    console.error("Error creating invoice:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
