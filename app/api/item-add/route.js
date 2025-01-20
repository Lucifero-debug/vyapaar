import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Item from "../../../models/itemModel";


export async function POST(req) {
    try {
        await connect()
        const itemData = await req.json();    
        const newItem= new Item({
            name:itemData.name,
            hsn:itemData.hsn,
            mrp:itemData.mrp,
            unit:itemData.unit,
            cost:itemData.cost,
            salePrice:itemData.salePrice,
            weight:itemData.weight,
            itemType:itemData.itemType,
            purchasePrice:itemData.purchasePrice,
            gst:itemData.gst,
            discount:itemData.discount,
            group:itemData.group
        })
        
        console.log("hello kon",newItem)
        const savedItem = await newItem.save().catch(err => {
            console.error("Validation Error:", err);
            throw err;
        });
        
    console.log('Saved Item:', savedItem);
    return NextResponse.json({ message: "Email sent successfully",success:true,savedItem});
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
      // Handle saving itemData to your database
  }
  