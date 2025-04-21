const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
    trim: true,
  },
  vendorPhoneNumber: {
    type: Number,
    unique: true,
    required: true,
    trim: true,
  },
  vendorSecondaryPhoneNumber: {
    type: Number,
    trim: true,
  },
  vendorBussiness: {
    type: String,
    required: true,
    trim: true,
  },
  vendorAddress: {
    type: String,
    default: "INDIA",
    required: true,
  },
});

module.exports = new mongoose.model("Vendors", vendorSchema);
