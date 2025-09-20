const mongoose = require("mongoose");

const vendorCardSchema = new mongoose.Schema({
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
  email:{
    type:String,
    unique:true,
    default:"vendor@yopmail.com"
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
  city:{
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
});


module.exports = new mongoose.model("Vendorcard", vendorCardSchema);
