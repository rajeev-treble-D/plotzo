const FollowUp = require('../models/followup');

const FollowUpController = {
    getAllFollowUps: async (req, res) => {
        try {
            const followUps = await FollowUp.findAll();
            res.json({ success: true, followUps });
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    getFollowUpById: async (req, res) => {
        try {
            const followUp = await FollowUp.findById(req.params.id);
            if (!followUp) {
                return res.status(404).json({ success: false, message: 'Follow-up not found' });
            }
            res.json({ success: true, followUp });
        } catch (error) {
            console.error('Error fetching follow-up:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    getFollowUpsByLeadId: async (req, res) => {
        try {
            const followUps = await FollowUp.findByLeadId(req.params.lead_id);
            res.json({ success: true, followUps });
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    createFollowUp: async (req, res) => {
        try {
            const followUpId = await FollowUp.create({
                ...req.body,
                created_by: req.user.id
            });
            res.status(201).json({ success: true, message: 'Follow-up created successfully', followUpId });
        } catch (error) {
            console.error('Error creating follow-up:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    updateFollowUp: async (req, res) => {
        try {
            const updated = await FollowUp.update(req.params.id, {
                ...req.body,
                created_by: req.user.id
            });
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Follow-up not found' });
            }
            res.json({ success: true, message: 'Follow-up updated successfully' });
        } catch (error) {
            console.error('Error updating follow-up:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    deleteFollowUp: async (req, res) => {
        try {
            const deleted = await FollowUp.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Follow-up not found' });
            }
            res.json({ success: true, message: 'Follow-up deleted successfully' });
        } catch (error) {
            console.error('Error deleting follow-up:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = FollowUpController;
