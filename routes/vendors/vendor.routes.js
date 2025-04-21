const express = require("express");
const router = express.Router();

// Import Controller Functions
const { createVendor } = require("../../controller/vendors/vendor.controller");
router.route("/vendor/createVendor").post(createVendor);

module.exports = router;
