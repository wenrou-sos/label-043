const MemberModel = require('../models/member');
const PointFlowModel = require('../models/pointFlow');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      const { page = 1, pageSize = 10, keyword = '' } = request.query;
      const result = await MemberModel.getAll(parseInt(page), parseInt(pageSize), keyword);
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const member = await MemberModel.getById(request.params.id);
      return { code: 0, message: 'success', data: member };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      const id = await MemberModel.create(request.body);
      return { code: 0, message: 'success', data: { id } };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      await MemberModel.update(request.params.id, request.body);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await MemberModel.delete(request.params.id);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.post('/:id/points', async (request, reply) => {
    try {
      const { points, type, reason, operator } = request.body;
      const result = await MemberModel.updatePoints(
        request.params.id,
        points,
        type,
        reason,
        operator
      );
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/:id/point-flows', async (request, reply) => {
    try {
      const { page = 1, pageSize = 20 } = request.query;
      const result = await PointFlowModel.getByMemberId(
        request.params.id,
        parseInt(page),
        parseInt(pageSize)
      );
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });
};
