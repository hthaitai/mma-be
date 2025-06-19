const express = require("express");
const paymentRouter = express.Router();
const {
  createPaymentLink,
  getPaymentByOrderCode,
  updatePaymentStatus,
  getAllPayments,
  markPaymentFailed,
} = require("../controllers/payment.controller");

paymentRouter.post("/create-payment-link", createPaymentLink);
paymentRouter.get("/order/:orderCode", getPaymentByOrderCode);
paymentRouter.put("/:paymentId", updatePaymentStatus);
paymentRouter.get("/all", getAllPayments);

// 👇 Xử lý khi người dùng hủy thanh toán (gọi từ cancel page)
paymentRouter.post("/mark-failed", markPaymentFailed);

module.exports = paymentRouter;
