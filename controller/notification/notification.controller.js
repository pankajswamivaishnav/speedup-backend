// routes/pushRoutes.js
const express = require("express");
const NotificationSubscription = require("../../config/models/NotificationSubscription");

const pushNotification = async (req, res, next) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription) {
      return res
        .status(400)
        .json({ success: false, message: "Subscription data is required" });
    }

    const doc = await NotificationSubscription.findOneAndUpdate(
      { userId },
      { subscription },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

module.exports = pushNotification;
