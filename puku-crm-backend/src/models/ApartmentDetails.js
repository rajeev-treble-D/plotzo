const pool = require("../config/db");

class ApartmentDetails {
  // CREATE
  static async create(propertyId, details = {}, connection = pool) {
    const { bhk_type, area_sqft, floor, tower_block, amenities, total_price } =
      details;

    await connection.query(
      `
            INSERT INTO apartment_details (
                property_id,
                bhk_type,
                area_sqft,
                floor,
                tower_block,
                amenities,
                total_price
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
      [
        propertyId,
        bhk_type,
        area_sqft,
        floor,
        tower_block,
        amenities,
        total_price,
      ],
    );
  }

  // GET BY PROPERTY ID
  static async findByPropertyId(propertyId) {
    const [rows] = await pool.query(
      `
            SELECT *
            FROM apartment_details
            WHERE property_id = ?
        `,
      [propertyId],
    );

    return rows[0];
  }

  // UPDATE
  static async update(id, details) {
    const { bhk_type, area_sqft, floor, tower_block, amenities, total_price } =
      details;
    await pool.query(
      `
            UPDATE apartment_details
            SET bhk_type = ?, area_sqft = ?, floor = ?, tower_block = ?, amenities = ?, total_price = ?
            WHERE id = ?
        `,
      [
        bhk_type,
        area_sqft,
        floor,
        tower_block,
        amenities,
        total_price,
        id,
      ],
    );
  }

  // DELETE
  static async delete(id) {
    await pool.query(
      `
            DELETE FROM apartment_details
            WHERE id = ?
        `,
      [id],
    );
  }
}

module.exports = ApartmentDetails;
