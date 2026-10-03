import mongoose from "mongoose";

/**
 * A state or union territory and its GST state code.
 *
 * The code is the first two digits of a GSTIN and decides whether a supply is
 * intra-state (CGST + SGST) or inter-state (IGST), so BOTH fields are unique:
 * two records for one code, or one name, would make the lookup ambiguous.
 *
 * `code` is a String on purpose — Delhi is "07", and a Number drops the zero.
 */
const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a state name"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Please provide a GST state code"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// No explicit .index() calls: `unique: true` on each field already builds one,
// and declaring it twice makes Mongoose 8 throw at module load.

const State = mongoose.models.states || mongoose.model("states", stateSchema);

export default State;
