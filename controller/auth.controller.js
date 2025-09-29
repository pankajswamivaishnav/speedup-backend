const catchAsyncHandler = require("../middleware/catchAsyncError");
const Transporter = require("../config/models/transporterSchema.model");
const Vendor = require("../config/models/vendors.models");
const Driver = require("../config/models/driver.model");
const setCookieToken = require("../utils/cookieToken");
const ErrorHandler = require("../utils/errorHandler");
const constants = require("../helpers/constants");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");

// Login Transporter
const login = catchAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Valid Email & Password", 400));
  }
  const user = await Transporter.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User not found", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Credentials mismatch"));
  }
  setCookieToken(user, 200, "Login Successfully", res);
});

const me = catchAsyncHandler(async (req, res) => {
  let requestUser = req.user;
  if (!requestUser) {
    res.status(constants.STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: constants.MESSAGES.USER.USER_NOT_FOUND,
    });
    return;
  }
  const user = await Transporter.findOne({
    email: requestUser.email,
  }).lean();

  if (!user) {
    res.status(constants.STATUS_CODES.NOT_FOUND).json({
      success: false,
      message: constants.MESSAGES.USER.USER_NOT_FOUND,
    });
    return;
  }
  setCookieToken(user, 200, "me", res);
});

// Forgot Password
const forgotPassword = catchAsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const [transporter, vendor, driver] = await Promise.all([
    Transporter.findOne({email:email}),
    Vendor.findOne({email:email}),
    Driver.findOne({email:email})
  ])
  const user = transporter || vendor || driver
  if (!user) {
    return next(new ErrorHandler("this email does not exist", 404));
  }
  // Get Reset Password From Schema Function
  const resetToken = user.genResetPasswordToken();
  await user.save({ validateBeforeSave: true });

  // Make Url Who's Send On Email
  const resetPasswordLink = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  try {
    const templateData = {
      title: 'Password Reset Request',
      greeting: "Pankaj Swami Vaishnav",
      message: 'We received a request to reset your password. Click the button below to create a new password. This link will expire in 24 hours for security reasons.',
      buttonText: 'Change Password',
      buttonUrl: `${resetPasswordLink}`,
      additionalInfo: 'If you didn\'t request this password reset, please ignore this email. Your password will remain unchanged.'
  };
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset",
      templateData
    });
    res.status(200).json({
      success: true,
      message: `Email Sent successfully On ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordTokens = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// Demo request email
const demoRequestGet = catchAsyncHandler(async (req, res, next) => {
  try {
    const demoData = {
      title: "New Demo Request Received",
      greeting: "Admin",   // ✅ add greeting
      message: "A new demo request has been submitted by the user. Please check the details below:",
      buttonText: "View Request",
      buttonUrl: `${process.env.FRONTEND_URL}/admin/demo-requests`,
      additionalInfo: `User ${req.body.name} with phone number ${req.body.mobileNumber} and email ${req.body.email} has requested a demo on ${moment(req.body.dateTime).format("YYYY-MM-DD")} at ${moment(req.body.dateTime).format("hh:mmA")}.`

    };
    await sendEmail({
      email: req.body.email,
      subject: "Speed up demo request",
      templateData: demoData   // ✅ fixed
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Send demo request successfully."
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


module.exports = { login, me, forgotPassword, demoRequestGet };
