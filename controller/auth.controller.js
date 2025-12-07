const catchAsyncHandler = require("../middleware/catchAsyncError");
const Transporter = require("../config/models/transporterSchema.model");
const Vendor = require("../config/models/vendors.models");
const Driver = require("../config/models/driver.model");
const setCookieToken = require("../utils/cookieToken");
const ErrorHandler = require("../utils/errorHandler");
const constants = require("../helpers/constants");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");
const crypto = require("crypto");
const userModel = require("../config/models/user.model");
const mongoose = require("mongoose");
const sendNotificationToAllUsers = require("../utils/sendNotificationToAllUsers");

// Register
const register = catchAsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, email, mobileNumber, role, password } =
      req.body;

    // 1️⃣ Create user
    const user = await userModel.create(
      [
        {
          firstName,
          lastName,
          email,
          mobileNumber,
          role,
          password,
        },
      ],
      { session }
    );

    let result;

    // 2️⃣ Create related table record based on role
    switch (role) {
      case "transporter":
        result = await Transporter.create(
          [
            {
              first_name: firstName,
              last_name: lastName,
              mobileNumber,
              password,
              email,
              role,
            },
          ],
          { session }
        );
        break;

      case "vendor":
        result = await Vendor.create(
          [
            {
              first_name: firstName,
              last_name: lastName,
              mobileNumber,
              password,
              email,
              role,
            },
          ],
          { session }
        );
        break;

      case "driver":
        result = await Driver.create(
          [
            {
              first_name: firstName,
              last_name: lastName,
              mobileNumber,
              password,
              email,
              role,
            },
          ],
          { session }
        );
        break;
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Send notification to all users when transporter is registered
    if (role === "transporter" && result && result.length > 0) {
      try {
        const transporterName =
          result[0].transportName || `${firstName} ${lastName}`;
        await sendNotificationToAllUsers({
          title: "New Transporter Registered! 🚚",
          body: `${transporterName} has joined Speed Up. Check them out!`,
          url: "/transporters",
        });
      } catch (notificationError) {
        // Log error but don't fail the registration
        console.error("Error sending notifications:", notificationError);
      }
    }

    res.status(201).json({
      status: 201,
      message: "User Created Successfully",
      data: result,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// Login User
const login = catchAsyncHandler(async (req, res, next) => {
  const { email, mobileNumber, password, keepSignedIn } = req.body;

  if ((!email && !mobileNumber) || !password) {
    return next(
      new ErrorHandler(
        "Please enter a valid Email or Mobile Number & Password",
        400
      )
    );
  }

  // Find user by email or mobileNumber
  const [transporter, driver, vendor] = await Promise.all([
    Transporter.findOne({ $or: [{ email }, { mobileNumber }] }),
    Driver.findOne({ $or: [{ email }, { mobileNumber }] }),
    Vendor.findOne({ $or: [{ email }, { mobileNumber }] }),
  ]);

  const user = transporter || driver || vendor;

  if (!user) {
    return next(new ErrorHandler("User not found", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Credentials mismatch", 401));
  }

  setCookieToken(user, 200, "Login Successfully", res, keepSignedIn);
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

  const [transporter, driver, vendor] = await Promise.all([
    Transporter.findOne({ email: requestUser.email }).lean(),
    Driver.findOne({ email: requestUser.email }).lean(),
    Vendor.findOne({ email: requestUser.email }).lean(),
  ]);

  const user = transporter || driver || vendor;

  // const user = await Transporter.findOne({
  //   email: requestUser.email,
  // }).lean();

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
    Transporter.findOne({ email: email }),
    Vendor.findOne({ email: email }),
    Driver.findOne({ email: email }),
  ]);
  const user = transporter || vendor || driver;
  if (!user) {
    return next(new ErrorHandler("this email does not exist", 404));
  }
  // Get Reset Password From Schema Function
  const resetToken = user.genResetPasswordToken();

  await user.save({ validateBeforeSave: true });

  // Make Url Who's Send On Email
  const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  try {
    const templateData = {
      title: "Password Reset Request",
      greeting: "Pankaj Swami Vaishnav",
      message:
        "We received a request to reset your password. Click the button below to create a new password. This link will expire in 24 hours for security reasons.",
      buttonText: "Change Password",
      buttonUrl: `${resetPasswordLink}`,
      additionalInfo:
        "If you didn't request this password reset, please ignore this email. Your password will remain unchanged.",
    };
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset",
      templateData,
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
      greeting: "Admin", // ✅ add greeting
      message:
        "A new demo request has been submitted by the user. Please check the details below:",
      buttonText: "View Request",
      buttonUrl: `${process.env.FRONTEND_URL}/admin/demo-requests`,
      additionalInfo: `User ${req.body.name} with phone number ${
        req.body.mobileNumber
      } and email ${req.body.email} has requested a demo on ${moment(
        req.body.dateTime
      ).format("YYYY-MM-DD")} at ${moment(req.body.dateTime).format(
        "hh:mmA"
      )}.`,
    };
    await sendEmail({
      email: req.body.email,
      subject: "Speed up demo request",
      templateData: demoData, // ✅ fixed
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Send demo request successfully.",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password
const resetPassword = catchAsyncHandler(async (req, res, next) => {
  const { token, email, password } = req.body;
  if (!token) {
    res.status(404).json({
      status: 404,
      success: false,
      message: "Reset token is missing",
    });
  }

  // Hash the incoming token before checking DB
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const [transporter, vendor, driver] = await Promise.all([
    Transporter.findOne({ email: email, resetPasswordToken: hashToken }),
    Vendor.findOne({ email: email, resetPasswordToken: hashToken }),
    Driver.findOne({ email: email, resetPasswordToken: hashToken }),
  ]);

  const user = transporter || vendor || driver;
  if (!user) {
    return next(
      new ErrorHandler(
        "this email does not exist or reset token expired or invalid",
        404
      )
    );
  }

  user.password = password;

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

module.exports = {
  login,
  me,
  forgotPassword,
  resetPassword,
  demoRequestGet,
  register,
};
