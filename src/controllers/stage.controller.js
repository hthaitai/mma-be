const Stage = require("../models/stage.model");
const QuitPlan = require("../models/quitPlan.model");

// 🔐 Helper: Check quyền truy cập Stage theo QuitPlan
const canAccessPlan = async (user, planId) => {
  const plan = await QuitPlan.findById(planId);
  if (!plan) return { allowed: false, reason: "Quit plan not found" };

  const isOwner = plan.user_id.toString() === user.id;
  const isCoach = user.role === "coach";
  const isAdmin = user.role === "admin";

  return {
    allowed: isAdmin || isCoach || isOwner,
    plan,
    isOwner,
    isCoach,
    isAdmin,
  };
};

// ✅ Create Stage — Coach, Admin
exports.createStage = async (req, res) => {
  try {
    const { plan_id, title, description, stage_number, start_date, end_date } =
      req.body;

    const access = await canAccessPlan(req.user, plan_id);

    if (!access.allowed || (!access.isCoach && !access.isAdmin)) {
      return res
        .status(403)
        .json({ message: "Only coach or admin can create stages" });
    }

    const newStage = await Stage.create({
      plan_id,
      title,
      description,
      stage_number,
      start_date,
      end_date,
      is_completed: false,
    });

    res.status(201).json(newStage);
  } catch (error) {
    res.status(400).json({ message: "Error creating stage", error });
  }
};

// ✅ Get all stages for a plan — Owner, Coach, Admin
exports.getStagesByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const access = await canAccessPlan(req.user, planId);

    if (!access.allowed) {
      return res
        .status(403)
        .json({ message: access.reason || "Access denied" });
    }

    const stages = await Stage.find({ plan_id: planId }).sort("stage_number");
    res.status(200).json(stages);
  } catch (error) {
    res.status(400).json({ message: "Error fetching stages", error });
  }
};

// ✅ Get one stage by ID — Owner, Coach, Admin
exports.getStageById = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    const access = await canAccessPlan(req.user, stage.plan_id);
    if (!access.allowed) {
      return res
        .status(403)
        .json({ message: access.reason || "Access denied" });
    }

    res.status(200).json(stage);
  } catch (error) {
    res.status(400).json({ message: "Error fetching stage", error });
  }
};

// ✅ Update stage — Coach, Admin
exports.updateStage = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    const access = await canAccessPlan(req.user, stage.plan_id);
    if (!access.allowed || (!access.isCoach && !access.isAdmin)) {
      return res
        .status(403)
        .json({ message: "Only coach or admin can update this stage" });
    }

    const updated = await Stage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Error updating stage", error });
  }
};

// ✅ Delete stage — Admin only
exports.deleteStage = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete stages" });
    }

    await Stage.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Stage deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting stage", error });
  }
};

exports.getAllStages = async (req, res) => {
  try {
    const stages = await Stage.find();
    res.status(200).json(stages);
  } catch (error) {
    console.error("Error getting all stages:", error);
    res.status(500).json({ message: "Failed to get stages", error });
  }
};
