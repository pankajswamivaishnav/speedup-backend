const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");
const Subscription = require("../../config/models/subscription.model");
const Payment = require("../../config/models/payment.model");
const Plan = require("../../config/models/plan.model");

// Create Subscription
exports.createSubscription = catchAsyncHandler(async (req, res, next) => {
  const { userId, planId, paymentId, startDate, endDate } = req.body;
  const subscription = await Subscription.create({
    userId,
    planId,
    paymentId,
    startDate,
    endDate,
  });
  if (!subscription) {
    return next(new ErrorHandler("Subscription not created", 400));
  }
  return res.status(201).json({
    success: true,
    status: 201,
    message: "Subscription created successfully",
    subscription,
  });
});
