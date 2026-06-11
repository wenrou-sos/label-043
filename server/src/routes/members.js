const MemberModel = require('../models/member');
const PointFlowModel = require('../models/pointFlow');

const validateCreateMember = (body) => {
  const errors = [];
  if (!body.name || !body.name.trim()) {
    errors.push('姓名不能为空');
  } else if (body.name.length > 50) {
    errors.push('姓名最多50个字符');
  }
  if (!body.phone || !body.phone.trim()) {
    errors.push('手机号不能为空');
  } else if (!/^1[3-9]\d{9}$/.test(body.phone.trim())) {
    errors.push('手机号格式不正确');
  }
  if (body.email && body.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push('邮箱格式不正确');
  }
  return errors;
};

const validatePointsUpdate = (body) => {
  const errors = [];
  if (body.points === undefined || body.points === null || isNaN(body.points)) {
    errors.push('积分数量不能为空');
  } else if (!Number.isInteger(Number(body.points))) {
    errors.push('积分数量必须是整数');
  }
  if (!body.type || ![1, 2].includes(parseInt(body.type))) {
    errors.push('请选择正确的调整类型');
  }
  if (!body.reason || !body.reason.trim()) {
    errors.push('调整原因不能为空');
  } else if (body.reason.length > 255) {
    errors.push('调整原因最多255个字符');
  }
  return errors;
};

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
      const errors = validateCreateMember(request.body);
      if (errors.length > 0) {
        return { code: 400, message: errors.join('；') };
      }

      const existing = await MemberModel.getByPhone(request.body.phone.trim());
      if (existing) {
        return { code: 400, message: '该手机号已被注册' };
      }

      const id = await MemberModel.create(request.body);
      return { code: 0, message: 'success', data: { id } };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      const errors = validateCreateMember(request.body);
      if (errors.length > 0) {
        return { code: 400, message: errors.join('；') };
      }

      const existing = await MemberModel.getByPhone(request.body.phone.trim());
      if (existing && existing.id !== parseInt(request.params.id)) {
        return { code: 400, message: '该手机号已被其他会员使用' };
      }

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
      const errors = validatePointsUpdate(request.body);
      if (errors.length > 0) {
        return { code: 400, message: errors.join('；') };
      }

      const { points, type, reason, operator } = request.body;
      const result = await MemberModel.updatePoints(
        request.params.id,
        parseInt(points),
        parseInt(type),
        reason,
        operator || 'system'
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
