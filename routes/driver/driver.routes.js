const express = require("express");
const router = express.Router();
const passport = require('passport')

// Import Controller Functions
const {
  getAllDrivers,
  getAllDriversInBilty,
  createDriver,
  downloadDriverFile,
  deleteDriver,
} = require("../../controller/driver/driver.controller");
const { createDriverCard, getAllDriverCard } = require("../../controller/driver/driverCard.controller");
router.route("/transporter/getAllDriversInBilty").get(getAllDriversInBilty);
router.get(
  "/getAllDrivers",
  passport.authenticate("jwt", { session: false }),
  getAllDrivers
);
router.post("/createDriver", passport.authenticate("jwt", {session:false}), createDriver);
router.route("/driver/createDriver").post(createDriver);
router.route("/download/driversDataFile").get(downloadDriverFile);
router.delete("/deleteDriver/:id", passport.authenticate("jwt", {session:false}), deleteDriver);

// ------------ Driver Card Routes -------------
router.route("/createDriverCard").post(createDriverCard);
router.route("/getAllDriverCards").get(getAllDriverCard);
module.exports = router;
