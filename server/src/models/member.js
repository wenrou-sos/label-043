const { query, pool } = require('../config/database');
const LevelModel = require('./level');
const { v4: uuidv4 } = require('uuid');

const MemberModel = {
  getAll: async (page = 1, pageSize = 10, keyword = '') => {
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const offset = (page - 1) * pageSize;
    let whereSql = '';
    let params = [];
    
    if (keyword) {
      whereSql = 'WHERE m.name LIKE ? OR m.phone LIKE ?';
      params = [`%${keyword}%`, `%${keyword}%`];
    }

    const rows = await query(
      `SELECT m.*, l.name as level_name, l.discount as level_discount 
       FROM members m 
       LEFT JOIN levels l ON m.level_id = l.id 
       ${whereSql}
       ORDER BY m.created_at DESC 
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM members m ${whereSql}`,
      params
    );

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  },

  getById: async (id) => {
    const rows = await query(
      `SELECT m.*, l.name as level_name, l.discount as level_discount 
       FROM members m 
       LEFT JOIN levels l ON m.level_id = l.id 
       WHERE m.id = ?`,
      [id]
    );
    return rows[0];
  },

  getByPhone: async (phone) => {
    const rows = await query('SELECT * FROM members WHERE phone = ?', [phone]);
    return rows[0];
  },

  create: async (data) => {
    const memberNo = 'M' + Date.now().toString().slice(-8);
    const defaultLevel = await LevelModel.getLevelByPoints(0);
    const levelId = defaultLevel ? defaultLevel.id : null;

    const result = await query(
      'INSERT INTO members (member_no, name, phone, email, points, level_id, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [memberNo, data.name, data.phone, data.email || '', 0, levelId, data.status || 1, data.remark || '']
    );
    return result.insertId;
  },

  update: async (id, data) => {
    await query(
      'UPDATE members SET name = ?, phone = ?, email = ?, status = ?, remark = ? WHERE id = ?',
      [data.name, data.phone, data.email || '', data.status || 1, data.remark || '', id]
    );
    return true;
  },

  delete: async (id) => {
    await query('DELETE FROM members WHERE id = ?', [id]);
    return true;
  },

  updatePoints: async (memberId, points, type, reason, operator = 'system') => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [memberRows] = await connection.execute(
        'SELECT * FROM members WHERE id = ? FOR UPDATE',
        [memberId]
      );
      
      if (memberRows.length === 0) {
        throw new Error('会员不存在');
      }

      const member = memberRows[0];
      let newPoints = parseInt(member.points) + parseInt(points);
      
      if (newPoints < 0) {
        throw new Error('积分不足');
      }

      await connection.execute(
        'UPDATE members SET points = ? WHERE id = ?',
        [newPoints, memberId]
      );

      const flowNo = 'F' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      await connection.execute(
        'INSERT INTO point_flows (flow_no, member_id, points, type, balance, reason, operator, flow_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [flowNo, memberId, points, type, newPoints, reason, operator]
      );

      const newLevel = await LevelModel.getLevelByPoints(newPoints);
      if (newLevel && newLevel.id !== member.level_id) {
        await connection.execute(
          'UPDATE members SET level_id = ?, updated_at = NOW() WHERE id = ?',
          [newLevel.id, memberId]
        );

        const levelFlowNo = 'L' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        await connection.execute(
          'INSERT INTO level_upgrade_logs (flow_no, member_id, old_level_id, new_level_id, upgrade_time) VALUES (?, ?, ?, ?, NOW())',
          [levelFlowNo, memberId, member.level_id, newLevel.id]
        );
      } else {
        await connection.execute(
          'UPDATE members SET updated_at = NOW() WHERE id = ?',
          [memberId]
        );
      }

      await connection.commit();
      return { newPoints, newLevel };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = MemberModel;
