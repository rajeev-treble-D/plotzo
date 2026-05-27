const pool = require("../config/db");

class JointVentureDetails {
  // CREATE
  static async create(propertyId, details = {}, connection = pool) {
    const {
      partner_name,
      profit_sharing_ratio,
      land_area,
      project_status,
      total_project_value,
    } = details;

    await connection.query(
      `
            INSERT INTO joint_venture_details (

                property_id,
                partner_name,
                profit_sharing_ratio,
                land_area,
                project_status,
                total_project_value

            )
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [
        propertyId,
        partner_name,
        profit_sharing_ratio,
        land_area,
        project_status,
        total_project_value,
      ],
    );
  }

  // GET BY PROPERTY ID
  static async findByPropertyId(propertyId) {
    const [rows] = await pool.query(
      `
            SELECT *
            FROM joint_venture_details
            WHERE property_id = ?
        `,
      [propertyId],
    );

    return rows[0];
  }

  // UPDATE
  static async update(id, details) {
    const { partner_name, profit_sharing_ratio, land_area, project_status, total_project_value } = details;
    await pool.query(
      `
            UPDATE joint_venture_details
            SET partner_name = ?, profit_sharing_ratio = ?, land_area = ?, project_status = ?, total_project_value = ?
            WHERE id = ?
        `,
      [
        partner_name,
        profit_sharing_ratio,
        land_area,
        project_status,
        total_project_value,
        id
      ],
    );
  }

  // DELETE
  static async delete(id) {
    await pool.query(
      `
            DELETE FROM joint_venture_details
            WHERE id = ?
        `,
      [id],
    );
  }
}

module.exports = JointVentureDetails;
