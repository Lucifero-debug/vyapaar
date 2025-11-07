import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Item from "@/models/itemModel";
import Invoice from "../../../models/invoiceModel";

export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // still using 'id' param for invoiceNo

    if (!id) {
      return NextResponse.json({ error: "Id missing in query." }, { status: 400 });
    }

        const existingInvoice = await Invoice.findOne({ "items._id": id });

    if (existingInvoice) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete item because it is used in invoice #${existingInvoice.invoiceNo}.`,
          invoiceNo: existingInvoice.invoiceNo,
        },
        { status: 409 } // Conflict
      );
    }

    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Invoice deleted successfully",
      success: true,
      deletedItem,
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
