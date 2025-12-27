const User = require("../../config/models/transporterSchema.model");
const ManagedTransporter = require("../../config/models/managedTransporter.model");
const ManagedDriver = require("../../config/models/managedDriver.model");
const ManagedVendor = require("../../config/models/managedVendor.model");
// Middleware & Utils Error
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");
const transporterSchemaModel = require("../../config/models/transporterSchema.model");

// Get Total Transporter
exports.getTotalTransporter = catchAsyncHandler(async (req, res, next) => {
  const page = req.query.page;
  const limit = req.query.limit;
  const searchQuery = req.query.filter;
  const skip = page * limit;

  let totalTransporter;
  // ---- query search and make common filter query ----
  let filter = { isDeleted: false };
  if (searchQuery && searchQuery !== "undefined") {
    filter.transportName = { $regex: searchQuery, $options: "i" };
  }

  const totalUsers = await transporterSchemaModel.countDocuments(filter);
  if (page == 0 && limit == 0) {
    totalTransporter = await transporterSchemaModel.find(filter);
  } else {
    totalTransporter = await transporterSchemaModel
      .find(filter)
      .skip(skip || 0)
      .limit(limit || 10);
  }

  res.status(200).json({
    success: true,
    data: totalTransporter,
    total: totalUsers,
  });
});

// Delete Transporter
exports.deleteTransporter = catchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const transporter = User.findById({ _id: id });
  if (!transporter) {
    return next("No transporter found !!", 404);
  }
  const deleteTransporter = await User.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  );
  if (deleteTransporter) {
    res.status(200).json({
      success: true,
      data: deleteTransporter,
    });
  }
});

// Get All Managed Transporters for Super Admin
exports.getAllManagedTransportersForAdmin = catchAsyncHandler(
  async (req, res, next) => {
    // Check if user is super_admin
    if (req.user.role !== "super_admin") {
      return next(
        new ErrorHandler("Unauthorized: Only super_admin can access this", 403)
      );
    }

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search;
    const creatorId = req.query.creatorId;
    const unique = req.query.unique === "true" || req.query.unique === true;
    const skip = page * limit;

    // Base filter
    let filter = { isDeleted: false };

    // Add creator filter if provided
    if (creatorId && creatorId !== "undefined") {
      filter["creator.userId"] = creatorId;
    }

    // Build search filter
    if (searchQuery && searchQuery !== "undefined") {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      const searchConditions = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email: searchRegex },
        { transportName: searchRegex },
        { mobileNumber: searchRegex }, // mobileNumber is String in ManagedTransporter
      ];
      filter.$or = searchConditions;
    }

    // Fetch all transporters
    let transporters = await ManagedTransporter.find(filter)
      .populate({
        path: "creator.userId",
        select: "first_name last_name mobileNumber email",
      })
      .sort({ createdAt: -1 });

    // Apply unique filter if requested
    if (unique) {
      const uniqueMap = new Map();
      const seenMobileNumbers = new Set();
      const seenEmails = new Set();

      transporters.forEach((transporter) => {
        const entity = transporter.toObject();
        const mobileKey = entity.mobileNumber?.toString().trim() || null;
        const emailKey = entity.email?.toString().toLowerCase().trim() || null;

        let isDuplicate = false;

        if (mobileKey && seenMobileNumbers.has(mobileKey)) {
          isDuplicate = true;
        }

        if (
          !isDuplicate &&
          emailKey &&
          emailKey !== "undefined" &&
          seenEmails.has(emailKey)
        ) {
          isDuplicate = true;
        }

        if (!isDuplicate) {
          uniqueMap.set(entity._id.toString(), entity);
          if (mobileKey) {
            seenMobileNumbers.add(mobileKey);
          }
          if (emailKey && emailKey !== "undefined") {
            seenEmails.add(emailKey);
          }
        }
      });

      transporters = Array.from(uniqueMap.values());
    }

    const total = transporters.length;

    // Apply pagination
    let paginatedTransporters;
    if (page === 0 && limit === 0) {
      paginatedTransporters = transporters;
    } else {
      paginatedTransporters = transporters.slice(skip, skip + limit);
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: paginatedTransporters,
      total: total,
      page: page,
      limit: limit,
    });
  }
);

// Get All Managed Vendors for Super Admin
exports.getAllManagedVendorsForAdmin = catchAsyncHandler(
  async (req, res, next) => {
    // Check if user is super_admin
    if (req.user.role !== "super_admin") {
      return next(
        new ErrorHandler("Unauthorized: Only super_admin can access this", 403)
      );
    }

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const searchQuery = req.query.search;

    const creatorId = req.quyrId;
    const unique = req.query.unique === "true" || req.query.unique === true;
    const skip = page * limit;

    // Base filter
    let filter = { isDeleted: false };

    // Add creator filter if provided
    if (creatorId && creatorId !== "und fined") {
      filter["creator.userId"] = creatorId;
    }

    // Build search filter
    if (searchQuery && searchQuery !== "undefined") {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      const searchConditions = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email: searchRegex },
        { business: searchRegex },
      ];

      // Handle mobileNumber search - it's Number in ManagedVendor
      const searchNum = parseInt(searchQuery);
      if (!isNaN(searchNum)) {
        searchConditions.push({ mobileNumber: searchNum });
      }

      filter.$or = searchConditions;
    }

    // Fetch all vendors
    let vendors = await ManagedVendor.find(filter)
      .populate({
        path: "creator.userId",
        select: "first_name last_name mobileNumber email",
      })
      .sort({ createdAt: -1 });

    // Apply unique filter if requested
    if (unique) {
      const uniqueMap = new Map();
      const seenMobileNumbers = new Set();
      const seenEmails = new Set();

      vendors.forEach((vendor) => {
        const entity = vendor.toObject();
        const mobileKey = entity.mobileNumber?.toString().trim() || null;
        const emailKey = entity.email?.toString().toLowerCase().trim() || null;

        let isDuplicate = false;

        if (mobileKey && seenMobileNumbers.has(mobileKey)) {
          isDuplicate = true;
        }

        if (
          !isDuplicate &&
          emailKey &&
          emailKey !== "undefined" &&
          seenEmails.has(emailKey)
        ) {
          isDuplicate = true;
        }

        if (!isDuplicate) {
          uniqueMap.set(entity._id.toString(), entity);
          if (mobileKey) {
            seenMobileNumbers.add(mobileKey);
          }
          if (emailKey && emailKey !== "undefined") {
            seenEmails.add(emailKey);
          }
        }
      });

      vendors = Array.from(uniqueMap.values());
    }

    const total = vendors.length;

    // Apply pagination
    let paginatedVendors;
    if (page === 0 && limit === 0) {
      paginatedVendors = vendors;
    } else {
      paginatedVendors = vendors.slice(skip, skip + limit);
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: paginatedVendors,
      total: total,
      page: page,
      limit: limit,
    });
  }
);

// Get All Managed Drivers for Super Admin
exports.getAllManagedDriversForAdmin = catchAsyncHandler(
  async (req, res, next) => {
    // Check if user is super_admin
    if (req.user.role !== "super_admin") {
      return next(
        new ErrorHandler("Unauthorized: Only super_admin can access this", 403)
      );
    }

    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search;
    const creatorId = req.query.creatorId;
    const unique = req.query.unique === "true" || req.query.unique === true;
    const skip = page * limit;

    // Base filter
    let filter = { isDeleted: false };

    // Add creator filter if provided
    if (creatorId && creatorId !== "undefined") {
      filter["creator.userId"] = creatorId;
    }

    // Build search filter
    if (searchQuery && searchQuery !== "undefined") {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      const searchConditions = [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { truckNumber: searchRegex },
      ];

      // Handle mobileNumber search - it's Number in ManagedDriver
      const searchNum = parseInt(searchQuery);
      if (!isNaN(searchNum)) {
        searchConditions.push({ mobileNumber: searchNum });
      }

      filter.$or = searchConditions;
    }

    // Fetch all drivers
    let drivers = await ManagedDriver.find(filter)
      .populate({
        path: "creator.userId",
        select: "first_name last_name mobileNumber email",
      })
      .sort({ createdAt: -1 });

    // Apply unique filter if requested
    if (unique) {
      const uniqueMap = new Map();
      const seenMobileNumbers = new Set();

      drivers.forEach((driver) => {
        const entity = driver.toObject();
        const mobileKey = entity.mobileNumber?.toString().trim() || null;

        let isDuplicate = false;

        if (mobileKey && seenMobileNumbers.has(mobileKey)) {
          isDuplicate = true;
        }

        if (!isDuplicate) {
          uniqueMap.set(entity._id.toString(), entity);
          if (mobileKey) {
            seenMobileNumbers.add(mobileKey);
          }
        }
      });

      drivers = Array.from(uniqueMap.values());
    }

    const total = drivers.length;

    // Apply pagination
    let paginatedDrivers;
    if (page === 0 && limit === 0) {
      paginatedDrivers = drivers;
    } else {
      paginatedDrivers = drivers.slice(skip, skip + limit);
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: paginatedDrivers,
      total: total,
      page: page,
      limit: limit,
    });
  }
);
