const ManagedTransporter = require("../../config/models/managedTransporter.model");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");

// Create Managed Transporter
exports.createManagedTransporter = catchAsyncHandler(async (req, res, next) => {
  const {
    transportName,
    first_name,
    last_name,
    mobileNumber,
    officeNumber,
    address,
    email,
  } = req.body;

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

  // Check if this creator already created a transporter with this mobile number
  const existingTransporter = await ManagedTransporter.findOne({
    mobileNumber,
    "creator.userId": creatorId,
    isDeleted: false,
  });

  if (existingTransporter) {
    return next(
      new ErrorHandler(
        "You have already created a transporter with this mobile number",
        400
      )
    );
  }

  const managedTransporter = await ManagedTransporter.create({
    transportName,
    first_name,
    last_name,
    mobileNumber,
    officeNumber,
    address,
    email,
    creator: {
      userId: creatorId,
      role: creatorRole,
    },
  });

  if (!managedTransporter) {
    return next(new ErrorHandler("Managed Transporter Not Created", 404));
  }

  res.status(201).json({
    success: true,
    status: 201,
    message: "Managed Transporter Created Successfully",
    data: managedTransporter,
  });
});

// Get All Managed Transporters
exports.getAllManagedTransporters = catchAsyncHandler(
  async (req, res, next) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.filter;
    const skip = page * limit;

    // Filter by creator - only get transporters created by current user
    const creatorId = req.user._id;
    let filter = {
      isDeleted: false,
      "creator.userId": creatorId,
    };

    if (searchQuery && searchQuery !== "undefined") {
      filter.$or = [
        { transportName: { $regex: searchQuery, $options: "i" } },
        { first_name: { $regex: searchQuery, $options: "i" } },
        { last_name: { $regex: searchQuery, $options: "i" } },
        { mobileNumber: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalTransporters = await ManagedTransporter.countDocuments(filter);

    let managedTransporters;
    if (page === 0 && limit === 0) {
      managedTransporters = await ManagedTransporter.find(filter)
        .populate({
          path: "creator.userId",
          select: "first_name last_name mobileNumber email",
        })
        .sort({ createdAt: -1 });
    } else {
      managedTransporters = await ManagedTransporter.find(filter)
        .populate({
          path: "creator.userId",
          select: "first_name last_name mobileNumber email",
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    if (!managedTransporters || managedTransporters.length === 0) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "No Managed Transporters Found",
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: managedTransporters,
      total: totalTransporters,
      page: page,
      limit: limit,
    });
  }
);

// Get Managed Transporter By ID
exports.getManagedTransporterById = catchAsyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const creatorId = req.user._id;

    const managedTransporter = await ManagedTransporter.findOne({
      _id: id,
      isDeleted: false,
      "creator.userId": creatorId,
    }).populate({
      path: "creator.userId",
      select: "first_name last_name mobileNumber email",
    });

    if (!managedTransporter) {
      return next(new ErrorHandler("Managed Transporter Not Found", 404));
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: managedTransporter,
    });
  }
);

// Update Managed Transporter
exports.updateManagedTransporter = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;
  const {
    transportName,
    first_name,
    last_name,
    mobileNumber,
    officeNumber,
    address,
    email,
  } = req.body;

  const managedTransporter = await ManagedTransporter.findOne({
    _id: id,
    isDeleted: false,
    "creator.userId": creatorId,
  });

  if (!managedTransporter) {
    return next(
      new ErrorHandler(
        "Managed Transporter Not Found or You don't have permission to update it",
        404
      )
    );
  }

  // Check if mobile number is being updated and if this creator already has another transporter with this number
  if (mobileNumber && mobileNumber !== managedTransporter.mobileNumber) {
    const existingTransporter = await ManagedTransporter.findOne({
      mobileNumber,
      "creator.userId": creatorId,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existingTransporter) {
      return next(
        new ErrorHandler(
          "You have already created another transporter with this mobile number",
          400
        )
      );
    }
  }

  // Update fields
  if (transportName) managedTransporter.transportName = transportName;
  if (first_name) managedTransporter.first_name = first_name;
  if (last_name) managedTransporter.last_name = last_name;
  if (mobileNumber) managedTransporter.mobileNumber = mobileNumber;
  if (officeNumber !== undefined)
    managedTransporter.officeNumber = officeNumber;
  if (address) managedTransporter.address = address;
  if (email) managedTransporter.email = email;

  await managedTransporter.save();

  res.status(200).json({
    success: true,
    status: 200,
    message: "Managed Transporter Updated Successfully",
    data: managedTransporter,
  });
});

// Delete Managed Transporter (Soft Delete)
exports.deleteManagedTransporter = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;

  const managedTransporter = await ManagedTransporter.findOne({
    _id: id,
    "creator.userId": creatorId,
  });

  if (!managedTransporter) {
    return next(
      new ErrorHandler(
        "Managed Transporter Not Found or You don't have permission to delete it",
        404
      )
    );
  }

  if (managedTransporter.isDeleted) {
    return next(new ErrorHandler("Managed Transporter Already Deleted", 400));
  }

  managedTransporter.isDeleted = true;
  await managedTransporter.save();

  res.status(200).json({
    success: true,
    status: 200,
    message: "Managed Transporter Deleted Successfully",
    data: managedTransporter,
  });
});
