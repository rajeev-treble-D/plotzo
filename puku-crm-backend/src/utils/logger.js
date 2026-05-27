const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user activity
 * @param {Object} req - Express request object (to get user_id)
 * @param {string} action - Action performed (e.g. 'CREATED', 'UPDATED', 'DELETED')
 * @param {string} entityType - Type of entity (e.g. 'Customer', 'Project', 'Task')
 * @param {number} entityId - ID of the entity
 * @param {Object|string} details - Additional information about the action
 */
const logActivity = async (req, action, entityType, entityId, details = null) => {
    try {
        const user_id = req.user ? req.user.id : null;
        if (!user_id) return;

        await ActivityLog.create({
            user_id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details
        });
    } catch (err) {
        console.error('Failed to log activity:', err.message);
    }
};

module.exports = { logActivity };
