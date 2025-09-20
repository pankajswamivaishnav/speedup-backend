const Driver = require("../../config/models/driver.model");
const BiltyInfo = require("../../config/models/bilty.model");
const excelJs = require("exceljs");
// Middleware & Utils ErrorDriver
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const DriverCard = require("../../config/models/driverCard.model");

// Create Driver
exports.createDriver = catchAsyncHandler(async (req, res, next) => {
  const { first_name,last_name, mobileNumber, licenseNumber, address, transportId, truckNumber, password } = req.body;
  const createSuccessfullyDrive = await Driver.create({
    first_name,
    last_name,
    mobileNumber,
    truckNumber,
    licenseNumber,
    password,
    address,
    transportId
  });
  
  if (!createSuccessfullyDrive) {
    return next("Not Create Driver", 404);
  }

   await DriverCard.create({
    first_name,
    last_name,
    mobileNumber,
    truckNumber,
    licenseNumber,
    address
  })
 
  res.status(201).json({
    success: true,
    createSuccessfullyDrive,
  });
});

// Get All Drivers WHo Present In Bilty
exports.getAllDriversInBilty = catchAsyncHandler(async (req, res, next) => {
  let driversData = new Array();
  let totalDriverData = 0;
  const uniquePhoneNumbers = new Map();
  const allBiltis = await BiltyInfo.find();
  allBiltis.forEach((data, index) => {
    const { driverName, driverPhoneNumber, truckNumber } = data;
    if (!uniquePhoneNumbers.has(driverPhoneNumber)) {
      totalDriverData = index;
      driversData.push({
        driverName,
        driverPhoneNumber,
        truckNumber,
      });
      uniquePhoneNumbers.set(driverPhoneNumber, true);
    }
  });
  res.status(200).json({
    success: true,
    totalDriverData,
    driversData,
  });
});

// Download Driver Xlsx file
exports.downloadDriverFile = catchAsyncHandler(async (req, res, next) => {
  const drivers = await Driver.find();

  // Create a workbook and a worksheet
  let workbook = new excelJs.Workbook();
  let worksheet = workbook.addWorksheet("Users");

  // Define columns in the worksheet
  worksheet.columns = [
    { header: "Driver Name", key: "driverName", width: 20 },
    { header: "Phone Number", key: "driverPhoneNumber", width: 15 },
    { header: "License Number", key: "licenseNumber", width: 20 },
    { header: "Address", key: "address", width: 25 },
  ];

  // Add data to the worksheet
  drivers.forEach((driver) => {
    worksheet.addRow(driver);
  });

  // Set up the response headers
  res.setHeader("Content-Disposition", "attachment; filename=" + "users.xlsx");
  // Write the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
});

// Get All Drivers
exports.getAllDrivers = catchAsyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const page = req.query.page;
  const limit = req.query.limit;
  const skip = page*limit
  const searchQuery = req.query.filter;

  let drivers;
  let filter = { isDeleted: false };
  if (searchQuery && searchQuery !== 'undefined') {
    filter.driverName = { $regex: searchQuery, $options: 'i' };
  }
  switch(role){
    case 'super_admin' : {
        drivers = await Driver.find(filter).skip(skip).limit(limit);
       break;
    }
    case 'transporter' :{
      drivers = await Driver.find({transportId:req.user._id, filter}).skip(skip).limit(limit);
      break;
    }
  }
  const totalDrivers = await Driver.countDocuments(filter)
  if (!drivers) {
    return next("no driver found", 404);
  }
  res.status(200).json({
    success: true,
    data: drivers,
    total: totalDrivers,
  });
});
