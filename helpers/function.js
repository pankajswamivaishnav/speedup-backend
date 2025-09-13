require("dotenv").config();
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { JWT_SECRET } = require('../config/config');
const bcrypt = require('bcryptjs')

exports.genTransportId = async (id) => {
  try {
    const generetedId = moment().format("YYYY-MM-DD").split("-").join("") + id;
    return generetedId;
  } catch (err) {
    console.error(err);
    throw new Error("Error generating transport ID");
  }
};

function generateToken(payload, expiresIn = "1d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Hash password before saving
exports.hashPassword = async(password) => {
  return await bcrypt.hash(password, 10);
}

// Compare password
exports.comparePassword = async(plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
}


module.exports = { generateToken };
