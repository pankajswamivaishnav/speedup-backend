const express = require("express");
const router = express.Router();
const passport = require("passport");

// Import Controller Functions
const {
  createVendor,
  getTotalVendors,
  deleteVendor,
} = require("../../controller/vendors/vendor.controller");
const {
  getAllManagedVendorsForAdmin,
} = require("../../controller/admin/admin.controller");
const {
  createVendorCard,
  getAllVendorCard,
} = require("../../controller/vendors/vendorCard.controller");
const {
  createManagedVendor,
  getAllManagedVendors,
  getManagedVendorById,
  updateManagedVendor,
  deleteManagedVendor,
} = require("../../controller/vendors/managedVendor.controller");

router.route("/vendor/createVendor").post(createVendor);
router.get(
  "/admin/totalVendors",
  passport.authenticate("jwt", { session: false }),
  getTotalVendors
);
router.delete(
  "/admin/deleteVendor/:id",
  passport.authenticate("jwt", { session: false }),
  deleteVendor
);

// -------------- Vendor Card Routes -------------
router.route("/createVendorCard").post(createVendorCard);
router.route("/getAllVendorCards").get(getAllVendorCard);

// -------------- Managed Vendor Routes -------------
router.post(
  "/managed/create-vendor",
  passport.authenticate("jwt", { session: false }),
  createManagedVendor
);
router.get(
  "/managed/get-all-vendors",
  passport.authenticate("jwt", { session: false }),
  getAllManagedVendors
);
router.get(
  "/managed/get-vendor/:id",
  passport.authenticate("jwt", { session: false }),
  getManagedVendorById
);
router.put(
  "/managed/update-vendor/:id",
  passport.authenticate("jwt", { session: false }),
  updateManagedVendor
);
router.delete(
  "/managed/delete-vendor/:id",
  passport.authenticate("jwt", { session: false }),
  deleteManagedVendor
);

// --------- Super Admin Routes -----------
router.get(
  "/admin/get-all-managed-vendors",
  passport.authenticate("jwt", { session: false }),
  getAllManagedVendorsForAdmin
);

module.exports = router;
