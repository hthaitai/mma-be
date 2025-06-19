const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  order_code: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  },
  payment_date: {
    type: Date,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
