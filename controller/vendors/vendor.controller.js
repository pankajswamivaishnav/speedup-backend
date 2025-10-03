const Vendor = require("../../config/models/vendors.models");
// Middleware & Utils Error
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
    transportId,
    city,
    state,
    country,
    password,
    role,
    avatar,
  } = req.body;

  const vendor = await Vendor.findOne({mobileNumber, transportId})

  if(vendor){
    res.status(400).json({
      success:false,
      message:'Vendor already exist please check mobile number'
    })
  }

  await Vendor.create({
    first_name,
    last_name,
    mobileNumber,
    address,
    business,
    vendorSecondaryPhoneNumber,
    email,
    pinCode,
    transportId,
    city,
    state,
    country,
    password,
    role,
    avatar,
  });

  const vendorCard = await vendorCardModel.findOne({
    $or: [{ email }, { mobileNumber }]
  });

   if(!vendorCard){
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
   }
  res.status(200).json({
    success: true,
    message: "Vendor created successfully",
  });
});

// get all vendors
exports.getTotalVendors = catchAsyncHandler(async(req, res, next)=>{
  const role = req.user.role;
  const page = req.query.page;
  const limit = req.query.limit;
  const skip = page*limit;
  const searchQuery = req.query.filter;
  let totalVendors, totalUsers;
  let filter = { isDeleted: false };
  if (searchQuery && searchQuery !== 'undefined') {
    filter.$or = [
      {first_name:{ $regex: searchQuery, $options: 'i' }},
      {last_name:{ $regex: searchQuery, $options: 'i' }}
    ]
  };
  switch(role){
    case 'super_admin' :{
      totalUsers = await Vendor.countDocuments(filter);
      if(page == 0 && limit == 0){
        totalVendors = await Vendor.find(filter);
       }else{
        totalVendors = await Vendor.find(filter).skip(skip||0).limit(limit||1);
       }
       break;
    }

    case 'transporter' :{
      const transporterFilter = { ...filter, transportId: req.user._id };
      totalUsers = await Vendor.countDocuments(transporterFilter);
      if(page == 0 && limit == 0){
        totalVendors = await Vendor.find(transporterFilter);
       }else{
        totalVendors = await Vendor.find(transporterFilter).skip(skip||0).limit(limit||1);
       }
       break;
    }
  }

 
   res.status(200).json({
     success:true,
     data: totalVendors,
     total: totalUsers,
   });
})

// Delete Vendor
exports.deleteVendor = catchAsyncHandler(async(req, res)=>{
  const _id = req.params.id;

  const response = await Vendor.findByIdAndUpdate(
    _id,
    { isDeleted: true },   
    { new: true }          
  );  

  
  res.status(200).json({
    success: true,
    message:"Delete vendor successfully !!",
    data: response,
  });
})