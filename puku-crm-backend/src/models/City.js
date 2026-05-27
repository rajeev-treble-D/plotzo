const pool = require('../config/db');

class City {

  // Get all cities ordered by name
  static async findAll() {
      const [rows] = await pool.query('SELECT c.*, s.state_name FROM cities c JOIN states s ON c.state_id = s.id ORDER BY city_name ASC');
      return rows;
  }

  // Get a city by ID
  static async findById(id) {
      const [rows] = await pool.query('SELECT c.*, s.state_name FROM cities c JOIN states s ON c.state_id = s.id WHERE c.id = ?', [id]);
      return rows[0];
  }

  // Get cities by state ID
  static async findCitiesByState(state_id) {
      const [rows] = await pool.query('SELECT * FROM cities WHERE state_id = ? ORDER BY city_name ASC', [state_id]);
      return rows;
  }

  // Create a new city
  static async create(city) {
      const { state_id, city_name } = city;
      const [result] = await pool.query('INSERT INTO cities (state_id, city_name) VALUES (?, ?)', [state_id, city_name]);
      return result.insertId;
  }

  // Update an existing city
  static async update(id, city) {
      const { state_id, city_name } = city;
      await pool.query('UPDATE cities SET state_id = ?,city_name = ? WHERE id = ?', [state_id, city_name, id]);
  }

  // Delete a city
  static async delete(id) {
      await pool.query('DELETE FROM cities WHERE id = ?', [id]);
  }
}

module.exports = City;