import {connect} from '../../../lib/mongodb'
import { NextResponse } from 'next/server'
import Invoice from '../../../models/invoiceModel';

export async function POST(req){
    try {
        await connect()
        const invoicedata=await req.json(); 
        console.log("achaa",invoicedata)
        const value=parseInt(invoicedata.value)
        const invoice= await Invoice.find({   
            $or: [
                { invoiceNo: value },       // Searching by name
            ]
        });
        if (invoice.length === 0) {
            return NextResponse.json({ message: "No matching invoice found", success: false });
        }

        const final=invoice[0]
        return NextResponse.json({message:"Invoice fetched successfully",success:true,final})
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
}