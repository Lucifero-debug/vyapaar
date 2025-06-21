import { NextResponse } from "next/server";
import {connect} from '../../../lib/mongodb'
import Item from "../../../models/itemModel";


export async function POST(req) {
    try {
        await connect()
        const itemData = await req.json();    
        const itemId = itemData.id;
       console.log("zinda",itemId)
        // Update the existing item based on the ID
        const updatedItem = await Item.findOneAndUpdate(
            { _id: itemId }, // Filter to find the document to update
            {
                name: itemData.name,
                hsn: itemData.hsn,
                mrp: itemData.mrp,
                unit: itemData.unit,
                cost: itemData.cost,
                salePrice: itemData.salePrice,
                weight: itemData.weight,
                itemType: itemData.itemType,
                purchasePrice: itemData.purchasePrice,  
                gst: itemData.gst,
                discount: itemData.discount,
                group: itemData.group,
            },
            { new: true } // Return the updated document
        ).catch(err => {
            console.error("Update Error:", err);
            throw err;
        });

        console.log('Updated Item:', updatedItem);
        return NextResponse.json({ message: "Item updated successfully", success: true, updatedItem });
    } catch (error) {
        return NextResponse.json({error:error.message},{status:500})
    }
      // Handle saving itemData to your database
  }
  