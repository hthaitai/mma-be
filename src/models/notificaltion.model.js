const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuitPlan",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,

      required: true,
    },
    schedule: {
      type: Date,
      required: true,
    },
    is_sent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
