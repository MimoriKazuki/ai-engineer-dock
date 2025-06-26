import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import websocket from '@fastify/websocket';
import { config } from './config';
import { redisPlugin } from './plugins/redis';
import { healthRoutes } from './routes/health';
import { engineerRoutes } from './routes/engineer';
import { projectRoutes } from './routes/project';
import { wsRoutes } from './routes/ws';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

async function start() {
  try {
    await server.register(cors, {
      origin: config.CORS_ORIGIN,
      credentials: true,
    });

    await server.register(sensible);
    await server.register(websocket);
    await server.register(redisPlugin);

    await server.register(healthRoutes, { prefix: '/api/health' });
    await server.register(engineerRoutes, { prefix: '/api/engineers' });
    await server.register(projectRoutes, { prefix: '/api/projects' });
    await server.register(wsRoutes, { prefix: '/ws' });

    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${config.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();