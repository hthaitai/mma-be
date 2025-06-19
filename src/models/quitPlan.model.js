const mongoose = require("mongoose");

const quitPlanSchema = new mongoose.Schema(
  {
    plan_id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
    },

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
  },
  { timestamps: true }
);

const QuitPlan = mongoose.model("QuitPlan", quitPlanSchema);
module.exports = QuitPlan;
