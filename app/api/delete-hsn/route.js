import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Hsn from "../../../models/hsnModel";


export async function POST(req) {
  try {
    await connect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // still using 'id' param for invoiceNo

    if (!id) {
      return NextResponse.json({ error: "Id missing in query." }, { status: 400 });
    }

    const deletedHsn = await Hsn.findByIdAndDelete(id);

    if (!deletedHsn) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Hsn deleted successfully",
      success: true,
      deletedHsn,
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
