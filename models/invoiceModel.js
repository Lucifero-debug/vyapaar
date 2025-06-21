import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
  discount: { type: Number, required: true },
  total: { type: Number, required: true },
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
    },

    paymentType: { type: String, required: true },  // e.g. Cash / Cheque
    stateOfSupply: { type: String, required: true }, // e.g. Delhi
    taxType: { type: String, required: true },  // local / central
    gst: { type: Number, required: true },

    gstAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    received: { type: Number, required: true },
    balanceDue: { type: Number, required: true },

    items: [itemSchema],

    partyTaxes: [partyTaxSchema],
    type:{ type: String, required: true },
    return:{type:Boolean,default:false}
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
