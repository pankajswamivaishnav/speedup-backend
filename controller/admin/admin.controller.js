const Transporter = require("../../config/models/transporterSchema.model");
const User = require("../../config/models/transporterSchema.model");
const Bilty = require("../../config/models/bilty.model");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");

// Get Total Transporter
exports.getTotalTransporter = catchAsyncHandler(async (req, res, next) => {
  const totalTransporter = await User.find();
  res.status(200).json({
    data: totalTransporter,
  });
});
