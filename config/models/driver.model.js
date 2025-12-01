const mongoose = require("mongoose");
const {
  passwordPlugin,
  resetPasswordTokenPlugin,
} = require("../../helpers/passwordPlugin");
const driverSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    truckNumber: {
      type: String,
      // required: true,
    },
    address: {
      type: String,
      // required: true,
      default: "INDIA",
      trim: true,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    transportId: {
      type: mongoose.Types.ObjectId,
      ref: "Transporter",
    },
    role: {
      type: String,
      default: "driver",
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

driverSchema.plugin(passwordPlugin);
driverSchema.plugin(resetPasswordTokenPlugin);

module.exports = new mongoose.model("Driver", driverSchema);
