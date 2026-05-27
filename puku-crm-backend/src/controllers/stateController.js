const State = require('../models/State');

const getStates = async (req, res) => {
    try {
        const states = await State.findAll();
        res.json({ success: true, states });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await State.findById(id);
        if (!state) {
            return res.status(404).json({ success: false, message: 'State not found' });
        }
        res.json({ success: true, state });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const createState = async (req, res) => {
    try {
        const { state_name } = req.body;
        const stateId = await State.create({ state_name });
        res.status(201).json({ success: true, stateId });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { state_name } = req.body;
        await State.update(id, { state_name });
        res.json({ success: true, message: 'State updated successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        await State.delete(id);
        res.json({ success: true, message: 'State deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = {
    getStates,
    getStateById,
    createState,
    updateState,
    deleteState
};