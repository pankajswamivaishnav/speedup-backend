const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createPlan,
  getMyPlan,
} = require("../../controller/plans/plan.controller");

router.post(
  "/plan/createPlan",
  passport.authenticate("jwt", { session: false }),
  createPlan
);

router.get(
  "/plan/get-my-plan",
  passport.authenticate("jwt", { session: false }),
  getMyPlan
);

module.exports = router;
