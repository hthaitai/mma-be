const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stage_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stage",
    required: true,
  },
  date: { type: Date, required: true },
  cigarettes_smoked: { type: Number, default: 0 },
  health_status: { type: String },
  money_saved: { type: Number, default: 0 },
});

module.exports = mongoose.model("Progress", progressSchema);
