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
   group:{
    type:String,
    required:[true,"Please provide a group"],
   }, 
   mrp:{
    type:Number,
   }, 
   cost:{
    type:Number,
   }, 
   unit:{
    type:Number,
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
   }
})

const Item= mongoose.models.items || mongoose.model("items",itemSchema)

export default Item