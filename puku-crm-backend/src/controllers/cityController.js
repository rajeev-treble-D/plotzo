const City = require('../models/City');

const getCities = async (req, res) => {
    try {
        const cities = await City.findAll();
        res.json({ success: true, cities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const getCityById = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await City.findById(id);
        if (!city) {
            return res.status(404).json({ success: false, message: 'City not found' });
        }
        res.json({ success: true, city });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCitiesByState = async (req, res) => {
    try {
        const { state_id } = req.params;
        const cities = await City.findCitiesByState(state_id);
        console.log(cities)
        res.json({ success: true, cities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createCity = async (req, res) => {
    try {
        const { state_id, city_name } = req.body;
        const cityId = await City.create({ state_id, city_name });
        res.status(201).json({ success: true, cityId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { state_id, city_name } = req.body;
        await City.update(id, { state_id, city_name });
        res.json({ success: true, message: 'City updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        await City.delete(id);
        res.json({ success: true, message: 'City deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    } 
};

module.exports = {
    getCities,
    getCityById,
    getCitiesByState,
    createCity,
    updateCity,
    deleteCity
};


