import {connect} from '../../../lib/mongodb'
import { NextResponse } from 'next/server'
import Customer from '../../../models/custModel'

export async function GET(){
    try {
        await connect()
        const customer=await Customer.find({})
        return NextResponse.json({message:"Customer fetched successfully",success:true,customer})
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
}