import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Customer from '../../../models/custModel'
import { toSigned, modeOf } from '@/lib/balance.mjs'


export async function POST(req) {
    try {
        await connect()
        const customerData = await req.json();
        // The form sends magnitude + Dr/Cr; storage is signed.
        const openingSigned  = toSigned(customerData.openBal, customerData.openingMode);
        const lastYearSigned = toSigned(customerData.lastBal, customerData.lastMode);

        const newCustomer= new Customer({
            name:customerData.name,
            email:customerData.email,
            openingBal:openingSigned,
            openingMode:modeOf(openingSigned),
            // A new party has no transactions yet, so the running balance IS
            // the opening balance. It used to be seeded from the "last year"
            // field, which is unrelated master data.
            lastBal:openingSigned,
            lastMode:modeOf(openingSigned),
            lastYearBal:lastYearSigned,
            lastYearMode:modeOf(lastYearSigned),
            address:customerData.address,
            pincode:customerData.pincode,
            phone:customerData.phone,
            city:customerData.city,
            state:customerData.state,
            gstIn:customerData.gstIn,
            stateCode:customerData.stateCode,
            pan:customerData.pan,
            aadhar:customerData.aadhar,
            bank:customerData.bank,
            interest:customerData.interest,
            discount:customerData.discount,
            group:customerData.group,
            short:customerData.short,
            dealerType:customerData.dealerType
        })

        const savedCustomer = await newCustomer.save().catch(err => {
            console.error("Validation Error:", err);
            throw err;
        });

        return NextResponse.json({ message: "Customer saved successfully", success: true, savedCustomer });
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
}
