const mongoose = require("mongoose");
const moment = require("moment");
const Transporter = require("../models/transporterSchema.model");

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
  transporterNumber: {
    type: Number,
    required: true,
  },
  truckNumber: {
    type: String,
    trim: true,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
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
    type: Date,
    default: moment().format("YYYY-MM-DD, hh:mm"),
  },
  senderInformation: {
    name: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  receiverInformation: {
    name: {
      type: String,
      required: true,
    },
    number: {
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
  advancePayment: {
    type: String,
    required: true,
  },
  remainingPayment: {
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
    default:"",
  },
  isDeleted:{
    type:Boolean,
    default:false,
    required:true
  }
},{
  timestamps: true,
  versionKey:false
});

// ✅ Auto-generate biltyNumber based on transportId
biltySchema.pre("save", async function (next) {
  const bilty = this;

  if (bilty.isNew && !bilty.biltyNumber) {
    try {
      const lastBilty = await mongoose.model("BiltyInfo").findOne({
        transportId: bilty.transportId,
      })
      .sort({ _id: -1 }) // latest entry
      .select("biltyNumber");

      let nextCount = 1;

      if (lastBilty && lastBilty.biltyNumber) {
        const parts = lastBilty.biltyNumber.split("-");
        const lastNumber = parseInt(parts[1], 10);
        if (!isNaN(lastNumber)) {
          nextCount = lastNumber + 1;
        }
      }

      bilty.biltyNumber = `${bilty.transportId.toString()}-${nextCount}`;
      next();
    } catch (error) {
      return next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("BiltyInfo", biltySchema);
