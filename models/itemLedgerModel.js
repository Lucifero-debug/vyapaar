import mongoose from "mongoose";

const itemLedgerSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
    itemName: {
    type: String,
    required: true,
  },
  invoiceNo: {
    type: String,
    required: true,
  },


  typeOfVoucher: {
    type: String,
    required: true,
  },
  partyName: {
    type: String,
    required: true,
  },
  receiptQuantity: {
    type: Number,
    default: 0,
  },
  issueQuantity: {
    type: Number,
    default: 0,
  },
  balanceQuantity: {
    type: Number,
    default: 0,
  },
});

const ItemLedger =
  mongoose.models.ItemLedger || mongoose.model("ItemLedger", itemLedgerSchema);

export default ItemLedger;
