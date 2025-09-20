const TransportCard = require("../../config/models/transportCard.model")
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
//Register Transporter
exports.createTransportCard = catchAsyncHandler(async (req, res, next) => {
  const {
    transportName,
    first_name,
    last_name,
    mobileNumber,
    officeNumber,
    address,
    email,
    city,
    avatar,
  } = req.body;
  const transportCard = await TransportCard.create({
    transportName,
    first_name,
    last_name,
    mobileNumber,
    officeNumber,
    address,
    email,
    city,
    avatar,
  });

  if (!transportCard) {
    return next(new ErrorHandler("Transport Card Not Created ", 404));
  }
  res.status(201).json({
    success: true,
    status:201,
    message:"Transport Card Created Successfully.",
    transportCard,
  });
});

// Get Transport Cards
exports.getAllTransportCards = catchAsyncHandler(async(req, res, ) => {

  const searchQuery = req.query.filter;
  let filter = {isDeleted:false};
  
  if(searchQuery && searchQuery !== 'undefined'){
    filter.$or = [
      {transportName:{$regex:searchQuery, $options:'i'}},
      {first_name : {$regex:searchQuery, $options:'i'}},
      {last_name : {$regex:searchQuery, $options:'i'}},
      {mobileNumber : {$regex:searchQuery, $options:'i'}}
    ]
  }

  const transportcards = await TransportCard.find(filter);

  if(!transportcards){
    res.status(404).json({
      success:false,
      status:404,
      message:"Transport Cards Not Found !!"
    })
  }

  res.status(200).json({
    success:true,
    status:200,
    data:transportcards
  })
})