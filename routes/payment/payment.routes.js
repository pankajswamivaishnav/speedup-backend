const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createOrder,
  verifyPayment,
} = require("../../controller/payment/payment.controller");
router.post(
  "/payment/create-order",
  passport.authenticate("jwt", { session: false }),
  createOrder
);
router.post(
  "/payment/verify-payment",
  passport.authenticate("jwt", { session: false }),
  verifyPayment
);

module.exports = router;
