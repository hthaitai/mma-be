const Payment = require("../models/payment.model");
const Subscription = require("../models/subscription.model");

const handlePaymentWebhook = async (req, res) => {
  try {
    console.log("--- Webhook received ---");
    const body = req.body;
    console.log("📦 Full Body (parsed):", JSON.stringify(body, null, 2));

    const data = body.data;
    if (!data || !data.orderCode || body.code !== "00" || data.code !== "00") {
      console.warn("❌ Dữ liệu không hợp lệ");
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const orderCode = data.orderCode.toString();
    console.log("🔍 Đang tìm với order_code:", orderCode);

    const payment = await Payment.findOne({ order_code: orderCode });

    if (!payment) {
      const all = await Payment.find().lean();
      console.log(
        "📋 Tất cả order_code trong DB:",
        all.map((p) => p.order_code)
      );
      return res.status(404).json({ message: "Không tìm thấy payment" });
    }

    if (payment.status === "PAID") {
      console.log("✅ Payment đã được xử lý trước đó");
      return res
        .status(200)
        .json({ message: "Payment đã được xử lý trước đó" });
    }

    // Cập nhật thông tin thanh toán
    payment.status = "PAID";
    payment.payment_date = new Date();
    await payment.save();

    console.log(`✅ Payment ${orderCode} cập nhật thành công`);

    // Cập nhật trạng thái subscription tương ứng (nếu cần)
    const subscription = await Subscription.findById(payment.subscription_id);
    if (subscription) {
      subscription.status = "active"; // hoặc trạng thái phù hợp với app của bạn
      subscription.updatedAt = new Date();
      await subscription.save();

      console.log(`✅ Subscription ${subscription._id} cập nhật thành công`);
    }

    return res.status(200).json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("❌ Webhook error:", error.message || error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi xử lý webhook",
      error: error.message || error,
    });
  }
};

exports.handlePaymentWebhook = handlePaymentWebhook;
