const Joi = require("joi");

const BiltySchemaValidation = Joi.object({
  transportId: Joi.string().required().messages({
    "any.required": "Transport id is required.",
  }),
  gstNumber: Joi.string().optional(),
  registrationNumber: Joi.string().required().messages({
    "any.required": "Transport registration number is required.",
  }),
  mobileNumber: Joi.number().required().messages({
    "any.required": "Mobile number is required.",
  }),
  truckNumber: Joi.string().required().messages({
    "any.required": "Truck Number is required.",
  }),
  fromWhere: Joi.string().required().messages({
    "any.required": "Loading place is required.",
  }),
  whereTo: Joi.string().required().messages({
    "any.required": "Unloading place is required.",
  }),
  driverPhoneNumber: Joi.string().required().messages({
    "any.required": "Driver phone number is required.",
  }),
  driverName: Joi.string().required().messages({
    "any.required": "Driver name is required.",
  }),
  date: Joi.date().required().messages({
    "any.required": "Date is required.",
  }),
  // ✅ Adding senderInformation Validation
  senderInformation: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Sender name is required.",
    }),
    address: Joi.string().required().messages({
      "any.required": "Sender address is required.",
    }),
    senderNumber: Joi.number().required().messages({
      "any.required": "Sender number is required.",
    }),
  })
    .required()
    .messages({
      "any.required": "Sender information is required.",
    }),

  // ✅ Adding receiverInformation Validation
  receiverInformation: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Sender name is required.",
    }),
    address: Joi.string().required().messages({
      "any.required": "Sender address is required.",
    }),
    receiverNumber: Joi.number().required().messages({
      "any.required": "Sender number is required.",
    }),
  })
    .required()
    .messages({
      "any.required": "Sender information is required.",
    }),
  goodsCategory: Joi.string()
    .required()
    .message({ "any.required": "Goods category is required" }),
  weight: Joi.string()
    .required()
    .message({ "any.required": "Weight is required" }),
  truckCharge: Joi.string()
    .required()
    .message({ "any.required": "Truck charge is required" }),
  advanceCharge: Joi.string()
    .required()
    .message({ "any.required": "Advance is required" }),
  remainingCharge: Joi.string()
    .required()
    .message({ "any.required": "Remaining Charge is required" }),
  brokingCharge: Joi.string()
    .required()
    .message({ "any.required": "Broking Charge is required" }),
  paymentType: Joi.string()
    .required()
    .message({ "any.required": "Payment Mode(Type) is required" }),
  biltyNumber: Joi.string()
    .required()
    .message({ "any.required": "biltyNumber is required." }),
  month: Joi.string()
    .required()
    .message({ "any.required": "Biltyu making month is required" }),
});
