const mongoose = require("mongoose");
const driverSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: true,
    trim: true,
  },
  driverPhoneNumber: {
    type: Number,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    default: "INDIA",
    trim: true,
  },
  licenseNumber: {
    type: String,
    trim: true,
  },
});

module.exports = new mongoose.model("Driver", driverSchema);
