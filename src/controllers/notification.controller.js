const Notification = require("../models/notificaltion.model");
const Progress = require("../models/progress.model"); // Import model tiến trình

exports.createNotification = async (req, res) => {
  try {
    const { progress_id, message, type, schedule } = req.body;

    // ✅ Kiểm tra role
    if (req.user.role !== "admin" && req.user.role !== "coach") {
      return res
        .status(403)
        .json({ error: "Only admin or coach can send notifications" });
    }

    // ✅ Kiểm tra dữ liệu đầu vào
    if (!progress_id || !message || !type || !schedule) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Lấy tiến trình
    const progress = await Progress.findById(progress_id);
    if (!progress) {
      return res.status(404).json({ error: "Progress not found" });
    }

    // ✅ Tạo Notification, tự động lấy user_id từ progress
    const newNotification = new Notification({
      user_id: progress.user_id,
      progress_id: progress._id,
      message,
      type,
      schedule,
    });

    const saved = await newNotification.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [2] Lấy tất cả Notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [3] Lấy Notification theo ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [4] Cập nhật Notification
exports.updateNotification = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// [5] Xoá Notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
