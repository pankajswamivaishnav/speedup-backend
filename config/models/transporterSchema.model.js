const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { type } = require("os");
const transporterSchema = new mongoose.Schema({
  transportName: {
    type: String,
    required: true,
    trim: true,
  },
  transporter_first_name: {
    type: String,
    required: true,
    trim: true,
  },
  transporter_last_name: {
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
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  transportAddress: {
    type: String,
    required: true,
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
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
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
    required: true,
  },
  avatar: {
    public_id: {
      type: "String",
    },
    url: {
      type: "String",
      required: true,
    },
  },
  isDeleted : {
    type:Boolean,
    required:true,
    default:false
  },
  resetPasswordTokens: "String",
  resetPasswordExpire: "Date",
});

// Hashing algorithm for password
transporterSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare Password
transporterSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Genrate Token For Authentication
transporterSchema.methods.genJWTToken = function () {
  const token = jwt.sign({ id: this._id }, "iampankajswamivaishnav7073272134", {
    expiresIn: "1h",
  });
  return token;
};

// Genrate Token Method For Reset Password
transporterSchema.methods.genResetPasswordToken = function () {
  // Token for Reset Password
  const token = crypto.randomBytes(20).toString("hex");
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordTokens = hashToken;
  this.resetPasswordExpire = Date.now() + 50 * 60 * 1000;
  return token;
};

module.exports = new mongoose.model("Transporter", transporterSchema);
