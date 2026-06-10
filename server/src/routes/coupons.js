const CouponModel = require('../models/coupon');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      const { page = 1, pageSize = 10, status, keyword = '' } = request.query;
      const statusParam = status !== undefined ? parseInt(status) : null;
      const result = await CouponModel.getAll(parseInt(page), parseInt(pageSize), statusParam, keyword);
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const coupon = await CouponModel.getById(request.params.id);
      return { code: 0, message: 'success', data: coupon };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      const id = await CouponModel.create(request.body);
      return { code: 0, message: 'success', data: { id } };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      await CouponModel.update(request.params.id, request.body);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await CouponModel.delete(request.params.id);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.post('/:id/issue', async (request, reply) => {
    try {
      const { memberId, operator } = request.body;
      const result = await CouponModel.issueToMember(request.params.id, memberId, operator);
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/member/:memberId', async (request, reply) => {
    try {
      const { page = 1, pageSize = 10, status } = request.query;
      const statusParam = status !== undefined ? parseInt(status) : null;
      const result = await CouponModel.getMemberCoupons(
        request.params.memberId,
        statusParam,
        parseInt(page),
        parseInt(pageSize)
      );
      return { code: 0, message: 'success', data: result };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.post('/use/:memberCouponId', async (request, reply) => {
    try {
      const { memberId } = request.body;
      await CouponModel.useCoupon(request.params.memberCouponId, memberId);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });
};
