const Progress = require("../models/progress.model");
const Stage = require("../models/stage.model");
const QuitPlan = require("../models/quitPlan.model");
const checkAndAwardBadges = require("../utils/badgeCheck");
const SmokingStatus = require("../models/smokingStatus.model");
const { getPlanProgress, getTaskProgressInStage } = require("../utils/progressStats");

// Helper: Kiểm tra quyền truy cập vào stage (dựa trên plan → user_id)
const canAccessStage = async (user, stageId) => {
  const stage = await Stage.findById(stageId);
  if (!stage) return { allowed: false, reason: "Stage not found" };

  const plan = await QuitPlan.findById(stage.plan_id);
  if (!plan) return { allowed: false, reason: "Quit plan not found" };

  const isOwner = plan.user_id.toString() === user.id;
  const isCoach = user.role === "coach";
  const isAdmin = user.role === "admin";

  return {
    allowed: isOwner || isCoach || isAdmin,
    isOwner,
    isCoach,
    isAdmin,
    stage,
    plan,
  };
};

// ✅ Create progress (User only for their stage)
exports.createProgress = async (req, res) => {
  try {
    const {
      stage_id,
      date,
      cigarettes_smoked,
      health_status,
      user_id,
    } = req.body;

    const access = await canAccessStage(req.user, stage_id);
    if (!access.allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const isAdminOrCoach = ["admin", "coach"].includes(req.user.role);
    const finalUserId = isAdminOrCoach && user_id ? user_id : req.user.id;

    const inputDate = new Date(date);

    // Check đã có progress trong cùng ngày chưa
    const existing = await Progress.findOne({
      user_id: finalUserId,
      stage_id,
      date: {
        $gte: new Date(inputDate.setHours(0, 0, 0, 0)),
        $lte: new Date(inputDate.setHours(23, 59, 59, 999)),
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Đã có tiến trình được ghi nhận trong ngày này" });
    }

    const smokingStatus = await SmokingStatus.findOne({ user_id: finalUserId }).sort({ createdAt: -1 });
    if (!smokingStatus) {
      return res.status(400).json({ error: "Chưa có trạng thái hút thuốc ban đầu" });
    }

    const costPerCigarette = smokingStatus.cost_per_pack / 20;
    const expectedCost = smokingStatus.cigarettes_per_day * costPerCigarette;
    const actualCost = cigarettes_smoked * costPerCigarette;
    const money_saved = Math.max(expectedCost - actualCost, 0);

    const progress = await Progress.create({
      user_id: finalUserId,
      stage_id,
      date: inputDate,
      cigarettes_smoked,
      health_status,
      money_saved,
    });
    await checkAndAwardBadges(finalUserId);
    res.status(201).json(progress);
  } catch (err) {
    console.error("Error in createProgress:", err);
    res.status(400).json({ message: "Error creating progress", error: err.message });
  }
};

// ✅ Get progress for a stage — Owner, Coach, Admin
exports.getProgressByStage = async (req, res) => {
  try {
    const { stageId } = req.params;

    const access = await canAccessStage(req.user, stageId);
    if (!access.allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const progress = await Progress.find({ stage_id: stageId });
    res.status(200).json(progress);
  } catch (err) {
    res.status(400).json({ message: "Error fetching progress", err });
  }
};
exports.getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: "Not found" });

    const isOwner = progress.user_id.toString() === req.user.id;
    const isCoach = req.user.role === "coach";
    const isAdmin = req.user.role === "admin";

    if (!(isOwner || isCoach || isAdmin)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(progress);
  } catch (err) {
    res.status(400).json({ message: "Error", err });
  }
};
exports.updateProgress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { stage_id, date, cigarettes_smoked, health_status } = req.body;
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: "Not found" });

    if (progress.user_id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not your progress" });
    }
    const smokingStatus = await SmokingStatus.findOne({ user_id }).sort({ createdAt: -1 });
    if (!smokingStatus) {
      return res.status(400).json({ error: "Chưa có trạng thái hút thuốc ban đầu" });
    }

    const costPerCigarette = smokingStatus.cost_per_pack / 20;
    const expectedCost = smokingStatus.cigarettes_per_day * costPerCigarette;
    const actualCost = cigarettes_smoked * costPerCigarette;
    const money_saved = Math.max(expectedCost - actualCost, 0);

    const cleanDate = new Date(date);
    cleanDate.setHours(0, 0, 0, 0);
    const updated = await Progress.findOneAndUpdate(
      { user_id, stage_id, date: cleanDate },
      {
        $set: {
          cigarettes_smoked,
          money_saved,
          health_status
        }
      },
      { new: true, upsert: true }
    );
    //Gọi gán huy hiệu sau khi cập nhật
    await checkAndAwardBadges(user_id);

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed", err });
  }
};

exports.deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: "Not found" });

    const isOwner = progress.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!(isOwner || isAdmin)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Progress.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed", err });
  }
};

exports.getAllProgress = async (req, res) => {
  try {
    let progress;

    if (req.user.role === "admin") {
      // Admin: xem toàn bộ
      progress = await Progress.find();
    } else if (req.user.role === "coach") {
      // Coach: xem toàn bộ progress nhưng có thể lọc theo stage nếu cần
      // Giản lược: trả về toàn bộ (hoặc lọc kỹ hơn nếu bạn muốn, ví dụ theo coach's plans)
      progress = await Progress.find();
    } else {
      // User: chỉ xem progress của chính họ
      progress = await Progress.find({ user_id: req.user.id });
    }

    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error fetching progress records", err });
  }
};


// API: Tiến độ tổng thể của user (qua nhiều plan)
exports.getUserOverallProgress = async (req, res) => {
  try {
    const user_id = req.params.id;

    const plans = await QuitPlan.find({ user_id });
    const planProgressList = [];

    let totalPercent = 0;

    for (const plan of plans) {
      const percent = await getPlanProgress(plan._id);
      totalPercent += percent;

      planProgressList.push({
        plan_id: plan._id,
        plan_name: plan.name,
        progress_percent: percent
      });
    }

    const overall = plans.length > 0 ? Math.round(totalPercent / plans.length) : 0;

    res.json({
      overall_progress_percent: overall,
      plans: planProgressList
    });
  } catch (err) {
    console.error("Lỗi khi lấy tiến độ:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// API: Tiến độ của 1 kế hoạch cụ thể
exports.getSinglePlanProgress = async (req, res) => {
  try {
    const plan_id = req.params.id;
    const plan = await QuitPlan.findById(plan_id);

    if (!plan) return res.status(404).json({ error: "Plan not found" });

    if (req.user.role !== 'admin' && plan.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Không có quyền truy cập kế hoạch này" });
    }

    const { totalStages, completedStages, progress_percent } = await getPlanProgress(plan_id);

    res.json({
      plan_id,
      plan_name: plan.name,
      total_stages: totalStages,
      completed_stages: completedStages,
      progress_percent: progress_percent
    });

  } catch (err) {
    console.error("Lỗi khi lấy tiến độ kế hoạch:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

//API: Tiến độ 1 stage cụ thể
exports.getSingleStageProgress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const stage_id = req.params.id;

    const percent = await getTaskProgressInStage(stage_id, user_id);

    res.json({
      stage_id,
      progress_percent: percent
    });
  } catch (err) {
    console.error("Lỗi khi lấy tiến độ stage:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};