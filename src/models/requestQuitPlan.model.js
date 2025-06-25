const mongoose = require("mongoose");

const requestQuitPlanSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coach_id: {
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

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // user tạo mặc định là pending
    },
  },
  { timestamps: true }
);

const RequestQuitPlan = mongoose.model(
  "RequestQuitPlan",
  requestQuitPlanSchema
);
module.exports = RequestQuitPlan;
