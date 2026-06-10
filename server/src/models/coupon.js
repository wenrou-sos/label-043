const { query, pool } = require('../config/database');

const CouponModel = {
  getAll: async (page = 1, pageSize = 10, status = null, keyword = '') => {
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const offset = (page - 1) * pageSize;
    let whereSql = '';
    let params = [];
    let conditions = [];

    if (status !== null) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR code LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (conditions.length > 0) {
      whereSql = 'WHERE ' + conditions.join(' AND ');
    }

    const rows = await query(
      `SELECT * FROM coupons ${whereSql} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM coupons ${whereSql}`,
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
    const rows = await query('SELECT * FROM coupons WHERE id = ?', [id]);
    return rows[0];
  },

  getByCode: async (code) => {
    const rows = await query('SELECT * FROM coupons WHERE code = ?', [code]);
    return rows[0];
  },

  create: async (data) => {
    const code = data.code || 'C' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const result = await query(
      `INSERT INTO coupons (name, code, type, value, min_amount, total_quantity, 
        used_quantity, start_date, end_date, status, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        code,
        data.type,
        data.value,
        data.min_amount || 0,
        data.total_quantity || 100,
        0,
        data.start_date,
        data.end_date,
        data.status !== undefined ? data.status : 1,
        data.description || ''
      ]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    await query(
      `UPDATE coupons SET name = ?, type = ?, value = ?, min_amount = ?, 
       total_quantity = ?, start_date = ?, end_date = ?, status = ?, description = ? 
       WHERE id = ?`,
      [
        data.name,
        data.type,
        data.value,
        data.min_amount || 0,
        data.total_quantity || 100,
        data.start_date,
        data.end_date,
        data.status !== undefined ? data.status : 1,
        data.description || '',
        id
      ]
    );
    return true;
  },

  delete: async (id) => {
    await query('DELETE FROM coupons WHERE id = ?', [id]);
    return true;
  },

  issueToMember: async (couponId, memberId, operator = 'system') => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [couponRows] = await connection.execute(
        'SELECT * FROM coupons WHERE id = ? FOR UPDATE',
        [couponId]
      );

      if (couponRows.length === 0) {
        throw new Error('优惠券不存在');
      }

      const coupon = couponRows[0];
      if (coupon.status !== 1) {
        throw new Error('优惠券已停用');
      }
      if (coupon.used_quantity >= coupon.total_quantity) {
        throw new Error('优惠券已领完');
      }

      const [memberRows] = await connection.execute(
        'SELECT * FROM members WHERE id = ?',
        [memberId]
      );

      if (memberRows.length === 0) {
        throw new Error('会员不存在');
      }

      const code = 'U' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      await connection.execute(
        `INSERT INTO member_coupons (code, coupon_id, member_id, status, 
          issued_at, valid_from, valid_to, issued_by) 
         VALUES (?, ?, ?, 0, NOW(), ?, ?, ?)`,
        [code, couponId, memberId, coupon.start_date, coupon.end_date, operator]
      );

      await connection.execute(
        'UPDATE coupons SET used_quantity = used_quantity + 1 WHERE id = ?',
        [couponId]
      );

      await connection.commit();
      return { code };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  getMemberCoupons: async (memberId, status = null, page = 1, pageSize = 10) => {
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const offset = (page - 1) * pageSize;
    let whereSql = 'WHERE mc.member_id = ?';
    let params = [memberId];

    if (status !== null) {
      whereSql += ' AND mc.status = ?';
      params.push(status);
    }

    const rows = await query(
      `SELECT mc.*, c.name, c.type, c.value, c.min_amount, c.description 
       FROM member_coupons mc 
       LEFT JOIN coupons c ON mc.coupon_id = c.id 
       ${whereSql}
       ORDER BY mc.issued_at DESC 
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM member_coupons mc ${whereSql}`,
      params
    );

    return {
      list: rows,
      total: countResult[0].total,
      page,
      pageSize
    };
  },

  useCoupon: async (memberCouponId, memberId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [mcRows] = await connection.execute(
        'SELECT * FROM member_coupons WHERE id = ? AND member_id = ? FOR UPDATE',
        [memberCouponId, memberId]
      );

      if (mcRows.length === 0) {
        throw new Error('优惠券不存在');
      }

      const mc = mcRows[0];
      if (mc.status !== 0) {
        throw new Error('优惠券状态不正确');
      }

      const now = new Date();
      if (mc.valid_from && new Date(mc.valid_from) > now) {
        throw new Error('优惠券未到使用时间');
      }
      if (mc.valid_to && new Date(mc.valid_to) < now) {
        throw new Error('优惠券已过期');
      }

      await connection.execute(
        'UPDATE member_coupons SET status = 1, used_at = NOW() WHERE id = ?',
        [memberCouponId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = CouponModel;
