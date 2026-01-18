const catchAsyncHandler = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorHandler");
const Payment = require("../../config/models/payment.model");
const Plan = require("../../config/models/plan.model");
const Subscription = require("../../config/models/subscription.model");
const Transporter = require("../../config/models/transporterSchema.model");
const Vendor = require("../../config/models/vendors.models");
const Driver = require("../../config/models/driver.model");
const axios = require("axios");
const crypto = require("crypto");

// Create Order
exports.createOrder = catchAsyncHandler(async (req, res, next) => {
  const { planId } = req.body;

  // 1️⃣ Validate plan
  const plan = await Plan.findById(planId);
  if (!plan) {
    return next(new ErrorHandler("Plan not found", 404));
  }

  const amount = plan.price * 100; // paise

  // 2️⃣ Find user in transporter / driver / vendor
  const [transporter, driver, vendor] = await Promise.all([
    Transporter.findOne({ email: req.user.email }),
    Driver.findOne({ email: req.user.email }),
    Vendor.findOne({ email: req.user.email }),
  ]);

  const userProfile = transporter || driver || vendor;

  if (!userProfile) {
    return next(new ErrorHandler("User profile not found", 404));
  }

  let razorpayCustomerId = userProfile.razorpayCustomerId;

  // 3️⃣ Create Razorpay customer only if not exists
  if (!razorpayCustomerId) {
    const customerPayload = {
      name: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      contact: req.user.mobileNumber,
      notes: {
        userId: req.user._id.toString(),
      },
    };

    const customerResponse = await axios.post(
      `${process.env.RAZORPAY_URL}/customers`,
      customerPayload,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    razorpayCustomerId = customerResponse?.data?.id;

    if (!razorpayCustomerId) {
      return next(new ErrorHandler("Failed to create Razorpay customer", 400));
    }

    // 4️⃣ Save customerId in all profiles (safe update)
    await Promise.all([
      Transporter.updateOne(
        { email: req.user.email },
        { $set: { razorpayCustomerId } }
      ),
      Driver.updateOne(
        { email: req.user.email },
        { $set: { razorpayCustomerId } }
      ),
      Vendor.updateOne(
        { email: req.user.email },
        { $set: { razorpayCustomerId } }
      ),
    ]);
  }

  // 5️⃣ Create Razorpay order
  const orderResponse = await axios.post(
    `${process.env.RAZORPAY_URL}/orders`,
    {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        planId: planId,
      },
    },
    {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    }
  );

  if (!orderResponse?.data?.id) {
    return next(new ErrorHandler("Order not created", 400));
  }

  // 6️⃣ Response
  res.status(200).json({
    success: true,
    order: orderResponse.data,
    customerId: razorpayCustomerId,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
  });
});

// Create Payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
    } = req.body;

    // 2️⃣ Find user in transporter / driver / vendor
    const [transporter, driver, vendor] = await Promise.all([
      Transporter.findOne({ email: req.user.email }),
      Driver.findOne({ email: req.user.email }),
      Vendor.findOne({ email: req.user.email }),
    ]);

    const userProfile = transporter || driver || vendor;

    if (!userProfile) {
      return next(new ErrorHandler("User profile not found", 404));
    }

    let razorpayCustomerId = userProfile.razorpayCustomerId;

    // 1️⃣ Create expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // 2️⃣ Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 3️⃣ Get plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // 4️⃣ Save payment
    const payment = await Payment.create({
      userId: req.user._id,
      planId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      customerId: razorpayCustomerId,
      amount: plan.price,
      currency: "INR",
      status: "completed",
      method: "ONLINE",
    });

    // 5️⃣ Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    const subscription = await Subscription.create({
      userId: req.user._id,
      planId,
      paymentId: payment._id,
      startDate,
      endDate,
      status: "active",
    });

    await Promise.all([
      Transporter.findOneAndUpdate(
        { email: req.user.email },
        {
          isPremium: true,
          subscriptionId: subscription._id,
        }
      ),
      Driver.findOneAndUpdate(
        { email: req.user.email },
        {
          isPremium: true,
          subscriptionId: subscription._id,
        }
      ),
      Vendor.findOneAndUpdate(
        { email: req.user.email },
        {
          isPremium: true,
          subscriptionId: subscription._id,
        }
      ),
    ]);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Payment verified & premium activated",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
