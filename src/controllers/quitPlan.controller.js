const QuitPlan = require("../models/quitPlan.model");
const RequestQuitPlan = require("../models/requestQuitPlan.model");
const Stage = require("../models/stage.model");
const Task = require("../models/task.model"); 

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

exports.sendQuitPlanRequest = async (req, res) => {
  try {
    const { name, reason, start_date, target_quit_date } = req.body;

    const request = new RequestQuitPlan({
      user_id: req.user.id,
      name,
      reason,
      start_date,
      target_quit_date,
      status: "pending", // Mặc định là pending
    });

    const saved = await request.save();
    res.status(201).json({ message: "Yêu cầu đã được gửi", request: saved });
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi gửi yêu cầu", error });
  }
};

/**
 * POST: Create new quit plan (User or Coach)
 */
// controllers/quitPlan.controller.js
exports.createQuitPlan = async (req, res) => {
  try {
    const { user_id, reason, name, start_date, target_quit_date, image } =
      req.body;

    if (!["admin", "coach"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Chỉ admin hoặc coach được tạo kế hoạch trực tiếp",
      });
    }

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
    });

    const savedPlan = await newPlan.save();
    return res.status(201).json(savedPlan);
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
// controllers/quitPlan.controller.js
exports.approveQuitPlan = async (req, res) => {
  try {
    const plan = await RequestQuitPlan.findById(req.params.id);
    if (!plan)
      return res.status(404).json({ message: "Không tìm thấy kế hoạch" });

    if (req.user.role !== "admin" && req.user.role !== "coach") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền duyệt kế hoạch" });
    }

    plan.status = "approved";
    await plan.save();

    res.status(200).json({ message: "Kế hoạch đã được duyệt", plan });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi duyệt kế hoạch", error });
  }
};

exports.rejectQuitPlan = async (req, res) => {
  try {
    const plan = await RequestQuitPlan.findById(req.params.id);
    if (!plan)
      return res.status(404).json({ message: "Không tìm thấy kế hoạch" });

    if (req.user.role !== "admin" && req.user.role !== "coach") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền từ chối kế hoạch" });
    }

    plan.status = "rejected";
    await plan.save();

    res.status(200).json({ message: "Kế hoạch đã bị từ chối", plan });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi từ chối kế hoạch", error });
  }
};

//get Quit Plan by userID
exports.getQuitPlanByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const plans = await QuitPlan.find({ user_id: userId });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving quit plans", error });
  }
};

// get quit plan public 
exports.getPublicPlans = async (req, res) => {
  try {
    const publicPlans = await QuitPlan.find({ is_public: true }).select("-user_id");

    res.json(publicPlans);
  } catch (err) {
    console.error("Lỗi khi lấy kế hoạch công khai:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//User clone quit plan public to their plan
exports.usePublicPlan = async (req, res) => {
  try {
    const plan_id = req.params.id;
    const user_id = req.user.id;

    const publicPlan = await QuitPlan.findOne({ _id: plan_id, is_public: true });
    if (!publicPlan) return res.status(404).json({ message: "Kế hoạch công khai không tồn tại" });

    // 1. Tạo kế hoạch mới cho user
    const userPlan = await QuitPlan.create({
      user_id,
      reason: publicPlan.reason,
      name: publicPlan.name,
      start_date: new Date(), // Hoặc cho phép người dùng chọn
      target_quit_date: publicPlan.target_quit_date,
      image: publicPlan.image,
      is_public: false,
      status: "approved",
    });

    // 2. Clone tất cả các stage
    const stages = await Stage.find({ plan_id: publicPlan._id });

    for (const stage of stages) {
      const newStage = await Stage.create({
        plan_id: userPlan._id,
        title: stage.title,
        description: stage.description,
        stage_number: stage.stage_number,
        start_date: stage.start_date,
        end_date: stage.end_date,
        is_completed: false,
      });

      // 3. Clone tất cả các task thuộc stage đó
      const tasks = await Task.find({ stage_id: stage._id });

      for (const task of tasks) {
        await Task.create({
          stage_id: newStage._id,
          title: task.title,
          description: task.description,
          sort_order: task.sort_order,
        });
      }
    }

    res.status(201).json({
      message: "Đã tạo kế hoạch từ mẫu công khai",
      plan: userPlan,
    });

  } catch (err) {
    console.error("Lỗi khi dùng kế hoạch mẫu:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};