const QuitPlan = require("../models/quitPlan.model");

/**
 * GET: All quit plans (Admin only)
 */
exports.getAllQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find().populate("user_id", "name email");
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching quit plans", error });
  }
};

/**
 * GET: Quit plan by ID (Owner, Admin)
 */
exports.getQuitPlanById = async (req, res) => {
  try {
    const plan = await QuitPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Quit plan not found" });
    }

    if (req.user.role !== "admin" && plan.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving quit plan", error });
  }
};

/**
 * POST: Create new quit plan (User or Coach)
 */
exports.createQuitPlan = async (req, res) => {
  try {
    const { user_id, reason, name, start_date, target_quit_date, image } =
      req.body;

    if (req.user.role === "user" && user_id !== req.user.id) {
      return res.status(403).json({
        message: "Bạn chỉ có thể tạo kế hoạch cai thuốc cho chính mình",
      });
    }

    const newPlan = new QuitPlan({
      user_id: req.user.id,
      reason,
      name,
      start_date,
      target_quit_date,
      image,
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(400).json({ message: "Error creating quit plan", error });
  }
};

/**
 * PUT: Update quit plan by ID (Owner or Admin)
 */
exports.updateQuitPlan = async (req, res) => {
  try {
    const plan = await QuitPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Quit plan not found" });
    }

    if (req.user.role !== "admin" && plan.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { reason, name, start_date, target_quit_date, image } = req.body;

    plan.reason = reason ?? plan.reason;
    plan.name = name ?? plan.name;
    plan.start_date = start_date ?? plan.start_date;
    plan.target_quit_date = target_quit_date ?? plan.target_quit_date;
    plan.image = image ?? plan.image;

    const updated = await plan.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Error updating quit plan", error });
  }
};

/**
 * DELETE: Delete quit plan by ID (Admin only)
 */
exports.deleteQuitPlan = async (req, res) => {
  try {
    const plan = await QuitPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Quit plan not found" });
    }

    await QuitPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Quit plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting quit plan", error });
  }
};
