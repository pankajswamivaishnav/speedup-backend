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
module.exports = router;
