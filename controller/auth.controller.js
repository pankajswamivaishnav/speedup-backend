const catchAsyncHandler = require("../middleware/catchAsyncError");
const Transporter = require("../config/models/transporterSchema.model");
const setCookieToken = require("../utils/cookieToken");
const ErrorHandler = require("../utils/errorHandler");
const constants = require("../helpers/constants");
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

module.exports = { login, me };
