// app/api/hsn-update/route.js
import { NextResponse } from 'next/server';
import {connect} from '../../../lib/mongodb'
import Hsn from "../../../models/hsnModel";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();

    const { hsncode, hsnname, gst, gstunit,id } = body;

    if (!hsncode) {
      return NextResponse.json({ success: false, message: "HSN code is required" }, { status: 400 });
    }

    const updated = await Hsn.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          hsnname: hsnname,
          hsncode:hsncode,
          gst: gst,
          gstunit: gstunit,
        }
      },
      { new: true } // return the updated document
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: "HSN code not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating HSN:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
