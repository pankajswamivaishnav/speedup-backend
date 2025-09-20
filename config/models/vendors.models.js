const mongoose = require("mongoose");
const passwordPlugin = require("../../helpers/passwordPlugin")

const vendorSchema = new mongoose.Schema({
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
    unique: true,
    required: true,
    trim: true,
  },
  email:{
    type:String,
    default:"vendor@yopmail.com"
  },
  vendorSecondaryPhoneNumber: {
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
  pinCode:{
    type:String,
  },
  city:{
    type:String,
    required:true,
  },
  state:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
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
  }
},{versionKey:false});

vendorSchema.plugin(passwordPlugin);

module.exports = new mongoose.model("Vendors", vendorSchema);
