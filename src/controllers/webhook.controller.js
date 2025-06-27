const Payment = require("../models/payment.model");
const Subscription = require("../models/subscription.model");
const User = require("../models/user.model");
const Package = require("../models/package.model");

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
    // Lấy thông tin Package để xác định duration_days
    const packageInfo = await Package.findById(subscription.package_id);
    if (!packageInfo) {
      console.error(`Không tìm thấy Package với ID: ${subscription.package_id} cho Subscription ${subscription._id}`);
      return res.status(500).json({ message: "Lỗi nội bộ: Không tìm thấy Package liên quan." });
    }
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + packageInfo.duration_days);
    // Cập nhật trạng thái subscription tương ứng (nếu cần)
    const subscription = await Subscription.findById(payment.subscription_id);
    if (subscription) {
      subscription.status = "active";
      subscription.start_date = now;
      subscription.end_date = endDate;
      await subscription.save();

      console.log(`✅ Subscription ${subscription._id} cập nhật thành công`);
    }

    const user = await User.findById(subscription.user_id);
    if (!user) {
      console.error(`Không tìm thấy User với ID: ${subscription.user_id} cho Subscription ${subscription._id}`);
      // Lỗi nghiêm trọng, có thể cần cơ chế cảnh báo hoặc xử lý thủ công
      return res.status(500).json({ message: "Lỗi nội bộ: Không tìm thấy User liên quan." });
    }

    // Cập nhật membership của User
    user.membership = {
      subscriptionType: subscription.name.toLowerCase(), // Lấy tên gói từ subscription
      expiresAt: subscription.end_date,
    };
    await user.save();
    console.log(`User ${user._id} membership cập nhật thành công.`);

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
