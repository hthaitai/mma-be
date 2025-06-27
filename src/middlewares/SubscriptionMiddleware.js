const checkPremiumAccess = async (req, res, next) => {
    if (!req.user || !req.user.membership) { // req.user giả sử bạn đã có middleware xác thực người dùng
        return res.status(401).json({ message: 'Unauthorized: No user found.' });
    }

    const { subscriptionType, expiresAt } = req.user.membership;

    // Kiểm tra loại gói và thời hạn
    if ((subscriptionType === 'plus' || subscriptionType === 'premium') && expiresAt && expiresAt >= new Date()) {
        next(); // Người dùng có quyền truy cập
    } else {
        return res.status(403).json({ message: 'Bạn cần nâng cấp gói hoặc gói của bạn đã hết hạn.' });
    }
}

module.exports = { checkPremiumAccess };