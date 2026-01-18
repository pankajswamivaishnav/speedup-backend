require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  APP_SECRET: process.env.APP_SECRET,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  MONGO_URI: process.env.MONGO_URI,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_API_SECRET: process.env.SENDGRID_API_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  RAZORPAY_URL: process.env.RAZORPAY_URL,
};
