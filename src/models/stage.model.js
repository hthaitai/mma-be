const mongoose = require("mongoose");

const stageSchema = new mongoose.Schema(
  {
    stage_id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuitPlan",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    stage_number: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Stage = mongoose.model("Stage", stageSchema);
module.exports = Stage;
