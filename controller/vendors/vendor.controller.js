const Vendor = require("../../config/models/vendors.models");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");

// Create Vendors
exports.createVendor = catchAsyncHandler(async (req, res, next) => {
  const {
    vendorName,
    vendorPhoneNumber,
    vendorAddress,
    vendorBussiness,
    vendorSecondaryPhoneNumber,
  } = req.body;
  await Vendor.create({
    vendorName,
    vendorPhoneNumber,
    vendorAddress,
    vendorBussiness,
    vendorSecondaryPhoneNumber,
  });
  res.status(200).json({
    success: true,
    message: "Vendor created successfully",
  });
});
