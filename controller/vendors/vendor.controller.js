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
    vendorEmail,
    pinCode,
    city,
    state,
    country,
    password,
    role,
    avatar,
  } = req.body;

  await Vendor.create({
    vendorName,
    vendorPhoneNumber,
    vendorAddress,
    vendorBussiness,
    vendorSecondaryPhoneNumber,
    vendorEmail,
    pinCode,
    city,
    state,
    country,
    password,
    role,
    avatar,
  });
  res.status(200).json({
    success: true,
    message: "Vendor created successfully",
  });
});

// get all vendors
exports.getTotalVendors = catchAsyncHandler(async(req, res, next)=>{
  const page = req.query.page;
  const limit = req.query.limit;
  const skip = page*limit;
  const searchQuery = req.query.filter;

  let totalVendors;
  let filter = { isDeleted: false };
  if (searchQuery && searchQuery !== 'undefined') {
    filter.vendorName = { $regex: searchQuery, $options: 'i' };
  }
  const totalUsers = await Vendor.countDocuments(filter);

  if(page == 0 && limit == 0){
    totalVendors = await Vendor.find(filter);
   }else{
    totalVendors = await Vendor.find(filter).skip(skip||0).limit(limit||1);
   }
   res.status(200).json({
     success:true,
     data: totalVendors,
     total: totalUsers,
   });
})
