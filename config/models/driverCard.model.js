const mongoose = require("mongoose");
const validator = require("validator");
const driverCardSchema = new mongoose.Schema({
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
    unique:true,
    required: true,
    trim: true,
  },
  email:{
    type:String,
    trim:true,
    validate: [validator.isEmail, "must be a valid email"],
  },
  truckNumber:{
    type:String,
    required:true,
  },
  role:{
    type:String,
    default:'driver'
  },
  licenseNumber:{
    type:String,
    trim:true,
    sparse: true, // only enforces uniqueness when the field exists
    unique:true
  },
  address: {
    type: String,
    required: true,
    default: "INDIA",
    trim: true,
  },
  avatar: {
    public_id: {
      type: "String",
    },
    url: {
      type: "String",
    },
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
 
},{
  versionKey:false
});

module.exports = new mongoose.model("DriverCard", driverCardSchema);
