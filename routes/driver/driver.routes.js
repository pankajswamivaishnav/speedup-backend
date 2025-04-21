const express = require("express");
const router = express.Router();

// Import Controller Functions
const {
  getAllDrivers,
  getAllDriversInBilty,
  createDriver,
  downloadDriverFile,
} = require("../../controller/driver/driver.controller");
router.route("/transporter/getAllDriversInBilty").get(getAllDriversInBilty);
router.route("/transporter/getAllDrivers").get(getAllDrivers);
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
module.exports = router;
