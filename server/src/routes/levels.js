const LevelModel = require('../models/level');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      const levels = await LevelModel.getAll();
      return { code: 0, message: 'success', data: levels };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const level = await LevelModel.getById(request.params.id);
      return { code: 0, message: 'success', data: level };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      const id = await LevelModel.create(request.body);
      return { code: 0, message: 'success', data: { id } };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      await LevelModel.update(request.params.id, request.body);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await LevelModel.delete(request.params.id);
      return { code: 0, message: 'success' };
    } catch (error) {
      return { code: 500, message: error.message };
    }
  });
};
