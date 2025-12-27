const mongoose = require("mongoose");

const managedVendorSchema = new mongoose.Schema(
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
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "vendor@yopmail.com",
    },
    secondaryMobileNumber: {
      type: Number,
      trim: true,
    },
    business: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: "INDIA",
      required: true,
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
      required: true,
      default: false,
    },
    creator: {
      userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        refPath: "creator.role",
      },
      role: {
        type: String,
        required: true,
        enum: ["Driver", "Vendors", "Transporter"],
      },
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = new mongoose.model("ManagedVendor", managedVendorSchema);
