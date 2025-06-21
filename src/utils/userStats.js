const Progress = require('../models/progress.model');

const getUserProgressStats = async (user_id) => {
    const progresses = await Progress.find({ user_id }).sort({ date: 1 });

    let total_days_no_smoke = 0;
    let total_money_saved = 0;
    let days_since_start = 0;

    let lastDate = null;
    let today = new Date();

    let currentStreak = 0;
    let maxStreak = 0;

    progresses.forEach((p, idx) => {
        const currDate = new Date(p.date).setHours(0, 0, 0, 0);

        if (p.cigarettes_smoked === 0) {
            total_days_no_smoke++;

            if (lastDate !== null) {
                const prevDate = new Date(lastDate).setHours(0, 0, 0, 0);
                const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

                if (diff === 1) {
                    currentStreak += 1;
                } else {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }

            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }

        lastDate = currDate;

        if (idx === 0) {
            days_since_start = Math.floor((today - currDate) / (1000 * 60 * 60 * 24));
        }

        total_money_saved += p.money_saved;
    });

    return {
        total_days_no_smoke,
        total_money_saved,
        days_since_start,
        consecutive_no_smoke_days: maxStreak
    };
};

module.exports = getUserProgressStats;