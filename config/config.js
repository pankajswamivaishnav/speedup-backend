require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  APP_SECRET: process.env.APP_SECRET,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};