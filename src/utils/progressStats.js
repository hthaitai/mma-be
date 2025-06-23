const Stage = require("../models/stage.model");
const Progress = require("../models/progress.model");
const TaskResult = require("../models/TaskResult.model");
const Task = require("../models/task.model");
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

const getTaskProgressInStage = async (stage_id, user_id) => {
    const allTasks = await Task.find({ stage_id });
    const totalTasks = allTasks.length;

    // Gợi ý: tạo thêm bảng TaskResult nếu cần lưu trạng thái user hoàn thành task
    const completedTaskIds = await TaskResult.find({ user_id, stage_id }).distinct("task_id");
    const completedCount = completedTaskIds.length;

    return totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
};

module.exports = { getPlanProgress, getStageProgress, getTaskProgressInStage };