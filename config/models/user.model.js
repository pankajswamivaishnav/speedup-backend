const mongoose = require("mongoose");
const {
  passwordPlugin,
  resetPasswordTokenPlugin,
} = require("../../helpers/passwordPlugin");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["transporter", "vendor", "driver", "super-admin"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      // required: true,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    subscriptionId: {
      type: mongoose.Types.ObjectId,
    },
    razorpayCustomerId: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true, versionKey: false }
);

userSchema.plugin(passwordPlugin);
userSchema.plugin(resetPasswordTokenPlugin);

module.exports = new mongoose.model("User", userSchema);
