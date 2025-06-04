const Progress = require("../models/progress.model");
const Stage = require("../models/stage.model");
const QuitPlan = require("../models/quitPlan.model");

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
    const { stage_id, date, cigarettes_smoked, health_stat, money_saved } =
      req.body;

    const access = await canAccessStage(req.user, stage_id);

    // ❗️Chỉ cần check access.allowed là đủ
    if (!access.allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const progress = await Progress.create({
      user_id: req.user.id,
      stage_id,
      date,
      cigarettes_smoked,
      health_stat,
      money_saved,
    });

    res.status(201).json(progress);
  } catch (err) {
    res.status(400).json({ message: "Error creating progress", err });
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
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: "Not found" });

    if (progress.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your progress" });
    }

    const updated = await Progress.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

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
