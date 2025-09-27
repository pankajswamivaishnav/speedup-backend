const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const { createVendor, getTotalVendors, deleteVendor } = require("../../controller/vendors/vendor.controller");
const { createVendorCard, getAllVendorCard } = require("../../controller/vendors/vendorCard.controller");




router.route("/vendor/createVendor").post(createVendor);
router.get("/admin/totalVendors", passport.authenticate("jwt", {session:false}), getTotalVendors);
router.delete("/admin/deleteVendor/:id", passport.authenticate("jwt", {session:false}), deleteVendor);

// -------------- Vendor Card Routes -------------
router.route("/createVendorCard").post(createVendorCard);
router.route("/getAllVendorCards").get(getAllVendorCard);
module.exports = router;
