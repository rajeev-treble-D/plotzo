const express = require('express');
const router = express.Router();
const { getCities, getCityById, getCitiesByState, createCity, updateCity, deleteCity } = require('../controllers/cityController');
const { auth } = require('../middleware/auth');

// All city routes require authentication
router.use(auth);

router.get('/', getCities);
router.get('/:id', getCityById);
router.get('/state/:state_id', getCitiesByState);
router.post('/', createCity);
router.put('/:id', updateCity);
router.delete('/:id', deleteCity);

module.exports = router;