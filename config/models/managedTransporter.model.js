const mongoose = require("mongoose");
const validator = require("validator");

const managedTransporterSchema = new mongoose.Schema(
  {
    transportName: {
      type: String,
      required: true,
      trim: true,
    },
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
      required: true,
      trim: true,
      unique: true,
    },
    officeNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: "String",
      unique: true,
      validate: [validator.isEmail, "must be a valid email"],
    },
    isDeleted: {
      type: Boolean,
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

module.exports = new mongoose.model(
  "ManagedTransporter",
  managedTransporterSchema
);
