const paymentModel = require("../../config/models/payment.model");
const Plan = require("../../config/models/plan.model");
const SubscriptionModel = require("../../config/models/subscription.model");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");
const { planSchemaValidation } = require("../../validation/plan.validation");
// Create Plans
exports.createPlan = catchAsyncHandler(async (req, res, next) => {
  const { name, description, price, features } = req.body;
  const { error } = planSchemaValidation(req.body);
  if (error) {
    return next(new ErrorHandler(error.message, 400));
  }
  const plan = await Plan.create({ name, description, price, features });
  if (!plan) {
    return next(new ErrorHandler("Plan not created", 400));
  }
  res.status(201).json({
    success: true,
    status: 201,
    message: "Plan created successfully",
    plan,
  });
});

// Get my plan
exports.getMyPlan = catchAsyncHandler(async (req, res, next) => {
  const subscription = await SubscriptionModel.findOne({
    userId: req.user._id,
    status: "active",
    // createdAt: -1,
  });

  const plan = await Plan.findById(subscription?.planId);

  const payment = await paymentModel.findOne({
    paymentId: subscription.paymentId,
  });

  if (!plan) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "Plan not found",
    });
  }

  res.status(200).json({
    success: true,
    status: 200,
    message: "Plan fetched successfully",
    plan,
    payment,
  });
});
