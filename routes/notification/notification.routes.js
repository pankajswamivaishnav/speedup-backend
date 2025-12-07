const express = require("express");
const router = express.Router();
const passport = require("passport");
const pushNotification = require("../../controller/notification/notification.controller");

router.post("/subscribe", pushNotification);

module.exports = router;
