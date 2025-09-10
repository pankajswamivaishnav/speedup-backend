const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const {
  registerTransporter,
  loginTransporter,
  updateTransporter,
  updateTransporterPassword,
  forgotPassword, 
} = require("../../controller/user/user.controller");
const {
  getTotalTransporter,
  deleteTransporter
} = require("../../controller/admin/admin.controller");
const {
  getAllDrivers,
  createDriver,
  downloadDriverFile,
} = require("../../controller/driver/driver.controller");
router.route("/register/transporter").post(registerTransporter);
router.route("/login/transporter").get(loginTransporter);
router.route("/update/transporter/:id").put(updateTransporter);
router.route("/update/transporter/password/:id").put(updateTransporterPassword);
router.get("/admin/totalTransporter",passport.authenticate("jwt", {session:false}),getTotalTransporter)
router.route("/transporter/getAllDrivers").get(getAllDrivers);
router.route("/reset/forgotPassword").post(forgotPassword);
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
router.route("/admin/deleteTransporter/:id").put(deleteTransporter);
module.exports = router;
