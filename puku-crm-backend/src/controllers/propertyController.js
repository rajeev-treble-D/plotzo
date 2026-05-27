const Property = require("../models/property");

const getProperties = async (req, res) => {
  try {
    const { property_type } = req.query;
    const properties = await Property.findAll({ property_type });
    res.json({ success: true, properties });
  } catch (err) {
    const statusCode = err.message === "Invalid property type" ? 400 : 500;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

const getPropertiesByType = async (req, res) => {
  try {
    const { propertyType } = req.params;
    const properties = await Property.findByType(propertyType);
    res.json({ success: true, properties });
  } catch (err) {
    const statusCode = err.message === "Invalid property type" ? 400 : 500;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      property_name,
      property_type,
      state_id,
      city_id,
      project_name,
      status,
      details,
    } = req.body;
    const propertyId = await Property.create({
      property_name,
      property_type,
      state_id,
      city_id,
      project_name,
      status,
      details,
    });
    res.status(201).json({ success: true, propertyId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      property_name,
      property_type,
      state_id,
      city_id,
      project_name,
      status,
      details,
    } = req.body;
    await Property.update(id, {
      property_name,
      property_type,
      state_id,
      city_id,
      project_name,
      status,
      details,
    });
    res.json({ success: true, message: "Property updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    await Property.delete(id);
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProperties,
  getPropertiesByType,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
