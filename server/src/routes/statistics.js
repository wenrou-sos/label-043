const { query } = require('../config/database');

module.exports = async function (fastify, opts) {
  fastify.get('/level-distribution', async (request, reply) => {
    try {
      const rows = await query(`
        SELECT 
          l.id as level_id,
          l.name as level_name,
          COUNT(m.id) as value
        FROM levels l
        LEFT JOIN members m ON l.id = m.level_id
        GROUP BY l.id, l.name
        ORDER BY l.min_points
      `);
      return { code: 0, message: 'success', data: rows };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/monthly-new-members', async (request, reply) => {
    try {
      const rows = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as value
        FROM members
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `);

      const monthMap = {};
      rows.forEach(r => { monthMap[r.month] = r.value; });

      const result = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        result.push({
          month,
          value: monthMap[month] || 0
        });
      }
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/point-flow-type', async (request, reply) => {
    try {
      const rows = await query(`
        SELECT 
          type,
          COUNT(*) as value
        FROM point_flows
        WHERE flow_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY type
      `);
      const result = rows.map(r => ({
        name: r.type === 1 ? '获取积分' : '消耗积分',
        value: r.value
      }));
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/overview', async (request, reply) => {
    try {
      const [memberStats, pointsStats, couponStats] = await Promise.all([
        query('SELECT COUNT(*) as total_members, SUM(points) as total_points FROM members'),
        query('SELECT COUNT(*) as total_flows FROM point_flows'),
        query('SELECT COUNT(*) as total_coupons, SUM(used_quantity) as issued_coupons FROM coupons')
      ]);
      return {
        code: 0,
        message: 'success',
        data: {
          totalMembers: memberStats[0].total_members || 0,
          totalPoints: memberStats[0].total_points || 0,
          totalFlows: pointsStats[0].total_flows || 0,
          totalCoupons: couponStats[0].total_coupons || 0,
          issuedCoupons: couponStats[0].issued_coupons || 0
        }
      };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });
};
