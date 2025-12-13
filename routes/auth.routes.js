const express = require("express");
const {
  login,
  me,
  forgotPassword,
  demoRequestGet,
  resetPassword,
  register,
  verifyOtp,
  resendOtp,
} = require("../controller/auth.controller");
const router = express.Router();
const passport = require("passport");
// Routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", passport.authenticate("jwt", { session: false }), me);
router.post("/auth/forgotPassword", forgotPassword);
router.post("/demoRequest", demoRequestGet);
router.post("/auth/resetPassword", resetPassword);
router.post("/auth/account-verification", verifyOtp);
router.post("/auth/resend-otp", resendOtp);
module.exports = router;
