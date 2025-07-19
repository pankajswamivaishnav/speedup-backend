const Transporter = require("../../config/models/transporterSchema.model");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const setCookieToken = require("../../utils/cookieToken");
const sendEmail = require("../../utils/sendEmail");
const moment = require("moment");
// const { genTransportId } = require("../../helpers/function");
//Register Transporter
exports.registerTransporter = catchAsyncHandler(async (req, res, next) => {
  // let TransportId = await genTransportId(req.body.mobileNumber);
  // console.log("Generated Transport ID:", TransportId);

  const {
    transportName,
    transporter_first_name,
    transporter_last_name,
    mobileNumber,
    officeNumber,
    registrationNumber,
    gstNumber,
    transportAddress,
    email,
    panCardNumber,
    pinCode,
    city,
    state,
    country,
    password,
    faithLine,
  } = req.body;
  const transporterProfile = await Transporter.create({
    transportName,
    transporter_first_name,
    transporter_last_name,
    mobileNumber,
    officeNumber,
    registrationNumber,
    gstNumber,
    transportAddress,
    email,
    faithLine,
    panCardNumber,
    pinCode,
    city,
    state,
    country,
    password,
    avatar: {
      public_id: "sample id",
      url: "profileUrl",
    },
    createdAt: moment().format("YYYY-MM-DD"),
  });

  if (!transporterProfile) {
    return next(new ErrorHandler("Transporter Not Register ", 404));
  }
  setCookieToken(
    transporterProfile,
    201,
    "Transporter Created Successfully",
    res
  );
});

// Login Transporter
exports.loginTransporter = catchAsyncHandler(async (req, res, next) => {
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
  const token = await setCookieToken(user, 200, res);
});

// Update Transporter Profile
exports.updateTransporter = catchAsyncHandler(async (req, res, next) => {
  let id = req.params.id;
  const {
    transportName,
    transporterName,
    mobileNumber,
    officeNumber,
    registrationNumber,
    gstNumber,
    transportAddress,
    email,
    panCardNumber,
    pinCode,
    city,
    state,
    country,
    faithLine,
  } = req.body;
  const user = await User.findById({ _id: id });
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  user.transportName = transportName || user.transportName;
  user.transporterName = transporterName || user.transporterName;
  (user.mobileNumber = mobileNumber || user.mobileNumber),
    (user.officeNumber = officeNumber || user.officeNumber),
    (user.registrationNumber = registrationNumber || user.registrationNumber),
    (user.email = email || user.email),
    (user.faithLine = faithLine || user.faithLine),
    (user.country = country || user.country),
    (user.state = state || user.state),
    (user.city = city || user.city),
    (user.pinCode = pinCode || user.pinCode),
    (user.panCardNumber = panCardNumber || user.panCardNumber),
    (user.gstNumber = gstNumber || user.gstNumber),
    (user.transportAddress = transportAddress || user.transportAddress);
  const isUpdateTransporter = await user.save();
  if (!isUpdateTransporter) {
    return next(new ErrorHandler("Transporter not updated", 404));
  }
  res.status(204).json({
    success: true,
    message: "Update Transporter",
  });
});

// Update Password
exports.updateTransporterPassword = catchAsyncHandler(
  async (req, res, next) => {
    const id = req.params.id;
    const { oldPassword, password, confirm_password } = req.body;
    const user = await User.findById({ _id: id });

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    if (!password || !confirm_password) {
      return next(new ErrorHandler("Please Fill cardentails Properly"));
    }
    if (password !== confirm_password) {
      return next(new ErrorHandler("password must be same", 400));
    }

    if (!user) {
      return next(new ErrorHandler("user not found through this id", 404));
    }
    (user.password = password || user.password),
      (user.confirm_password = confirm_password || user.password);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Update Password",
    });
  }
);

// Forgot Password
exports.forgotPassword = catchAsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new ErrorHandler("this email does not exist", 404));
  }
  // Get Reset Password From Schema Function
  const resetToken = user.genResetPasswordToken();
  await user.save({ validateBeforeSave: true });

  // Make Url Who's Send On Email
  const resetPasswordLink = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;
  const message = ` Your reset password token is : - \n\n  ${resetPasswordLink}\n\n If you have not requested so please ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset",
      message: message,
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
