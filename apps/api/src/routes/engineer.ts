import { FastifyPluginAsync } from 'fastify';
import { Engineer } from '../types';
import { generateId } from '../utils/id';

export const engineerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    const keys = await fastify.redis.keys('engineer:*');
    const engineers = [];
    
    for (const key of keys) {
      const data = await fastify.redis.get(key);
      if (data) {
        engineers.push(JSON.parse(data));
      }
    }
    
    return { engineers };
  });

  fastify.post('/', async () => {
    const engineerId = generateId();
    const now = new Date().toISOString();
    
    const engineer: Engineer = {
      id: engineerId,
      status: 'idle',
      created_at: now,
      updated_at: now,
    };

    await fastify.redis.set(
      `engineer:${engineerId}`,
      JSON.stringify(engineer),
      'EX',
      24 * 60 * 60 // 24 hours TTL
    );

    return { engineer };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await fastify.redis.get(`engineer:${id}`);
    
    if (!data) {
      reply.code(404);
      return { error: 'Engineer not found' };
    }
    
    return { engineer: JSON.parse(data) };
  });

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<Engineer>;
    
    const existing = await fastify.redis.get(`engineer:${id}`);
    if (!existing) {
      reply.code(404);
      return { error: 'Engineer not found' };
    }
    
    const engineer = { 
      ...JSON.parse(existing), 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    await fastify.redis.set(`engineer:${id}`, JSON.stringify(engineer));
    
    return { engineer };
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await fastify.redis.del(`engineer:${id}`);
    
    if (deleted === 0) {
      reply.code(404);
      return { error: 'Engineer not found' };
    }
    
    return { success: true };
  });
};