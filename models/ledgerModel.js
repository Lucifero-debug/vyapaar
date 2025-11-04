import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
  customerName: {
    type: String,
  },
  date: {
    type: Date,
  },
  account: {
    type: String, // The acName from Voucher
  },
  paymentType: {
    type: String, // cash/bank etc.
  },
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
    narration: {
    type: String, 
  },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
}, {
  timestamps: true,
});

const Ledger = mongoose.models.Ledger || mongoose.model("Ledger", ledgerSchema);

export default Ledger;
