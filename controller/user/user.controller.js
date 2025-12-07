const Transporter = require("../../config/models/transporterSchema.model");
// Middleware & Utils Error
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncHandler = require("../../middleware/catchAsyncError");
const setCookieToken = require("../../utils/cookieToken");
// const sendEmail = require("../../utils/sendEmail");
const moment = require("moment");
const transportCardModel = require("../../config/models/transportCard.model");
const sendEmail = require("../../utils/sendEmail");
const Vendor = require("../../config/models/vendors.models");
const Driver = require("../../config/models/driver.model");
const sendNotificationToAllUsers = require("../../utils/sendNotificationToAllUsers");
//Register Transporter
exports.registerTransporter = catchAsyncHandler(async (req, res, next) => {
  const {
    transportName,
    first_name,
    last_name,
    mobileNumber,
    officeNumber,
    registrationNumber,
    gstNumber,
    transportAddress,
    email,
    panCardNumber,
    transporterId,
    pinCode,
    city,
    state,
    country,
    password,
    faithLine,
    role,
    avatar,
  } = req.body;

  const transporter = await Transporter.findOne({
    $or: [{ mobileNumber, officeNumber }],
  });

  if (transporter) {
    if (!transporter.transportIds.includes(transporterId)) {
      transporter.transportIds.push(transporterId);
      await transporter.save();
    }
    setCookieToken(transporter, 201, "Transporter Created Successfully", res);
  }

  const transporterProfile = await Transporter.create({
    transportName,
    first_name: first_name,
    last_name: last_name,
    mobileNumber,
    officeNumber,
    registrationNumber,
    gstNumber,
    transportAddress,
    email,
    faithLine,
    panCardNumber,
    transportIds: transporterId ? [transporterId] : [],
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
      { officeNumber: officeNumber },
    ],
  });

  // ------ Create Transporter Card ------
  if (!transportCard) {
    await transportCardModel.create({
      first_name: first_name,
      last_name: last_name,
      email,
      mobileNumber,
      officeNumber,
      transportName,
      city,
      address: transportAddress,
      avatar,
    });
  }

  const templateData = {
    title: "Welcome to Speed Up !",
    greeting: `${first_name} ${last_name}`,
    message: `We’re excited to have you on board with Speed Up! 🚀  
  Your account has been created successfully, and you’re all set to start accelerating your success with us.  
  Click the button below to explore your dashboard and get started.`,
    buttonText: "Go to Dashboard",
    buttonUrl: `http://localhost:3000/dashboard`,
    additionalInfo:
      "If you have any questions or need help, our support team is always here for you.",
  };

  await sendEmail({
    email: email,
    subject: "🎉 Welcom to Speed Up ! 🎉",
    templateData,
  });

  // Send notification to all users when transporter is registered
  try {
    const transporterName = transportName || `${first_name} ${last_name}`;
    await sendNotificationToAllUsers({
      title: "New Transporter Registered! 🚚",
      body: `${transporterName} has joined Speed Up. Check them out!`,
      url: "/transporters",
    });
  } catch (notificationError) {
    // Log error but don't fail the registration
    console.error("Error sending notifications:", notificationError);
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
exports.updateUser = catchAsyncHandler(async (req, res, next) => {
  let id = req.params.id;
  const loginUser = await req.user;

  let isUpdatedUser;
  switch (loginUser.role) {
    case "transporter": {
      const {
        transportName,
        first_name,
        last_name,
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
        avatar,
      } = req.body;
      const user = await Transporter.findById({ _id: loginUser._id });
      if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
      }
      user.transportName = transportName || user.transportName;
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
      (user.mobileNumber = mobileNumber || user.mobileNumber),
        (user.officeNumber = officeNumber || user.officeNumber),
        (user.registrationNumber =
          registrationNumber || user.registrationNumber),
        (user.email = email || user.email),
        (user.faithLine = faithLine || user.faithLine),
        (user.country = country || user.country),
        (user.state = state || user.state),
        (user.city = city || user.city),
        (user.pinCode = pinCode || user.pinCode),
        (user.panCardNumber = panCardNumber || user.panCardNumber),
        (user.gstNumber = gstNumber || user.gstNumber),
        (user.transportAddress = transportAddress || user.transportAddress),
        (user.avatar = avatar || user.avatar),
        (user.role = role || user.role);

      isUpdatedUser = await user.save();
      break;
    }
    case "vendor": {
      const {
        first_name,
        last_name,
        mobileNumber,
        address,
        business,
        vendorSecondaryPhoneNumber,
        email,
        pinCode,
        transportId,
        city,
        state,
        country,
        avatar,
      } = req.body;
      const update = {
        first_name: first_name,
        last_name: last_name,
        mobileNumber: mobileNumber,
        address: address,
        business: business,
        vendorSecondaryPhoneNumber: vendorSecondaryPhoneNumber,
        email: email,
        pinCode: pinCode,
        transportId: transportId,
        city: city,
        state: state,
        country: country,
        avatar: avatar,
      };

      isUpdatedUser = await Vendor.findByIdAndUpdate(
        { _id: loginUser._id },
        { $set: update },
        { new: true }
      );
      break;
    }
    case "driver": {
      const update = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        mobileNumber: req.body.mobileNumber,
        licenseNumber: req.body.licenseNumber,
        address: req.body.address,
        truckNumber: req.body.truckNumber,
      };
      isUpdatedUser = await Driver.findByIdAndUpdate(
        {
          _id: loginUser._id,
        },
        { $set: update },
        { new: true }
      );

      break;
    }
  }

  if (!isUpdatedUser) {
    return next(new ErrorHandler("User not updated", 404));
  }

  res.status(204).json({
    success: true,
    message: "Update User",
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

// Get logged In user
exports.getUserById = catchAsyncHandler(async (req, res, next) => {
  const user = req.user;
  let response;
  switch (user.role) {
    case "transporter": {
      response = await Transporter.findById({ _id: user._id });
      break;
    }
    case "vendor": {
      response = await Vendor.findById({ _id: user._id });
      break;
    }
    case "driver": {
      response = await Driver.findById({ _id: user._id });
      break;
    }
  }
  if (!response) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Get user successfully",
    data: response,
  });
});
