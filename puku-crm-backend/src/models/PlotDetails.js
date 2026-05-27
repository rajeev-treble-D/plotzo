const pool = require("../config/db");

class PlotDetails {
  // create a new plot detail
  static async create(propertyId, detail = {}, connection = pool) {
    const { area_sq_yard, dimensions, facing, price_per_sq_yard, total_price } =
      detail;

    await connection.query(
      `
        INSERT INTO plot_details (
          property_id,
          area_sq_yard, 
          dimensions, 
          facing, 
          price_per_sq_yard, 
          total_price
          ) 
          VALUES (?, ?, ?, ?, ?, ?)
          `,
      [
        propertyId,
        area_sq_yard,
        dimensions,
        facing,
        price_per_sq_yard,
        total_price,
      ],
    );
  }

  // get plot details by property ID
  static async findByPropertyId(propertyId) {
    const [rows] = await pool.query(
      `
        SELECT * FROM plot_details WHERE property_id = ?
      `,
      [propertyId],
    );
    return rows;
  }

  // update plot details by ID
  static async update(id, detail) {
    const { area_sq_yard, dimensions, facing, price_per_sq_yard, total_price } =
      detail;
    await pool.query(
      `
        UPDATE plot_details 
        SET area_sq_yard = ?, dimensions = ?, facing = ?, price_per_sq_yard = ?, total_price = ?
        WHERE id = ?
      `,
      [area_sq_yard, dimensions, facing, price_per_sq_yard, total_price, id],
    );
  }

  // delete plot details by ID
  static async delete(id) {
    await pool.query(
      `
        DELETE FROM plot_details WHERE id = ?
      `,
      [id],
    );
  }
}

module.exports = PlotDetails;
