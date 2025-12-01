const express = require("express");
const {
  login,
  me,
  forgotPassword,
  demoRequestGet,
  resetPassword,
  register,
} = require("../controller/auth.controller");
const router = express.Router();
const passport = require("passport");
// Routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", passport.authenticate("jwt", { session: false }), me);
router.post("/forgotPassword", forgotPassword);
router.post("/demoRequest", demoRequestGet);
router.post("/resetPassword", resetPassword);
module.exports = router;
