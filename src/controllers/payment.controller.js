const PayOS = require("@payos/node");
const Subscription = require("../models/subscription.model");
const Payment = require("../models/payment.model");

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// ✅ Tạo link thanh toán và lưu vào DB
exports.createPaymentLink = async (req, res) => {
  try {
    const { subscription_id } = req.body;

    const subscription = await Subscription.findById(subscription_id).populate("package_id", "name price");
    if (!subscription) {
      return res.status(404).json({ error: "Không tìm thấy gói đăng ký" });
    }

    const amount = subscription.price;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Gói đăng ký không có giá hợp lệ" });
    }

    const order_code = Date.now();
    const shortDesc = `Gói #${subscription.package_id.name}`.slice(
      0,
      25
    );

    const paymentPayload = {
      orderCode: order_code,
      amount: Number(amount),
      description: shortDesc,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      // webhookUrl: process.env.PAYOS_WEBHOOK_URL,
    };

    const paymentResponse = await payos.createPaymentLink(paymentPayload);

    const newPayment = await Payment.create({
      subscription_id,
      amount,
      order_code: order_code,
      status: "PENDING",
      payment_date: new Date(),
    });

    return res.status(200).json({
      message: "Tạo link thanh toán thành công",
      order_code,
      checkoutUrl: paymentResponse.checkoutUrl,
      qrCodeUrl: paymentResponse.qrCode,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo link thanh toán:", err);
    return res
      .status(500)
      .json({ error: "Tạo link thanh toán thất bại", details: err.message });
  }
};

// ✅ Lấy tất cả payment
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("subscription_id");
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({
      error: "Không thể lấy danh sách thanh toán",
      details: err.message,
    });
  }
};

// ✅ Lấy theo orderCode
exports.getPaymentByOrderCode = async (req, res) => {
  try {
    const order_code = req.params.orderCode;
    const payment = await Payment.findOne({ order_code }).populate(
      "subscription_id"
    );

    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({
      error: "Lỗi khi lấy thông tin thanh toán",
      details: err.message,
    });
  }
};

// ✅ Cập nhật trạng thái thanh toán
exports.updatePaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment)
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });

    payment.status = status;
    payment.payment_date = new Date();
    await payment.save();

    res
      .status(200)
      .json({ message: "Cập nhật trạng thái thành công", payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// ✅ Đánh dấu thanh toán FAILED (khi user bấm hủy)
exports.markPaymentFailed = async (req, res) => {
  try {
    const { order_code } = req.body;
    if (!order_code)
      return res.status(400).json({ message: "Thiếu order_code" });

    const payment = await Payment.findOne({ order_code });
    if (!payment) {
      return res.status(404).json({ message: "Không tìm thấy thanh toán" });
    }

    if (payment.status === "PAID") {
      return res
        .status(400)
        .json({ message: "Đã thanh toán, không thể chuyển sang FAILED" });
    }

    payment.status = "FAILED";
    payment.payment_date = new Date();
    await payment.save();

    res
      .status(200)
      .json({ message: "Đã đánh dấu thanh toán thất bại", payment });
  } catch (err) {
    console.error("❌ Lỗi markPaymentFailed:", err);
    res
      .status(500)
      .json({ error: "Lỗi khi đánh dấu FAILED", details: err.message });
  }
};
