const Subscription = require("../models/subscription.model");

// [1] Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { name, price, start_date, end_date, is_active } = req.body;
    const { planId } = req.params;

    const subscription = new Subscription({
      user_id: req.user.id, // lấy từ middleware auth
      plan_id: planId, // lấy từ route param
      name,
      price,
      start_date,
      end_date,
      is_active,
    });

    const saved = await subscription.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// [2] Get all subscriptions (admin/coach)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find();

    res.status(200).json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [3] Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);

    if (!sub) return res.status(404).json({ error: "Subscription not found" });
    res.status(200).json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [4] Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Subscription not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// [5] Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Subscription not found" });
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
