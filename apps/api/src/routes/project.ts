import { FastifyPluginAsync } from 'fastify';
import { Project, ProjectSpec } from '../types';
import { generateId } from '../utils/id';

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    const keys = await fastify.redis.keys('project:*');
    const projects = [];
    
    for (const key of keys) {
      const data = await fastify.redis.get(key);
      if (data) {
        projects.push(JSON.parse(data));
      }
    }
    
    return { projects };
  });

  fastify.post('/', async (request) => {
    const spec = ProjectSpec.parse(request.body);
    const projectId = generateId();
    const now = new Date().toISOString();
    
    const project: Project = {
      id: projectId,
      spec,
      status: 'created',
      created_at: now,
      updated_at: now,
    };

    await fastify.redis.set(
      `project:${projectId}`,
      JSON.stringify(project),
      'EX',
      7 * 24 * 60 * 60 // 7 days TTL
    );

    return { project };
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await fastify.redis.get(`project:${id}`);
    
    if (!data) {
      reply.code(404);
      return { error: 'Project not found' };
    }
    
    return { project: JSON.parse(data) };
  });

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<Project>;
    
    const existing = await fastify.redis.get(`project:${id}`);
    if (!existing) {
      reply.code(404);
      return { error: 'Project not found' };
    }
    
    const project = { 
      ...JSON.parse(existing), 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    await fastify.redis.set(`project:${id}`, JSON.stringify(project));
    
    return { project };
  });

  fastify.get('/:id/tasks', async (request) => {
    const { id } = request.params as { id: string };
    
    const tasks = await fastify.redis.lrange(`project:${id}:tasks`, 0, -1);
    const parsedTasks = tasks.map(task => JSON.parse(task));
    
    return { tasks: parsedTasks };
  });

  fastify.post('/:id/tasks', async (request) => {
    const { id } = request.params as { id: string };
    const { title, spec_json, priority = 0 } = request.body as {
      title: string;
      spec_json: string;
      priority?: number;
    };
    
    const taskId = generateId();
    const now = new Date().toISOString();
    
    const task = {
      id: taskId,
      title,
      spec_json,
      status: 'todo',
      priority,
      created_at: now,
      updated_at: now,
    };

    await fastify.redis.lpush(`project:${id}:tasks`, JSON.stringify(task));
    
    return { task };
  });
};