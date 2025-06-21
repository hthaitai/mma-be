const mongoose = require("mongoose");

const quitPlanSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    target_quit_date: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      required: false, // không bắt buộc
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // user tạo mặc định là pending
    },
  },
  { timestamps: true }
);

const QuitPlan = mongoose.model("QuitPlan", quitPlanSchema);
module.exports = QuitPlan;
