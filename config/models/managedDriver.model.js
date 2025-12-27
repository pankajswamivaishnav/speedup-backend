const mongoose = require("mongoose");

const managedDriverSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
    },
    truckNumber: {
      type: String,
    },
    address: {
      type: String,
      default: "INDIA",
      trim: true,
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
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("ManagedDriver", managedDriverSchema);
