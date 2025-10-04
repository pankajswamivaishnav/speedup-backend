const mongoose = require("mongoose");
const validator = require("validator");
const transportCardSchema = new mongoose.Schema({
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
  city: {
    type: String,
    required: true,
    trim: true,
  }, 
  email: {
    type: "String",
    unique: true,
    validate: [validator.isEmail, "must be a valid email"],
  },
  avatar: {
    public_id: {
      type: "String",
    },
    url: {
      type: "String",
    },
  },
  isDeleted : {
    type:Boolean,
    required:true,
    default:false
  },
},{timestamps: true,versionKey:false});


module.exports = new mongoose.model("TransportCard", transportCardSchema);
