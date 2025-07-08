import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Invoice from "../../../models/invoiceModel";


export async function POST(req) {
    try {
        await connect()
        const invoiceData = await req.json();    
        const invoiceId = invoiceData.invoiceNo;
        // Update the existing item based on the ID
        console.log("horo",invoiceData)
        const updatedInvoice = await Invoice.findOneAndUpdate(
            { invoiceNo: invoiceId }, // Filter to find the document to update
            {
                invoiceNo: invoiceData.invoiceNo,
                 date: invoiceData.date,
            customer: {
                name: invoiceData.customer.name,
                phone: invoiceData.customer.phone,
                email: invoiceData.customer.email,
            },
            paymentType: invoiceData.paymentType,
            stateOfSupply: invoiceData.stateOfSupply,
            taxType: invoiceData.taxType,
            gst: invoiceData.gst,
            totalAmount: invoiceData.totalAmount,
            received: Number(invoiceData.received) || 0,
            balanceDue: invoiceData.balanceDue,
            items: invoiceData.items,
            partyTaxes: invoiceData.partyTaxes || [],
           weight: Number(invoiceData.weight) || 0,
        transport: invoiceData.transport || '',
        grNo: invoiceData.grNo || '',
        grDate: invoiceData.grDate ? new Date(invoiceData.grDate) : null,
        orderNo: Number(invoiceData.orderNo) || 0,
        orderDate: invoiceData.orderDate ? new Date(invoiceData.orderDate) : null,
        pvtMark: invoiceData.pvtMark || '',
        caseDetails: invoiceData.caseDetails || '',
        freight: invoiceData.freight || '',
        ewayBillNo: invoiceData.ewayBillNo || '',
        ewayBillDate: invoiceData.ewayBillDate ? new Date(invoiceData.ewayBillDate) : null,
            },
            { new: true }
        ).catch(err => {
            console.error("Update Error:", err);
            throw err;
        });

        console.log('Updated Item:', updatedInvoice);
        return NextResponse.json({ message: "Item updated successfully", success: true, updatedInvoice });
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
      // Handle saving itemData to your database
  }
  