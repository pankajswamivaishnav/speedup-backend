const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const {
  getAllDrivers,
  getAllDriversInBilty,
  createDriver,
  downloadDriverFile,
  deleteDriver,
} = require("../../controller/driver/driver.controller");
const {
  createDriverCard,
  getAllDriverCard,
} = require("../../controller/driver/driverCard.controller");
const {
  createManagedDriver,
  getAllManagedDrivers,
  getManagedDriverById,
  updateManagedDriver,
  deleteManagedDriver,
} = require("../../controller/driver/managedDriver.controller");
const {
  getAllManagedDriversForAdmin,
} = require("../../controller/admin/admin.controller");
router.route("/transporter/getAllDriversInBilty").get(getAllDriversInBilty);
router.get(
  "/getAllDrivers",
  passport.authenticate("jwt", { session: false }),
  getAllDrivers
);
router.post(
  "/createDriver",
  passport.authenticate("jwt", { session: false }),
  createDriver
);
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
router.delete(
  "/deleteDriver/:id",
  passport.authenticate("jwt", { session: false }),
  deleteDriver
);

// ------------ Driver Card Routes -------------
router.route("/createDriverCard").post(createDriverCard);
router.route("/getAllDriverCards").get(getAllDriverCard);

// ------------ Managed Driver Routes -------------
router.post(
  "/managed/create-driver",
  passport.authenticate("jwt", { session: false }),
  createManagedDriver
);
router.get(
  "/managed/get-all-drivers",
  passport.authenticate("jwt", { session: false }),
  getAllManagedDrivers
);
router.get(
  "/managed/get-driver/:id",
  passport.authenticate("jwt", { session: false }),
  getManagedDriverById
);
router.put(
  "/managed/update-driver/:id",
  passport.authenticate("jwt", { session: false }),
  updateManagedDriver
);
router.delete(
  "/managed/delete-driver/:id",
  passport.authenticate("jwt", { session: false }),
  deleteManagedDriver
);

// --------- Super Admin Routes -----------
router.get(
  "/admin/get-all-managed-drivers",
  passport.authenticate("jwt", { session: false }),
  getAllManagedDriversForAdmin
);

module.exports = router;
