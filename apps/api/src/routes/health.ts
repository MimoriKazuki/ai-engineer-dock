import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    const redisStatus = await fastify.redis.ping();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    };
  });
};