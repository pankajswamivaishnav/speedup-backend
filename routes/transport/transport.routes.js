const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const {
  registerTransporter,
  loginTransporter,
  updateUser,
  updateTransporterPassword,
  getUserById,
  // forgotPassword,
} = require("../../controller/user/user.controller");
const {
  getTotalTransporter,
  deleteTransporter,
} = require("../../controller/admin/admin.controller");
const {
  getAllDrivers,
  createDriver,
  downloadDriverFile,
} = require("../../controller/driver/driver.controller");
const {
  createTransportCard,
  getAllTransportCards,
} = require("../../controller/user/transportCard.controller");
router.route("/register/transporter").post(registerTransporter);
router.route("/login/transporter").get(loginTransporter);
// router.route("/update/transporter/:id").put(updateTransporter);
router.put(
  "/update/user",
  passport.authenticate("jwt", { session: false }),
  updateUser
);
router.route("/update/transporter/password/:id").put(updateTransporterPassword);
router.get(
  "/admin/totalTransporter",
  passport.authenticate("jwt", { session: false }),
  getTotalTransporter
);
router.get(
  "/getUser",
  passport.authenticate("jwt", { session: false }),
  getUserById
);
router.route("/transporter/getAllDrivers").get(getAllDrivers);
// router.route("/reset/forgotPassword").post(forgotPassword);
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
router.route("/admin/deleteTransporter/:id").put(deleteTransporter);
// --------- Transport Card Routes -----------
router.route("/createTransportCard").post(createTransportCard);
router.route("/getAllTransportCards").get(getAllTransportCards);
module.exports = router;
