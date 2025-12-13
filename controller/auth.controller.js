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
const { generateOtp } = require("../helpers/function");
const otpModel = require("../config/models/otp.model");

// Register
const register = catchAsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, email, mobileNumber, role, password } =
      req.body;

    // 1️⃣ Create user
    await userModel.create(
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

    const otp = generateOtp();
    const expiresAt = moment().add(5, "minutes").toDate();
    await otpModel.create({
      email,
      otp,
      expiresAt,
    });
    const templateData = {
      title: "OTP Verification Code",
      greeting: "Pankaj Swami Vaishnav",
      message:
        "To verify your account, please use the One-Time Password (OTP) provided below. This OTP is valid for the next 10 minutes for security purposes.",
      otpCode: otp, // <-- yaha tumhara generated OTP aayega
      additionalInfo:
        "If you did not initiate this verification request, please ignore this email. Your account will remain secure.",
    };

    await sendEmail({
      email: email,
      subject: "Account Verification OTP",
      templateData,
    });

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

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 201,
      message: "Verification email sent successfully",
      data: result,
      expiresAt: expiresAt,
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

  if (user.isVerified !== true) {
    const otp = generateOtp();
    const expiresAt = moment().add(5, "minutes").toDate();
    await otpModel.create({
      email,
      otp,
      expiresAt,
    });
    const templateData = {
      title: "OTP Verification Code",
      greeting: "Pankaj Swami Vaishnav",
      message:
        "To verify your account, please use the One-Time Password (OTP) provided below. This OTP is valid for the next 10 minutes for security purposes.",
      otpCode: otp, // <-- yaha tumhara generated OTP aayega
      additionalInfo:
        "If you did not initiate this verification request, please ignore this email. Your account will remain secure.",
    };

    await sendEmail({
      email: email,
      subject: "Account Verification OTP",
      templateData,
    });

    return res.status(401).json({
      success: false,
      message: "User not verified",
      isVerified: false,
      expiresAt: expiresAt,
    });
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
      email: process.env.EMAIL_FROM,
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

// Verify otp
const verifyOtp = catchAsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { otp, email } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await otpModel
      .findOne({ email })
      .sort({ createdAt: -1 }) // newest OTP
      .exec();

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one.",
      });
    }

    // Check: already used?
    if (otpRecord.isUsed) {
      return res.status(400).json({
        success: false,
        message: "OTP already used. Please request a new one.",
      });
    }

    // Check: expired?
    if (otpRecord.expiresAt < moment()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Check: OTP match?
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Verify user mean isVerified true mark
    const [transporter, driver, vendor] = await Promise.all([
      Transporter.findOne({ $or: [{ email }] }),
      Driver.findOne({ $or: [{ email }] }),
      Vendor.findOne({ $or: [{ email }] }),
    ]);

    const user = transporter || driver || vendor;

    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }

    user.isVerified = true;
    await user.save();

    otpRecord.isUsed = true;
    await otpRecord.save();

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 200,
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Resend otp
const resendOtp = catchAsyncHandler(async (req, res, next) => {
  try {
    const otp = generateOtp();
    const expiresAt = moment().add(5, "minutes").toDate();
    await otpModel.create({
      email: req.body.email,
      otp,
      expiresAt,
    });
    const templateData = {
      title: "OTP Verification Code",
      greeting: "Pankaj Swami Vaishnav",
      message:
        "To verify your account, please use the One-Time Password (OTP) provided below. This OTP is valid for the next 10 minutes for security purposes.",
      otpCode: otp, // <-- yaha tumhara generated OTP aayega
      additionalInfo:
        "If you did not initiate this verification request, please ignore this email. Your account will remain secure.",
    };

    await sendEmail({
      email: req.body.email,
      subject: "Account Verification OTP",
      templateData,
    });

    res.status(200).json({
      success: true,
      message: "Resend OTP successfully",
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  login,
  me,
  forgotPassword,
  resetPassword,
  demoRequestGet,
  register,
  verifyOtp,
  resendOtp,
};
