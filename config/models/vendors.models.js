const mongoose = require("mongoose");
const {passwordPlugin, resetPasswordTokenPlugin} = require("../../helpers/passwordPlugin")

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
  transportId:{
    type:mongoose.Types.ObjectId,
    ref:"Transporter"
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
  role:{
    type:String,
    default:'vendor'
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
  resetPasswordToken: String,
  resetPasswordExpire: Date,
},{timestamps: true, versionKey:false});

vendorSchema.plugin(passwordPlugin);
vendorSchema.plugin(resetPasswordTokenPlugin);


module.exports = new mongoose.model("Vendors", vendorSchema);
