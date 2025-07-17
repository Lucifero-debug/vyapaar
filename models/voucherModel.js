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
  }
],
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
