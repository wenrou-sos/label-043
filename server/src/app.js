require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.register(require('./routes/levels'), { prefix: '/api/levels' });
fastify.register(require('./routes/members'), { prefix: '/api/members' });
fastify.register(require('./routes/point-flows'), { prefix: '/api/point-flows' });
fastify.register(require('./routes/coupons'), { prefix: '/api/coupons' });
fastify.register(require('./routes/statistics'), { prefix: '/api/statistics' });

fastify.get('/api/health', async (request, reply) => {
  return { code: 0, message: 'ok', data: { status: 'running' } };
});

const start = async () => {
  try {
    const port = process.env.SERVER_PORT || 3001;
    const host = process.env.SERVER_HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
