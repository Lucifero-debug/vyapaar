import mongoose from "mongoose";

/**
 * One line of a party's price list, shaped like the row on the price-list
 * screen: Item Name | Unit | Sale Price | MRP | Dis 1 % | Dis 2 % | Dis 3 %.
 *
 * `salePrice` and `mrp` are nullable on purpose. Blank means "use the item
 * master", which is not the same as zero -- an item priced at 0 is free, an
 * item with no price listed simply bills at its master rate.
 *
 * The three discounts are SUCCESSIVE, not added together; lib/priceList.mjs
 * owns that rule and collapses them into the single percentage an invoice line
 * carries.
 */
const priceListItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "items",
    required: true,
  },
  name: {
    type: String,
  },
  unit: {
    type: String,
  },
  salePrice: {
    type: Number,
    default: null,
    min: 0,
  },
  mrp: {
    type: Number,
    default: null,
    min: 0,
  },
  dis1: { type: Number, default: 0, min: 0, max: 100 },
  dis2: { type: Number, default: 0, min: 0, max: 100 },
  dis3: { type: Number, default: 0, min: 0, max: 100 },

  // What `salePrice` was called before this screen grew its discount columns.
  // Left declared so lists saved then still load; nothing writes it any more.
  price: {
    type: Number,
    min: 0,
  },
}, { _id: false });

const priceListSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customers",
    required: [true, "Please select a party"],
  },
  // Snapshot of the party's name; the get route refreshes it from the party.
  partyName: {
    type: String,
  },
  date: {
    type: Date,
    required: [true, "Please provide a date"],
    default: Date.now,
  },
  items: {
    type: [priceListItemSchema],
    default: [],
  },
  remark: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

priceListSchema.index({ party: 1, date: -1 });

const PriceList = mongoose.models.pricelists || mongoose.model("pricelists", priceListSchema);

export default PriceList;
