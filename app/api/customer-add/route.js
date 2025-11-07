import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Customer from '../../../models/custModel'


export async function POST(req) {
    try {
        await connect()
        const customerData = await req.json();    
        const newCustomer= new Customer({
            name:customerData.name,
            email:customerData.email,
            openingBal:customerData.openBal,
            lastBal:customerData.lastBal,
            address:customerData.address,
            pincode:customerData.pincode,
            phone:customerData.phone,
            city:customerData.city,
            state:customerData.state,
            gstIn:customerData.gstIn,
            statecode:customerData.statecode,
            pan:customerData.pan,
            aadhar:customerData.aadhar,
            bank:customerData.bank,
            interest:customerData.interest,
            discount:customerData.discount,
            group:customerData.group,
            pan:customerData.pan,
            short:customerData.short,
            openingMode:customerData.openingMode,
            lastMode:customerData.lastMode
        })
        
        const savedCustomer = await newCustomer.save().catch(err => {
            console.error("Validation Error:", err);
            throw err;
        });
        
    console.log('Saved Customer:', savedCustomer);
    return NextResponse.json({ message: "Email sent successfully",success:true,savedCustomer});
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
      // Handle saving customerData to your database
  }
  