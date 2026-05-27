const pool = require("../config/db");
const PlotDetails = require("./PlotDetails");
const ApartmentDetails = require("./ApartmentDetails");
const RentalDetails = require("./RentalDetails");
const JointVentureDetails = require("./JointVentureDetails");

const PROPERTY_TYPES = ["plot", "apartment", "joint_venture", "rental"];

class Property {
  // Get all properties
  static async findAll(filters = {}) {
    const { property_type } = filters;
    const values = [];
    let whereClause = "";

    if (property_type) {
      if (!PROPERTY_TYPES.includes(property_type)) {
        throw new Error("Invalid property type");
      }

      whereClause = "WHERE p.property_type = ?";
      values.push(property_type);
    }

    const [rows] = await pool.query(
      `
        SELECT
              p.*,
              s.state_name,
              c.city_name
          FROM properties p
          LEFT JOIN states s
          ON p.state_id = s.id
          LEFT JOIN cities c
          ON p.city_id = c.id
          ${whereClause}
          ORDER BY p.id DESC
        `,
      values,
    );
    return rows;
  }

  // Get properties by type
  static async findByType(propertyType) {
    return this.findAll({ property_type: propertyType });
  }

  // Get a property by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `
        SELECT
              p.*,
              s.state_name,
              c.city_name
          FROM properties p
          LEFT JOIN states s
          ON p.state_id = s.id
          LEFT JOIN cities c
          ON p.city_id = c.id
          WHERE p.id = ?
        `,
      [id],
    );
    const property = rows[0];
    if (!property) return null;

    switch (property.property_type) {
      case "plot":
        property.details = await PlotDetails.findByPropertyId(id);
        break;
      case "apartment":
        property.details = await ApartmentDetails.findByPropertyId(id);
        break;
      case "rental":
        property.details = await RentalDetails.findByPropertyId(id);
        break;
      case "joint_venture":
        property.details = await JointVentureDetails.findByPropertyId(id);
        break;
      default:
        property.details = {};
    }

    if (Array.isArray(property.details)) {
      property.details = property.details[0] || {};
    }

    return property;
  }

  // create a new property
  static async create(property) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        property_name,
        property_type,
        state_id,
        city_id,
        project_name,
        status,
      } = property;
      const [result] = await connection.query(
        `
        INSERT INTO properties (
          property_name, 
          property_type, 
          state_id, 
          city_id, 
          project_name, 
          status
        ) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [property_name, property_type, state_id, city_id, project_name, status],
      );
      const propertyId = result.insertId;

      switch (property_type) {
        case 'plot':
          await PlotDetails.create(propertyId, property.details || {}, connection);
          break;
        case 'apartment':
          await ApartmentDetails.create(propertyId, property.details || {}, connection);
          break;
        case 'rental':
          await RentalDetails.create(propertyId, property.details || {}, connection);
          break;
        case 'joint_venture':
          await JointVentureDetails.create(propertyId, property.details || {}, connection);
          break;
      }

      await connection.commit();
      return propertyId;
    } catch (error) {
      await connection.rollback();
      console.error("Error creating property:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // update an existing property
  static async update(id, property) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        property_name,
        property_type,
        state_id,
        city_id,
        project_name,
        status,
      } = property;
      const [result] = await connection.query(
        `
          UPDATE properties
          SET property_name = ?, property_type = ?, state_id = ?, city_id = ?, project_name = ?, status = ?
          WHERE id = ?
        `,
        [
          property_name,
          property_type,
          state_id,
          city_id,
          project_name,
          status,
          id,
        ],
      );

      await connection.query("DELETE FROM plot_details WHERE property_id = ?", [id]);
      await connection.query("DELETE FROM apartment_details WHERE property_id = ?", [id]);
      await connection.query("DELETE FROM rental_details WHERE property_id = ?", [id]);
      await connection.query("DELETE FROM joint_venture_details WHERE property_id = ?", [id]);

      switch (property_type) {
        case "plot":
          await PlotDetails.create(id, property.details || {}, connection);
          break;
        case "apartment":
          await ApartmentDetails.create(id, property.details || {}, connection);
          break;
        case "rental":
          await RentalDetails.create(id, property.details || {}, connection);
          break;
        case "joint_venture":
          await JointVentureDetails.create(id, property.details || {}, connection);
          break;
      }

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      console.error("Error updating property:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // delete a property
  static async delete(id) {
    const [result] = await pool.query("DELETE FROM properties WHERE id = ?", [
      id,
    ]);
    return result.affectedRows;
  }
}

module.exports = Property;
