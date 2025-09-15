const BiltyInfo = require("../../config/models/bilty.model");
const excelJs = require("exceljs");
const moment = require("moment");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");

// Make Bilty
exports.bilty = catchAsyncHandler(async (req, res, next) => {
  const id = req.user._id
  const gst = req.user.gstNumber 
  const {
    transporterNumber,
    truckNumber,
    driverName,
    from,
    to,
    brokingCharge,
    date,
    driverPhoneNumber,
    senderName,
    senderNumber,
    receiverName,
    receiverNumber,
    goodsCategory,
    weight,
    truckCharge,
    remainingPayment,
    advancePayment,
    paymentType,
  } = req.body;
  console.log("req.body", req.body)
  const formatedDate = moment(date).format("YYYY-MM-DD, hh:mm");
  const biltyData = await BiltyInfo.create({
    transportId:id,
    gstNumber:gst,
    registrationNumber:req.user.registrationNumber,
    transporterNumber,
    truckNumber:truckNumber.toLowerCase(),
    from,
    to,
    formatedDate,
    brokingCharge,
    driverPhoneNumber,
    driverName:driverName.toLowerCase(),
    senderInformation:{
      name: senderName.toLowerCase(),
      number: senderNumber,
    },
    receiverInformation: {
      name: receiverName.toLowerCase(),
      number: receiverNumber,
    },
    goodsCategory,
    weight,
    truckCharge,
    advancePayment,
    remainingPayment,
    paymentType
  });

  if (!biltyData) {
    return next(ErrorHandler("Did Not Save Bilty Data", 404));
  }

  res.status(201).json({
    success: true,
    biltyData,
  });
});

// Get All Biltis data
exports.getAllBiltis = catchAsyncHandler(async (req, res, next) => {
  const role = req.user.role;
  const page = req.query.page;
  const limit = req.query.limit;
  const skip = page*limit;
  const searchQuery = req.query.filter;
  let allBiltis, totalBilties;
  let filter = { isDeleted: false };
  if (searchQuery && searchQuery !== 'undefined') {
    filter.biltyNumber = { $regex: searchQuery, $options: 'i' };
  }  
  switch(role){
    case 'super_admin' : {
      totalBilties = await BiltyInfo.countDocuments(filter);
      if(page == 0 && limit == 0){
      allBiltis = await BiltyInfo.find(filter);
      }else{
        allBiltis = await BiltyInfo.find(filter).skip(skip).limit(limit);
      }
      break;
    }
    case 'transporter' : {
      allBiltis = await BiltyInfo.find({transportId:req.user._id, filter}).skip(skip).limit(limit);
      break;
    }
  }
  const totalBilty = await BiltyInfo.countDocuments(filter)
  res.status(200).json({
    success: true,
    data:allBiltis,
    total: totalBilties,
  });
});

// Get All Bilty Single Driver
exports.getAllBiltyBySingleDriver = catchAsyncHandler(
  async (req, res, next) => {
    const driverPhoneNumber = req.params.id;
    const singleDriverData = await BiltyInfo.find({
      driverPhoneNumber: driverPhoneNumber,
    });
    res.status(200).json({
      success: true,
      singleDriverData,
    });
  }
);

// Download All Bilty Data In xlsx filename
exports.downloadAllBiltyData = catchAsyncHandler(async (req, res, next) => {
  const allBiltyData = await BiltyInfo.find();
  // Create a workbook and a worksheet
  let workbook = new excelJs.Workbook();
  let worksheet = workbook.addWorksheet("Bilties");
  // Define columns in the worksheet
  worksheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "GST Number", key: "gstNumber", width: 15 },
    { header: "Registration Number", key: "registrationNumber", width: 20 },
    { header: "Mobile Number", key: "mobileNumber", width: 15 },
    { header: "Truck Number", key: "truckNumber", width: 15 },
    { header: "Driver Name", key: "driverName", width: 20 },
    { header: "From Where", key: "fromWhere", width: 15 },
    { header: "Where To", key: "whereTo", width: 15 },
    { header: "Broking Charge", key: "brokingCharge", width: 15 },
    { header: "Driver Phone Number", key: "driverPhoneNumber", width: 15 },
    { header: "Sender Name", key: "senderInformation.senderName", width: 20 },
    {
      header: "Sender Address",
      key: "senderInformation.senderAddress",
      width: 25,
    },
    {
      header: "Sender Number",
      key: "senderInformation.senderNumber",
      width: 15,
    },
    {
      header: "Receiver Name",
      key: "receiverInformation.receiverName",
      width: 20,
    },
    {
      header: "Receiver Address",
      key: "receiverInformation.receiverAddress",
      width: 25,
    },
    {
      header: "Receiver Number",
      key: "receiverInformation.receiverNumber",
      width: 15,
    },
    { header: "Goods Category", key: "goodsCategory", width: 15 },
    { header: "Weight", key: "weight", width: 10 },
    { header: "Truck Charge", key: "truckCharge", width: 15 },
    { header: "Advance Charge", key: "advanceCharge", width: 15 },
    { header: "Remaining Charge", key: "remainingCharge", width: 15 },
    { header: "Payment Type", key: "paymentType", width: 15 },
    {
      header: "Receiver Mobile Number",
      key: "receiverMobileNumber",
      width: 20,
    },
    { header: "Sender Mobile Number", key: "senderMobileNumber", width: 20 },
    { header: "Bilty Number", key: "biltyNumber", width: 15 },
  ];

  // Add data to the worksheet
  allBiltyData.forEach((data) => {
    worksheet.addRow(data);
  });
  // Set up the response headers
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "bilties.xlsx"
  );
  // Write the workbook to the response
  await workbook.xlsx.write(res);
  res.end();
});

// Get All Bilty By Month
exports.getAllBiltyByMonth = catchAsyncHandler(async (req, res, next) => {
  let month;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (req.body.month) {
    month = req.body.month;
  } else {
    month = monthNames[new Date().getMonth()];
  }
  const response = await BiltyInfo.find({ month });
  res.status(200).json({
    success: true,
    response,
    totalBilty: response.length,
  });
});

// Get Bilty By Date
exports.getBiltyByDate = catchAsyncHandler(async (req, res, next) => {
  const { date } = req.params;
  if (!(date && !isNaN(Date.parse(date)))) {
    return next(new Error("Invalid date", 500));
  }
  const bilty = await BiltyInfo.findOne({ date: date });
  if (!bilty) {
    return next(new Error("no bilty found", 404));
  }
  res.status(200).json({
    success: true,
    data: bilty,
  });
});
