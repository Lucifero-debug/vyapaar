import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Hsn from "../../../models/hsnModel";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();

    const { hsncode, hsnname, gst, gstunit } = body;

    if (!hsncode || !gst) {
      return new Response(JSON.stringify({ success: false, error: 'HSN and GST are required' }), {
        status: 400,
      });
    }

    // Check for duplicate HSN
    const existing = await Hsn.findOne({ hsncode });
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: 'HSN already exists' }), {
        status: 400,
      });
    }

    const newHsn = await Hsn.create({ hsncode, hsnname, gst, gstunit });

    return new Response(JSON.stringify({ success: true, hsn: newHsn }), {
      status: 201,
    });
  } catch (error) {
    console.error('❌ Error adding HSN:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
