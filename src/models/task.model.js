const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    stage_id: {
      type: Schema.Types.ObjectId,
      ref: "Stage",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    sort_order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
