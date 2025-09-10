require("dotenv").config();
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { JWT_SECRET } = require('../config/config');

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

module.exports = { generateToken };
