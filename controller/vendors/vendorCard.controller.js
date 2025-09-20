const VendorCard = require("../../config/models/vendorCard.model");
// Middleware & Utils Error
const catchAsyncHandler = require("../../middleware/catchAsyncError");

// Create Vendors
exports.createVendorCard = catchAsyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    mobileNumber,
    address,
    business,
    email,
    city,
    avatar,
  } = req.body;

 const driverCard =  await VendorCard.create({
    first_name,
    last_name,
    mobileNumber,
    address,
    business,
    email,
    city,
    avatar,
  });

  if (!driverCard) {
    return next("Vendor Card Not Created !!", 404);
  }

  res.status(200).json({
    success: true,
    message: "Vendor Card created successfully",
    driverCard
  });
});

// Get Vendor Cards
exports.getAllVendorCard = catchAsyncHandler(async(req, res, ) => {

  const searchQuery = req.query.filter;
  let filter = {isDeleted:false};
  
  if(searchQuery && searchQuery !== 'undefined'){
    filter.$or = [
      {business:{$regex:searchQuery, $options:'i'}},
      {first_name : {$regex:searchQuery, $options:'i'}},
      {last_name : {$regex:searchQuery, $options:'i'}},
      {mobileNumber : {$regex:searchQuery, $options:'i'}}
    ]
  }

  const vendorCards = await VendorCard.find(filter);

  if(!vendorCards){
    res.status(404).json({
      success:false,
      status:404,
      message:"Vendor Card Not Found !!"
    })
  }

  res.status(200).json({
    success:true,
    status:200,
    data:vendorCards
  })
})

