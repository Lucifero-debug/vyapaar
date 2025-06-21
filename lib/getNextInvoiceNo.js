// lib/getNextInvoiceNo.js
import Counter from '../models/counterModel';

export const getNextInvoiceNo = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'invoiceNo' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return counter.value;
};
