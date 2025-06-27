const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      // required: true,
    },
    end_date: {
      type: Date,
      // required: true,
    },
    status: { // Trạng thái của gói đăng ký
      type: String,
      enum: ["pending", "active", "cancelled", "expired", "grace_period"],
      default: "pending", // Mặc định là pending khi mới tạo
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
