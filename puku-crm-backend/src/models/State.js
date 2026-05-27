const pool = require('../config/db');

class State {

  // Get all states ordered by name
  static async findAll() {
      const [rows] = await pool.query('SELECT * FROM states ORDER BY state_name ASC');
      return rows;
  }

  // Get a state by ID
  static async findById(id) {
      const [rows] = await pool.query('SELECT * FROM states WHERE id = ?', [id]);
      return rows[0];
  }

  // Create a new state
  static async create(state) {
      const { state_name } = state;
      const [result] = await pool.query('INSERT INTO states (state_name) VALUES (?)', [state_name]);
      return result.insertId;
  }

  // Update an existing state
  static async update(id, state) {
      const { state_name } = state;
      await pool.query('UPDATE states SET state_name = ? WHERE id = ?', [state_name, id]);
  }

  // Delete a state
  static async delete(id) {
      await pool.query('DELETE FROM states WHERE id = ?', [id]);
  }
}

module.exports = State;