import {connect} from '../../../lib/mongodb'
import { NextResponse } from 'next/server'
import Customer from '../../../models/custModel';

export async function POST(req){
    try {
        await connect()
        const customerdata=await req.json(); 
        const value=customerdata.value
        const customer= await Customer.find({   
            $or: [
                { name: value },       // Searching by name
                { group: value },      // Searching by group
            ]
        });
        if (customer.length === 0) {
            return NextResponse.json({ message: "No matching customer found", success: false });
        }

        const final=customer[0]
        return NextResponse.json({message:"Item fetched successfully",success:true,final})
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
}