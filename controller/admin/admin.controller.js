const Transporter = require("../../config/models/transporterSchema.model");
const User = require("../../config/models/transporterSchema.model");
const Bilty = require("../../config/models/bilty.model");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");

// Get Total Transporter
exports.getTotalTransporter = catchAsyncHandler(async (req, res, next) => {
  const page = req.query.page;
  const limit = req.query.limit;
  const skip = page*limit;
  const totalUsers = await User.countDocuments({ isDeleted: false });
  const totalTransporter = await User.find({isDeleted:false}).skip(skip||0).limit(limit||1);
  res.status(200).json({
    data: totalTransporter,
    total: totalUsers,
  });
});

// Delete Transporter 
exports.deleteTransporter = catchAsyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const transporter = User.findById({_id:id});
  if(!transporter){
    return next('No transporter found !!', 404);
  }
  const deleteTransporter = await User.findByIdAndUpdate({_id:id}, {isDeleted:true}, {new:true});
  if(deleteTransporter){
     res.status(200).json({
     success:true,
     data:deleteTransporter
  });
  }
})
