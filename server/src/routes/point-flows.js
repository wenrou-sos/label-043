const PointFlowModel = require('../models/pointFlow');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      const { page = 1, pageSize = 10, memberId, type, startDate, endDate } = request.query;
      const result = await PointFlowModel.getAll(
        parseInt(page),
        parseInt(pageSize),
        memberId,
        type,
        startDate,
        endDate
      );
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });
};
