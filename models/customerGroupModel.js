import mongoose from "mongoose";

// Re-exported so the routes can reach it from the model they already import.
export { RESERVED_GROUPS, isReservedGroup } from "../lib/customerGroups.mjs";

/**
 * The list of groups a party can belong to — Sundry Debtors, Sundry Creditors,
 * Cash, Bank, and whatever else the business uses.
 *
 * `customers.group` holds the group's NAME, not a reference, because that is
 * how the rest of the app already reads it: `lib/cashAccount.mjs` resolves an
 * invoice's cash or bank account with `group: /^cash$/i`. Renaming a group
 * therefore has to cascade to every customer in it — see api/group-update.
 */
const customerGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a group name"],
      unique: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// NOTE: no `schema.index({ name: 1 })` here. `unique: true` on the field above
// already builds that index, and declaring it twice makes Mongoose 8 throw
// "Schema already has an index on {name:1}" when the model is first evaluated —
// which took the whole route down with a 500.

const CustomerGroup =
  mongoose.models.customergroups ||
  mongoose.model("customergroups", customerGroupSchema);

export default CustomerGroup;
