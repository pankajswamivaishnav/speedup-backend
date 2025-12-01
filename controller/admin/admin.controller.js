const User = require("../../config/models/transporterSchema.model");
// Middleware & Utils Error
const catchAsyncHandler = require("../../middleware/catchAsyncError");

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

  const totalUsers = await User.countDocuments(filter);
  if (page == 0 && limit == 0) {
    totalTransporter = await User.find(filter);
  } else {
    totalTransporter = await User.find(filter)
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
