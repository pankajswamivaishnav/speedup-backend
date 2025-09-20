const DriverCard = require("../../config/models/driverCard.model");
// Middleware & Utils ErrorDriver
const catchAsyncHandler = require("../../middleware/catchAsyncError");

// Create Driver
exports.createDriverCard = catchAsyncHandler(async (req, res, next) => {
  const {first_name, last_name,  mobileNumber,  address,  truckNumber, avatar, licenseNumber } = req.body;
  const createDriverCard = await DriverCard.create({
    first_name,
    last_name,
    mobileNumber,
    truckNumber,
    licenseNumber,
    address,
    avatar
  });
  if (!createDriverCard) {
    return next("Driver Card Not Created !!", 404);
  }
  res.status(201).json({
    success: true,
    status:201,
    createDriverCard,
  });
});

// Get all driver cards
exports.getAllDriverCard = catchAsyncHandler(async (req, res, next) => {
  const searchQuery = req.query.filter;
  let filter = { isDeleted: false };

  if (searchQuery && searchQuery !== 'undefined') {
       filter.$or = [
          { first_name: { $regex: searchQuery, $options: 'i' } },
          { last_name: { $regex: searchQuery, $options: 'i' } },
           {mobileNumber:{$regex:searchQuery, $options:'i'}}
      ];
  }

  const driverCards = await DriverCard.find(filter);

  if (!driverCards || driverCards.length === 0) {
      return res.status(404).json({
          success: false,
          status: 404,
          message: "No driver cards found for this search."
      });
  }

  res.status(200).json({
      success: true,
      status: 200,
      data: driverCards
  });
});

