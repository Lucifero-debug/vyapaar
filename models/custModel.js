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
   // Balances are SIGNED: > 0 means Dr (party owes us), < 0 means Cr (we owe
   // the party). The `*Mode` fields are a denormalised cache of that sign for
   // display; they are never an independent input. Always go through
   // lib/balance.js so the two cannot drift apart.
   openingBal:{
    type:Number,
    default:0
   },
   openingMode:{
    type:String
   },
   // SYSTEM-OWNED. The live running balance, maintained by every invoice and
   // voucher posting via lib/balance.mjs. The customer form must never write
   // it: it used to, which meant editing a phone number silently rewrote the
   // balance with whatever the form had loaded.
   lastBal:{
    type:Number,
    default:0
   },
   lastMode:{
    type:String
   },
   // USER-OWNED. Last year's closing balance, kept as reference master data.
   // This is what the form's "Last Year Balance" field edits; it has no effect
   // on the running balance.
   lastYearBal:{
    type:Number,
    default:0
   },
   lastYearMode:{
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