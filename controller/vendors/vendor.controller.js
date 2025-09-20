const Vendor = require("../../config/models/vendors.models");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const vendorCardModel = require("../../config/models/vendorCard.model");

// Create Vendors
exports.createVendor = catchAsyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    mobileNumber,
    address,
    business,
    vendorSecondaryPhoneNumber,
    email,
    pinCode,
    city,
    state,
    country,
    password,
    role,
    avatar,
  } = req.body;

  await Vendor.create({
    first_name,
    last_name,
    mobileNumber,
    address,
    business,
    vendorSecondaryPhoneNumber,
    email,
    pinCode,
    city,
    state,
    country,
    password,
    role,
    avatar,
  });

   await vendorCardModel.create({
    first_name,
    last_name,
    mobileNumber,
    address,
    business,
    email,
    city,
    avatar
   })
  
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
    filter.$or = [
      {first_name:{ $regex: searchQuery, $options: 'i' }},
      {last_name:{ $regex: searchQuery, $options: 'i' }}
    ]
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
