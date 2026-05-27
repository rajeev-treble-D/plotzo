const Lead = require('../models/Lead');
const { logActivity } = require('../utils/logger');

const leadController = {
    getLeads: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { leads, total } = await Lead.getPaginated(limit, offset);
            res.json({ success: true, leads, total, page, limit });
        } catch (error) {
            console.error('Error fetching leads:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    getLeadById: async (req, res) => {
        try {
            const lead = await Lead.findById(req.params.id);
            if (!lead) {
                return res.status(404).json({ success: false, message: 'Lead not found' });
            }
            res.json({ success: true, lead });
        } catch (error) {
            console.error('Error fetching lead:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    createLead: async (req, res) => {
        try {
            const leadId = await Lead.create(req.body);
            await logActivity(req, 'CREATED', 'Lead', leadId, { name: req.body.name });
            res.status(201).json({ success: true, message: 'Lead created successfully', leadId });
        } catch (error) {
            console.error('Error creating lead:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    updateLead: async (req, res) => {
        try {
            const updated = await Lead.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Lead not found' });
            }
            await logActivity(req, 'UPDATED', 'Lead', req.params.id, { name: req.body.name, status: req.body.status });
            res.json({ success: true, message: 'Lead updated successfully' });
        } catch (error) {
            console.error('Error updating lead:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    deleteLead: async (req, res) => {
        try {
            const deleted = await Lead.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Lead not found' });
            }
            await logActivity(req, 'DELETED', 'Lead', req.params.id);
            res.json({ success: true, message: 'Lead deleted successfully' });
        } catch (error) {
            console.error('Error deleting lead:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

module.exports = leadController;
