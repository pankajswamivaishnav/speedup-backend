const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const { createVendor, getTotalVendors } = require("../../controller/vendors/vendor.controller");
const { createVendorCard, getAllVendorCard } = require("../../controller/vendors/vendorCard.controller");




router.route("/vendor/createVendor").post(createVendor);
router.get("/admin/totalVendors", passport.authenticate("jwt", {session:false}), getTotalVendors)

// -------------- Vendor Card Routes -------------
router.route("/createVendorCard").post(createVendorCard);
router.route("/getAllVendorCards").get(getAllVendorCard);
module.exports = router;
