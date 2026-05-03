// app/api/hsn-update/route.js

import { NextResponse } from "next/server";
import { connect } from "../../../lib/mongodb";
import Hsn from "../../../models/hsnModel";
import Item from "../../../models/itemModel"; // use Item model instead of Product

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();

    const { hsncode, hsnname, gst, gstunit, id } = body;

    if (!hsncode) {
      return NextResponse.json(
        {
          success: false,
          message: "HSN code is required",
        },
        { status: 400 }
      );
    }

    // 1. Get old HSN record first
    const existingHsn = await Hsn.findById(id);

    if (!existingHsn) {
      return NextResponse.json(
        {
          success: false,
          message: "HSN code not found",
        },
        { status: 404 }
      );
    }

    const oldHsnCode = existingHsn.hsncode;

    // 2. Update HSN master table
    const updated = await Hsn.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          hsnname,
          hsncode,
          gst,
          gstunit,
        },
      },
      { new: true }
    );

    // 3. Update all items using old HSN code
    await Item.updateMany(
      { hsn: oldHsnCode }, // item schema uses "hsn"
      {
        $set: {
          hsn: hsncode,
          gst: gst, // item schema has gst
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "HSN and related items updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating HSN:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}