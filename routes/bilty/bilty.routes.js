const express = require("express");
const router = express.Router();

// Import Controller Functions
const {
  bilty,
  getAllBiltis,
  getAllBiltyBySingleDriver,
  downloadAllBiltyData,
  getAllBiltyByMonth,
  getBiltyByDate,
  deleteBilty,
} = require("../../controller/bilty/bilty.controller");
const passport = require("passport");

router.post("/bilty", passport.authenticate("jwt", {session:false}), bilty)
router.get("/getAllBilties", passport.authenticate("jwt", {session:false}), getAllBiltis)
router
  .route("/transporter/getAllBiltisByDriver/:id")
  .get(getAllBiltyBySingleDriver);
router.route("/transporter/getBiltyByDate/:date").get(getBiltyByDate);
router.route("/download/biltiesDataFile").get(downloadAllBiltyData);
router.route("/transporter/getAllBiltisByMonth").get(getAllBiltyByMonth);
router.delete("/deleteBilty/:id", passport.authenticate("jwt", {session:false}), deleteBilty)
module.exports = router;
