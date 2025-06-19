const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    progress_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progress",
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
