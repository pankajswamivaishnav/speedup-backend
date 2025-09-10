const mongoose = require("mongoose");
const driverSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: true,
    trim: true,
  },
  driverPhoneNumber: {
    type: Number,
    required: true,
    trim: true,
  },
  truckNumber:{
    type:String,
    required:true,
  },
  address: {
    type: String,
    required: true,
    default: "INDIA",
    trim: true,
  },
  licenseNumber: {
    type: String,
    trim: true,
  },
  transportId:{
    type:mongoose.Types.ObjectId,
    ref:"Transporter"
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
 
},{
  versionKey:false
});

module.exports = new mongoose.model("Driver", driverSchema);
