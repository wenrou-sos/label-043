const { query } = require('../config/database');

const PointFlowModel = {
  getAll: async (page = 1, pageSize = 10, memberId = null, type = null, startDate = null, endDate = null) => {
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const offset = (page - 1) * pageSize;
    let whereSql = '';
    let params = [];
    let conditions = [];

    if (memberId) {
      conditions.push('pf.member_id = ?');
      params.push(memberId);
    }
    if (type) {
      conditions.push('pf.type = ?');
      params.push(type);
    }
    if (startDate) {
      conditions.push('DATE(pf.flow_time) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('DATE(pf.flow_time) <= ?');
      params.push(endDate);
    }

    if (conditions.length > 0) {
      whereSql = 'WHERE ' + conditions.join(' AND ');
    }

    const rows = await query(
      `SELECT pf.*, m.name as member_name, m.member_no, m.phone as member_phone 
       FROM point_flows pf 
       LEFT JOIN members m ON pf.member_id = m.id 
       ${whereSql}
       ORDER BY pf.flow_time DESC 
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM point_flows pf ${whereSql}`,
      params
    );

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  },

  getByMemberId: async (memberId, page = 1, pageSize = 20) => {
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const offset = (page - 1) * pageSize;
    const rows = await query(
      `SELECT * FROM point_flows WHERE member_id = ? ORDER BY flow_time DESC LIMIT ${pageSize} OFFSET ${offset}`,
      [memberId]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM point_flows WHERE member_id = ?',
      [memberId]
    );

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  }
};

module.exports = PointFlowModel;
