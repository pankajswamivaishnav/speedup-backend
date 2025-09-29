const express = require("express");
const { login, me, forgotPassword, demoRequestGet } = require("../controller/auth.controller");
const router = express.Router();
const passport = require("passport");
// Routes
router.post("/auth/login", login);
router.get("/auth/me", passport.authenticate("jwt", { session: false }), me);
router.post("/forgotPassword", forgotPassword);
router.post("/demoRequest", demoRequestGet);
module.exports = router;
