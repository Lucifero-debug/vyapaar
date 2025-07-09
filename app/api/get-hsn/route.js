// app/api/get-hsn/route.js
import {connect} from '../../../lib/mongodb'
import Hsn from '@/models/hsnModel';

export async function GET() {
  try {
    await connect();

    const hsnList = await Hsn.find() // optional sort


    return new Response(JSON.stringify({ success: true, hsn: hsnList }), {
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error fetching HSN codes:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
