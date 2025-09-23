const Transporter = require("../../config/models/transporterSchema.model");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const setCookieToken = require("../../utils/cookieToken");
// const sendEmail = require("../../utils/sendEmail");
const moment = require("moment");
const transportCardModel = require("../../config/models/transportCard.model");
const sendEmail = require("../../utils/sendEmail");
//Register Transporter
exports.registerTransporter = catchAsyncHandler(async (req, res, next) => {
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
    role,
    avatar,
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
    role,
   avatar,
    createdAt: moment().format("YYYY-MM-DD"),
  });

  if (!transporterProfile) {
    return next(new ErrorHandler("Transporter Not Register ", 404));
  }

  // ----- Here check card is already have or not ----------
  const transportCard = await transportCardModel.findOne({
    $or: [
      { email: email },
      { mobileNumber: mobileNumber },
      { officeNumber: officeNumber }
    ]
  })

  // ------ Create Transporter Card ------
  if(!transportCard){
    await transportCardModel.create({
      first_name:transporter_first_name,
      last_name:transporter_last_name,
      email,
      mobileNumber,
      officeNumber,
      transportName,
      city,
      address:transportAddress,
      avatar
    })
  }
 
  const templateData = {
    title: 'Welcome to Speed Up !',
    greeting:`${transporter_first_name} ${transporter_last_name}`,
    message: `We’re excited to have you on board with Speed Up! 🚀  
  Your account has been created successfully, and you’re all set to start accelerating your success with us.  
  Click the button below to explore your dashboard and get started.`,
    buttonText: 'Go to Dashboard',
    buttonUrl: `http://localhost:3000/dashboard`,
    additionalInfo: 'If you have any questions or need help, our support team is always here for you.'
};

  await sendEmail({
    email:email,
    subject: "🎉 Welcom to Speed Up ! 🎉",
    templateData
  });

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
    role,
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
    (user.role = role || user.role);
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


