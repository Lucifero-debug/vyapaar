import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Customer from '../../../models/custModel'


export async function POST(req) {
    try {
        await connect()
        const customerData = await req.json();
        const customerId=customerData.id    
        console.log("maanatg",customerData)
        const updatedCustomer= await Customer.findOneAndUpdate({
             _id: customerId   
        },{
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
            statecode:customerData.statecode,
            short:customerData.short,
        },
    {new:true}
).catch(err => {
        console.error("Update Error:", err);
        throw err;
    });
        
        console.log("hello kon",updatedCustomer)
        
    return NextResponse.json({ message: "Customer Updated successfully",success:true,updatedCustomer});
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
      // Handle saving customerData to your database
  }
  