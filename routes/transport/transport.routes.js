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
  getAllManagedTransportersForAdmin,
  getAllManagedVendorsForAdmin,
  getAllManagedDriversForAdmin,
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
const {
  createManagedTransporter,
  getAllManagedTransporters,
  getManagedTransporterById,
  updateManagedTransporter,
  deleteManagedTransporter,
} = require("../../controller/transporter/managedTransporter.controller");
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
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
router.route("/admin/deleteTransporter/:id").put(deleteTransporter);
// --------- Transport Card Routes -----------
router.route("/createTransportCard").post(createTransportCard);
router.route("/getAllTransportCards").get(getAllTransportCards);

// --------- Managed Transporter Routes -----------
router.post(
  "/managed/create-transporter",
  passport.authenticate("jwt", { session: false }),
  createManagedTransporter
);
router.get(
  "/managed/get-all-transporters",
  passport.authenticate("jwt", { session: false }),
  getAllManagedTransporters
);
router.get(
  "/managed/get-transporter/:id",
  passport.authenticate("jwt", { session: false }),
  getManagedTransporterById
);
router.put(
  "/managed/update-transporter/:id",
  passport.authenticate("jwt", { session: false }),
  updateManagedTransporter
);
router.delete(
  "/managed/delete-transporter/:id",
  passport.authenticate("jwt", { session: false }),
  deleteManagedTransporter
);

// --------- Super Admin Routes -----------
router.get(
  "/admin/get-all-managed-transporters",
  passport.authenticate("jwt", { session: false }),
  getAllManagedTransportersForAdmin
);

module.exports = router;
