const mongoose = require("mongoose");
const validator = require("validator");
const {
  resetPasswordTokenPlugin,
  passwordPlugin,
} = require("../../helpers/passwordPlugin");

const transporterSchema = new mongoose.Schema(
  {
    transportName: {
      type: String,
      // required: true,
      trim: true,
    },
    first_name: {
      type: String,
      // required: true,
      trim: true,
    },
    last_name: {
      type: String,
      // required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      // required: true,
      trim: true,
      unique: true,
    },
    officeNumber: {
      type: String,
      trim: true,
    },
    registrationNumber: {
      type: String,
      // // required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    transportAddress: {
      type: String,
      // required: true,
      trim: true,
    },
    faithLine: {
      type: String,
      trim: true,
    },
    panCardNumber: {
      type: String,
      trim: true,
    },
    pinCode: {
      type: String,
      // required: true,
      trim: true,
    },
    transportIds: {
      type: [],
      default: [],
    },
    city: {
      type: String,
      // required: true,
      trim: true,
    },
    state: {
      type: String,
      // required: true,
      trim: true,
    },
    country: {
      type: String,
      // required: true,
      default: "INDIA",
      trim: true,
    },
    email: {
      type: "String",
      unique: true,
      validate: [validator.isEmail, "must be a valid email"],
    },
    password: {
      type: "String",
      // required: true,
    },
    avatar: {
      public_id: {
        type: "String",
      },
      url: {
        type: "String",
      },
    },
    isDeleted: {
      type: Boolean,
      // required: true,
      default: false,
    },
    role: {
      type: String,
      enum: ["super_admin", "transporter", "driver", "vendor"],
      // required: true,
      default: "transporter",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, versionKey: false }
);

// Use plugin
transporterSchema.plugin(passwordPlugin);
transporterSchema.plugin(resetPasswordTokenPlugin);

module.exports = new mongoose.model("Transporter", transporterSchema);
