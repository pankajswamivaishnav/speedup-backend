const mongoose = require("mongoose");

const notificationSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subscription: { type: Object, required: true },
});

module.exports = mongoose.model(
  "NotificationSubscription",
  notificationSubscriptionSchema
);
