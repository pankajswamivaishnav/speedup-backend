const express = require("express");
const router = express.Router();
const passport = require('passport')

// Import Controller Functions
const {
  getAllDrivers,
  getAllDriversInBilty,
  createDriver,
  downloadDriverFile,
} = require("../../controller/driver/driver.controller");
router.route("/transporter/getAllDriversInBilty").get(getAllDriversInBilty);
router.get(
  "/getAllDrivers",
  passport.authenticate("jwt", { session: false }),
  getAllDrivers
);
router.post("/createDriver", passport.authenticate("jwt", {session:false}), createDriver)
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
module.exports = router;
