import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
  discount: { type: Number, required: true },
  total: { type: Number, required: true },
  description: {type: String},
  hsn:{type:String}
});

const partyTaxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number },
  Amount: { type: Number },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: Number, required: true },
    againstInvoiceNo: { type: Number },
    date: { type: Date, required: true },
    
    customer: {
      name: { type: String, required: true },
      phone: { type: String },
      email: { type: String },
      custId:{type:String},
    },
    hsnTotals: [
  {
    hsn: { type: String, required: true },
    amount: { type: Number, required: true },
  }
],
    paymentType: { type: String },  // e.g. Cash / Cheque
    stateOfSupply: { type: String }, // e.g. Delhi
    taxType: { type: String },  // local / central
    gst: { type: Number },
    totalAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    received: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
      dispatchfrom: {
      name: { type: String },
    },
      billedTo: {
      name: { type: String },
    },

    items: [itemSchema],

    partyTaxes: [partyTaxSchema],
     transport: { type: String },         // Transport
    grNo: { type: String },              // Gr No.
    grDate: { type: Date },              // Date
    orderDate: { type: Date },              // Date
    pvtMark: { type: String },           // Pvt Mark
    caseDetails: { type: String },       // Case
    freight: { type: String },           // Freight
    weight: { type: Number },            // Weight
    orderNo: { type: Number },            // Weight
    ewayBillNo: { type: String },        // E-Way No.
    ewayBillDate: { type: Date },
    type:{ type: String, required: true },
    return:{type:Boolean,default:false}
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
