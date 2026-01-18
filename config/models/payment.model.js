const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  customerId: { type: String },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  method: { type: String, required: true },
});

module.exports = mongoose.model("Payment", paymentSchema);
