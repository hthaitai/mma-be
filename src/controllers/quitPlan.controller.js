const QuitPlan = require("../models/quitPlan.model");

/**
 * GET: All quit plans (Admin only)
 */
exports.getAllQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find();
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

    // if (req.user.role !== "admin" && plan.user_id.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Access denied" });
    // }

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

    // 🧑‍💻 Nếu là user thường → chỉ được tạo cho chính họ và trạng thái là pending
    if (req.user.role === "user") {
      if (user_id !== req.user.id) {
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
        status: "pending", // user tạo -> chờ duyệt
      });

      const savedPlan = await newPlan.save();
      return res.status(201).json(savedPlan);
    }

    // 👑 Nếu là admin hoặc coach → được tạo cho bất kỳ user nào và duyệt ngay
    if (req.user.role === "admin" || req.user.role === "coach") {
      if (!user_id) {
        return res.status(400).json({ message: "Thiếu user_id" });
      }

      const newPlan = new QuitPlan({
        user_id,
        reason,
        name,
        start_date,
        target_quit_date,
        image,
        status: "approved", // admin tạo -> được duyệt ngay
      });

      const savedPlan = await newPlan.save();
      return res.status(201).json(savedPlan);
    }

    return res
      .status(403)
      .json({ message: "Vai trò không hợp lệ để tạo kế hoạch" });
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

    const { reason, name, start_date, target_quit_date, image, status } =
      req.body;

    plan.reason = reason ?? plan.reason;
    plan.name = name ?? plan.name;
    plan.start_date = start_date ?? plan.start_date;
    plan.target_quit_date = target_quit_date ?? plan.target_quit_date;
    plan.image = image ?? plan.image;
    plan.status = status ?? plan.status;

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
