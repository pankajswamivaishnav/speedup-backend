const mongoose = require("mongoose");
const moment = require("moment");
const Transporter = require("../models/transporterSchema.model");
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const month = monthNames[new Date().getMonth()];
const biltySchema = new mongoose.Schema({
  transportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Transporter,
    required: true,
  },
  gstNumber: {
    type: String,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  truckNumber: {
    type: String,
    trim: true,
    required: true,
  },
  fromWhere: {
    type: String,
    required: true,
  },
  whereTo: {
    type: String,
    required: true,
  },
  driverPhoneNumber: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: moment().format("YYYY-MM-DD"),
  },
  senderInformation: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    senderNumber: {
      type: Number,
      required: true,
    },
  },
  receiverInformation: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    receiverNumber: {
      type: Number,
      required: true,
    },
  },
  goodsCategory: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  truckCharge: {
    type: String,
    required: true,
  },
  advanceCharge: {
    type: String,
    required: true,
  },
  remainingCharge: {
    type: String,
    required: true,
  },
  brokingCharge: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["cash", "upi", "banktransfer", "netbanking"],
    required: true,
    lowercase: true,
  },
  biltyNumber: {
    type: String,
    unique: true,
    required: true,
  },
  month: {
    type: String,
    required: true,
    default: month,
  },
});

module.exports = mongoose.model("BiltyInfo", biltySchema);
