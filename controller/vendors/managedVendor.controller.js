const ManagedVendor = require("../../config/models/managedVendor.model");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");

// Create Managed Vendor
exports.createManagedVendor = catchAsyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    mobileNumber,
    email,
    secondaryMobileNumber,
    business,
    address,
    avatar,
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

  // Check if this creator already created a vendor with this mobile number
  const existingVendor = await ManagedVendor.findOne({
    mobileNumber,
    "creator.userId": creatorId,
    isDeleted: false,
  });

  if (existingVendor) {
    return next(
      new ErrorHandler(
        "You have already created a vendor with this mobile number",
        400
      )
    );
  }

  const managedVendor = await ManagedVendor.create({
    first_name,
    last_name,
    mobileNumber,
    email,
    secondaryMobileNumber,
    business,
    address,
    avatar,
    creator: {
      userId: creatorId,
      role: creatorRole,
    },
  });

  if (!managedVendor) {
    return next(new ErrorHandler("Managed Vendor Not Created", 404));
  }

  res.status(201).json({
    success: true,
    status: 201,
    message: "Managed Vendor Created Successfully",
    data: managedVendor,
  });
});

// Get All Managed Vendors
exports.getAllManagedVendors = catchAsyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const searchQuery = req.query.filter;
  const skip = page * limit;

  // Filter by creator - only get vendors created by current user
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
      { business: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const totalVendors = await ManagedVendor.countDocuments(filter);

  let managedVendors;
  if (page === 0 && limit === 0) {
    managedVendors = await ManagedVendor.find(filter).sort({ createdAt: -1 });
  } else {
    managedVendors = await ManagedVendor.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  if (!managedVendors || managedVendors.length === 0) {
    return res.status(404).json({
      success: false,
      status: 404,
      message: "No Managed Vendors Found",
    });
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: managedVendors,
    total: totalVendors,
    page: page,
    limit: limit,
  });
});

// Get Managed Vendor By ID
exports.getManagedVendorById = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;

  const managedVendor = await ManagedVendor.findOne({
    _id: id,
    isDeleted: false,
    "creator.userId": creatorId,
  });

  if (!managedVendor) {
    return next(new ErrorHandler("Managed Vendor Not Found", 404));
  }

  res.status(200).json({
    success: true,
    status: 200,
    data: managedVendor,
  });
});

// Update Managed Vendor
exports.updateManagedVendor = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;
  const {
    first_name,
    last_name,
    mobileNumber,
    email,
    secondaryMobileNumber,
    business,
    address,
    avatar,
  } = req.body;

  const managedVendor = await ManagedVendor.findOne({
    _id: id,
    isDeleted: false,
    "creator.userId": creatorId,
  });

  if (!managedVendor) {
    return next(
      new ErrorHandler(
        "Managed Vendor Not Found or You don't have permission to update it",
        404
      )
    );
  }

  // Check if mobile number is being updated and if this creator already has another vendor with this number
  if (mobileNumber && mobileNumber !== managedVendor.mobileNumber) {
    const existingVendor = await ManagedVendor.findOne({
      mobileNumber,
      "creator.userId": creatorId,
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existingVendor) {
      return next(
        new ErrorHandler(
          "You have already created another vendor with this mobile number",
          400
        )
      );
    }
  }

  // Update fields
  if (first_name) managedVendor.first_name = first_name;
  if (last_name) managedVendor.last_name = last_name;
  if (mobileNumber) managedVendor.mobileNumber = mobileNumber;
  if (email) managedVendor.email = email;
  if (secondaryMobileNumber !== undefined)
    managedVendor.secondaryMobileNumber = secondaryMobileNumber;
  if (business) managedVendor.business = business;
  if (address) managedVendor.address = address;
  if (avatar) managedVendor.avatar = avatar;

  await managedVendor.save();

  res.status(200).json({
    success: true,
    status: 200,
    message: "Managed Vendor Updated Successfully",
    data: managedVendor,
  });
});

// Delete Managed Vendor (Soft Delete)
exports.deleteManagedVendor = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const creatorId = req.user._id;

  const managedVendor = await ManagedVendor.findOne({
    _id: id,
    "creator.userId": creatorId,
  });

  if (!managedVendor) {
    return next(
      new ErrorHandler(
        "Managed Vendor Not Found or You don't have permission to delete it",
        404
      )
    );
  }

  if (managedVendor.isDeleted) {
    return next(new ErrorHandler("Managed Vendor Already Deleted", 400));
  }

  managedVendor.isDeleted = true;
  await managedVendor.save();

  res.status(200).json({
    success: true,
    status: 200,
    message: "Managed Vendor Deleted Successfully",
    data: managedVendor,
  });
});
