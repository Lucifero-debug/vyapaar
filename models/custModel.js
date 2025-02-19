import mongoose from "mongoose";
import { type } from "os";


const customerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a username"],
    },
    email:{
        type:String,
        required:[true,"Please provide a email"],
    },
   group:{
    type:String,
    required:[true,"Please provide a group"],
   }, 
   address:{
    type:String,
    required:[true,"Please provide a address"],
   }, 
   city:{
    type:String,
   }, 
   state:{
    type:String,
   }, 
   pincode:{
    type:Number,
   }, 
   phone:{
    type:Number,
   }, 
   statecode:{
    type:Number,
   }, 
   bank:{
    type:Number,
   }, 
   pan:{
type:String,
   },
   discount:{
    type:Number,
   }, 
   interest:{
    type:Number,
   }, 
   state:{
    type:String,
   }, 
   aadhar:{
    type:Number,
   }, 
   gstIn:{
    type:String,
   }, 
   openingBal:{
    type:Number
   },
   openingMode:{
    type:String
   },
   lastBal:{
    type:Number
   },
   lastMode:{
    type:String
   }
})

const Customer= mongoose.models.customers || mongoose.model("customers",customerSchema)

export default Customer