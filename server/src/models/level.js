const { query } = require('../config/database');

const LevelModel = {
  getAll: async () => {
    return await query('SELECT * FROM levels ORDER BY min_points ASC');
  },

  getById: async (id) => {
    const rows = await query('SELECT * FROM levels WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const result = await query(
      'INSERT INTO levels (name, min_points, max_points, discount, description) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.min_points, data.max_points, data.discount, data.description]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    await query(
      'UPDATE levels SET name = ?, min_points = ?, max_points = ?, discount = ?, description = ? WHERE id = ?',
      [data.name, data.min_points, data.max_points, data.discount, data.description, id]
    );
    return true;
  },

  delete: async (id) => {
    await query('DELETE FROM levels WHERE id = ?', [id]);
    return true;
  },

  getLevelByPoints: async (points) => {
    const rows = await query(
      'SELECT * FROM levels WHERE min_points <= ? AND (max_points >= ? OR max_points IS NULL) ORDER BY min_points DESC LIMIT 1',
      [points, points]
    );
    return rows[0];
  }
};

module.exports = LevelModel;
