const ManagedDriver = require("../../config/models/managedDriver.model");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");

// Create Managed Driver
exports.createManagedDriver = catchAsyncHandler(async (req, res, next) => {
  const { first_name, last_name, mobileNumber, truckNumber, address } =
    req.body;

  // Get creator from authenticated user
  const creatorId = req.user._id;
  const userRole = req.user.role;

  // Map role to model name
  const roleMap = {
    transporter: "Transporter",
    driver: "Driver",
    vendor: "Vendors",
  };
  const creatorRole = roleMap[userRole] || "Transporter";

  // Check if this creator already created a driver with this mobile number
  const existingDriver = await ManagedDriver.findOne({
    mobileNumber,
    "creator.userId": creatorId,
    isDeleted: false,
  });

  if (existingDriver) {
    return next(
      new ErrorHandler(
        "You have already created a driver with this mobile number",
        400
      )
    );
  }

  const managedDriver = await ManagedDriver.create({
    first_name,
    last_name,
    mobileNumber,
    truckNumber,
    address,
    creator: {
      userId: creatorId,
      role: creatorRole,
    },
  });

  if (!managedDriver) {
    return next(new ErrorHandler("Managed Driver Not Created", 404));
  }

  res.status(201).json({
    success: true,
    status: 201,
    message: "Managed Driver Created Successfully",
    data: managedDriver,
  });
});

// Get All Managed Drivers
exports.getAllManagedDrivers = catchAsyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const searchQuery = req.query.filter;
  const skip = page * limit;

  // Filter by creator - only get drivers created by current user
  const creatorId = req.user._id;
  let filter = {
    isDeleted: false,
    "creator.userId": creatorId,
  };

  if (searchQuery && searchQuery !== "undefined") {
    filter.$or = [
      { first_name: { $regex: searchQuery, $options: "i" } },
      { last_name: { $regex: searchQuery, $options: "i" } },
      { mobileNumber: { $regex: searchQuery, $options: "i" } },
      { truckNumber: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const totalDrivers = await ManagedDriver.countDocuments(filter);

  let managedDrivers;
  if (page === 0 && limit === 0) {
    managedDrivers = await ManagedDriver.find(filter).sort({ createdAt: -1 });
  } else {
    managedDrivers = await ManagedDriver.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  if (!managedDrivers || managedDrivers.length === 0) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: "No Managed Drivers Found",
    });
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: managedDrivers,
    total: totalDrivers,
    page: page,
    limit: limit,
  });
});

// Get Managed Driver By ID
exports.getManagedDriverById = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;

  const managedDriver = await ManagedDriver.findOne({
    _id: id,
    isDeleted: false,
    "creator.userId": creatorId,
  });

  if (!managedDriver) {
    return next(new ErrorHandler("Managed Driver Not Found", 404));
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: managedDriver,
  });
});

// Update Managed Driver
exports.updateManagedDriver = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;
  const { first_name, last_name, mobileNumber, truckNumber, address } =
    req.body;

  const managedDriver = await ManagedDriver.findOne({
    _id: id,
    isDeleted: false,
    "creator.userId": creatorId,
  });

  if (!managedDriver) {
    return next(
      new ErrorHandler(
        "Managed Driver Not Found or You don't have permission to update it",
        404
      )
    );
  }

  // Check if mobile number is being updated and if this creator already has another driver with this number
  if (mobileNumber && mobileNumber !== managedDriver.mobileNumber) {
    const existingDriver = await ManagedDriver.findOne({
      mobileNumber,
      "creator.userId": creatorId,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existingDriver) {
      return next(
        new ErrorHandler(
          "You have already created another driver with this mobile number",
          400
        )
      );
    }
  }

  // Update fields
  if (first_name) managedDriver.first_name = first_name;
  if (last_name) managedDriver.last_name = last_name;
  if (mobileNumber) managedDriver.mobileNumber = mobileNumber;
  if (truckNumber !== undefined) managedDriver.truckNumber = truckNumber;
  if (address) managedDriver.address = address;

  await managedDriver.save();

  res.status(200).json({
    success: true,
    status: 200,
    message: "Managed Driver Updated Successfully",
    data: managedDriver,
  });
});

// Delete Managed Driver (Soft Delete)
exports.deleteManagedDriver = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;

  const managedDriver = await ManagedDriver.findOne({
    _id: id,
    "creator.userId": creatorId,
  });

  if (!managedDriver) {
    return next(
      new ErrorHandler(
        "Managed Driver Not Found or You don't have permission to delete it",
        404
      )
    );
  }

  if (managedDriver.isDeleted) {
    return next(new ErrorHandler("Managed Driver Already Deleted", 400));
  }

  managedDriver.isDeleted = true;
  await managedDriver.save();

  res.status(200).json({
    success: true,
    status: 200,
    message: "Managed Driver Deleted Successfully",
    data: managedDriver,
  });
});
