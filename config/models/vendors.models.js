const mongoose = require("mongoose");
const passwordPlugin = require("../../helpers/passwordPlugin")

const vendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
    trim: true,
  },
  vendorPhoneNumber: {
    type: Number,
    unique: true,
    required: true,
    trim: true,
  },
  vendorEmail:{
    type:String,
    default:"vendor@yopmail.com"
  },
  vendorSecondaryPhoneNumber: {
    type: Number,
    trim: true,
  },
  vendorBussiness: {
    type: String,
    required: true,
    trim: true,
  },
  vendorAddress: {
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
      required: true,
    },
  },
  isDeleted : {
    type:Boolean,
    required:true,
    default:false
  }
});

vendorSchema.plugin(passwordPlugin);

module.exports = new mongoose.model("Vendors", vendorSchema);
