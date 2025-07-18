const Stage = require("../models/stage.model");
const Progress = require("../models/progress.model");
// Tính % tiến độ của một kế hoạch
const getPlanProgress = async (plan_id) => {
    const stages = await Stage.find({ plan_id });
    const completedStages = stages.filter(stage => stage.is_completed).length;
    const totalStages = stages.length;
    const progress_percent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return {
        totalStages,
        completedStages,
        progress_percent
    };
};

// Tính % tiến độ 1 giai đoạn dựa vào số ngày người dùng đã nhập progress
const getStageProgress = async (stage_id, user_id) => {
    const progressCount = await Progress.countDocuments({ stage_id, user_id });
    const stage = await Stage.findById(stage_id);
    const totalDays = Math.ceil((stage.end_date - stage.start_date) / (1000 * 60 * 60 * 24)) + 1;

    return totalDays > 0 ? Math.round((progressCount / totalDays) * 100) : 0;
};


module.exports = { getPlanProgress, getStageProgress };