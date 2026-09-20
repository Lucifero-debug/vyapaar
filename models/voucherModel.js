import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  acName: {
    type: String,
    required: [true, "Please provide an Ac Name"],
  },
   date: { type: Date }, 

customers: [
  {
    name: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    custId:{type:String},
    // Per-line narration. Both routes send it and it is written onto the
    // ledger rows; without it declared here, strict mode dropped it and every
    // edit re-saved the voucher with blank narrations.
    narration:{type:String}
  }
],
   narration: { type: String },
   paymentType: { type: String },
againstBill:{type:Boolean,default:false},
  acType: {
    type: String,
  },
}, {
  timestamps: true,
});

const Voucher = mongoose.models.Voucher || mongoose.model("Voucher", voucherSchema);

export default Voucher;
