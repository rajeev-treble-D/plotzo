const pool = require("../config/db");

class RentalDetails {
  // CREATE
  static async create(propertyId, details = {}, connection = pool) {
    const {
      area_sqft,
      monthly_rent,
      security_deposit,
      lease_period,
      tenant_name,
    } = details;

    await connection.query(
      `
            INSERT INTO rental_details (

                property_id,
                area_sqft,
                monthly_rent,
                security_deposit,
                lease_period,
                tenant_name

            )
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [
        propertyId,
        area_sqft,
        monthly_rent,
        security_deposit,
        lease_period,
        tenant_name,
      ],
    );
  }

  // GET BY PROPERTY ID
  static async findByPropertyId(propertyId) {
    const [rows] = await pool.query(
      `
            SELECT *
            FROM rental_details
            WHERE property_id = ?
        `,
      [propertyId],
    );

    return rows[0];
  }

  // UPDATE
  static async update(id, details) {
    const {
      area_sqft,
      monthly_rent,
      security_deposit,
      lease_period,
      tenant_name,
    } = details;
    await pool.query(
      `
            UPDATE rental_details
            SET area_sqft = ?, monthly_rent = ?, security_deposit = ?, lease_period = ?, tenant_name = ?
            WHERE id = ?
        `,
      [
        area_sqft,
        monthly_rent,
        security_deposit,
        lease_period,
        tenant_name,
        id,
      ],
    );
  }

  // DELETE
  static async delete(id) {
    await pool.query(
      `
            DELETE FROM rental_details
            WHERE id = ?
        `,
      [id],
    );
  }
}

module.exports = RentalDetails;
