import mongoose from "mongoose";

const hsnSchema = new mongoose.Schema({
  hsncode: {
    type: String,
    required: [true, "Please provide an HSN Code"],
    unique: true,
    trim: true,
  },
  hsnname: {
    type: String,
  },
  gst: {
    type: Number,
  },
  gstunit: {
    type: String,
  },
}, {
  timestamps: true,
});

const HSN = mongoose.models.hsn || mongoose.model("hsn", hsnSchema);

export default HSN;
