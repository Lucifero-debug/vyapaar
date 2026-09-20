import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Customer from "@/models/custModel";
import Invoice from "../../../models/invoiceModel";
import Voucher from "../../../models/voucherModel";
import Ledger from "../../../models/ledgerModel";

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // still using 'id' param for invoiceNo

    if (!id) {
      return NextResponse.json({ error: "Id missing in query." }, { status: 400 });
    }

    const existingInvoice = await Invoice.findOne({ "customer.custId": id });

    if (existingInvoice) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer cannot be deleted because invoices exist for this customer.",
          invoiceNo: existingInvoice.invoiceNo,
        },
        { status: 409 } // Conflict
      );
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Invoices were the only thing checked, so a party with nothing but
    // voucher activity could be deleted -- leaving ledger rows pointing at an
    // account that no longer exists and its balance effect stranded.
    const existingVoucher = await Voucher.findOne({
      $or: [{ acName: customer.name }, { "customers.name": customer.name }],
    });

    if (existingVoucher) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer cannot be deleted because vouchers exist for this customer.",
        },
        { status: 409 }
      );
    }

    const existingLedger = await Ledger.findOne({
      $or: [{ customerName: customer.name }, { account: customer.name }],
    });

    if (existingLedger) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer cannot be deleted because ledger entries exist for this customer.",
        },
        { status: 409 }
      );
    }

    const deletedCust = await Customer.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Customer deleted successfully",
      success: true,
      deletedCust,
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
