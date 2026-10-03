import mongoose from "mongoose";
import { type } from "os";


const itemSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a username"],
    },
    hsn:{
        type:String,
        required:[true,"Please provide a Hsn code"],
    },
    short:{
        type:String
    },
   group:{
    type:String,
   }, 
   mrp:{
    type:Number,
   }, 
   cost:{
    type:Number,
   }, 
   unit:{
    type:String,
   }, 
   salePrice:{
    type:Number,
   }, 
   discount:{
    type:Number,
   }, 
   weight:{
    type:Number,
   }, 
   itemType:{
    type:String,
   }, 
   purchasePrice:{
    type:Number
   },
   gst:{
    type:Number
   },
   openingQuantity:{
    type:Number
   },
   lastQuantity:{
    type:Number
   }
})


// Same reasoning as custModel: joined by name everywhere, kept non-unique
// until existing data is known to be clean. `item-add` refuses duplicates.
itemSchema.index({ name: 1 });
itemSchema.index({ hsn: 1 });

const Item= mongoose.models.items || mongoose.model("items",itemSchema)

export default Item