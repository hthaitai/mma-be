const checkSubscriptionAccess = (allowedTypes) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.membership) {
            return res.status(401).json({ message: 'Unauthorized: No user found.' });
        }

        const { subscriptionType, expiresAt } = req.user.membership;

        // Kiểm tra loại gói và thời hạn
        if (
            Array.isArray(allowedTypes) &&
            allowedTypes.includes(subscriptionType) &&
            expiresAt &&
            new Date(expiresAt) >= new Date()
        ) {
            next(); // Người dùng có quyền truy cập
        } else {
            return res.status(403).json({ message: 'Bạn cần nâng cấp gói hoặc gói của bạn đã hết hạn.' });
        }
    }
}

module.exports = { checkSubscriptionAccess };