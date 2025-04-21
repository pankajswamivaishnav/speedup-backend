const express = require("express");
const router = express.Router();

// Import Controller Functions
const {
  biltyDataSave,
  getAllBiltis,
  getAllBiltyBySingleDriver,
  downloadAllBiltyData,
  getAllBiltyByMonth,
  getBiltyByDate,
} = require("../../controller/bilty/bilty.controller");

router.route("/make/bilty").post(biltyDataSave);
router.route("/transporter/getAllBiltis").get(getAllBiltis);
router
  .route("/transporter/getAllBiltisByDriver/:id")
  .get(getAllBiltyBySingleDriver);
router.route("/transporter/getBiltyByDate/:date").get(getBiltyByDate);
router.route("/download/biltiesDataFile").get(downloadAllBiltyData);
router.route("/transporter/getAllBiltisByMonth").get(getAllBiltyByMonth);
module.exports = router;
