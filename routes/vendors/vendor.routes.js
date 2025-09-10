const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const { createVendor, getTotalVendors } = require("../../controller/vendors/vendor.controller");




router.route("/vendor/createVendor").post(createVendor);
router.get("/admin/totalVendors", passport.authenticate("jwt", {session:false}), getTotalVendors)

module.exports = router;
