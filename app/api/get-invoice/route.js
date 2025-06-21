import Invoice from '../../../models/invoiceModel'
import {connect} from '../../../lib/mongodb'
import { NextResponse } from 'next/server'

// In your /api/get-item.js (or .ts) file
export const dynamic = "force-dynamic";  // Forces this route to be dynamic
export const revalidate = 1;  // Optional: Set revalidation time (in seconds)


export async function GET(){
    try {
        await connect()
        const invoice=await Invoice.find({})
        return NextResponse.json({message:"Invoice fetched successfully",success:true,invoice})
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
}