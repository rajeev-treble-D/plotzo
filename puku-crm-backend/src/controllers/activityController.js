const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { logs, total } = await ActivityLog.getPaginated(limit, offset, req.query);
        res.json({ success: true, logs, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
