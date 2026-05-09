import mongoose from "mongoose";
import { type } from "os";


const customerSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    short:{
        type:String
    },
    email:{
        type:String,
    },
   group:{
    type:String,
   }, 
   address:{
    type:String,
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
   stateCode:{
    type:Number,
   }, 
   bank:{
    type:String,
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
    type:String,
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
   },
   dealerType:{
    type:String
   },
   discount:{
    type:Number
   }
})

const Customer= mongoose.models.customers || mongoose.model("customers",customerSchema)

export default Customer