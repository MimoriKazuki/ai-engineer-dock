import { FastifyPluginAsync } from 'fastify';
import { ActivityFeedItem, FileSystemEvent } from '../types';

export const wsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/activity/:projectId', { websocket: true }, async (connection, request) => {
    const { projectId } = request.params as { projectId: string };
    
    fastify.log.info(`WebSocket connected for project: ${projectId}`);
    
    // Note: Using any type temporarily to fix compilation
    // This should be properly typed based on @fastify/websocket documentation
    const socket = connection as any;
    
    socket.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe') {
          const streamKey = `activity:${projectId}`;
          
          const subscriber = fastify.redis.duplicate();
          
          subscriber.subscribe(streamKey, (err) => {
            if (err) {
              fastify.log.error({ err }, 'Failed to subscribe to Redis stream');
              return;
            }
            fastify.log.info(`Subscribed to ${streamKey}`);
          });
          
          subscriber.on('message', (channel, message) => {
            if (channel === streamKey) {
              socket.send(message);
            }
          });
          
          socket.on('close', () => {
            subscriber.unsubscribe();
            subscriber.quit();
            fastify.log.info(`WebSocket disconnected for project: ${projectId}`);
          });
          
          const recentActivity = await fastify.redis.lrange(
            `activity:${projectId}:history`, 
            0, 
            19
          );
          
          for (const item of recentActivity.reverse()) {
            socket.send(item);
          }
        }
      } catch (err) {
        fastify.log.error({ err }, 'WebSocket message error');
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });
  });

  fastify.post('/activity/:projectId', async (request) => {
    const { projectId } = request.params as { projectId: string };
    const activity = request.body as ActivityFeedItem;
    
    const streamKey = `activity:${projectId}`;
    const historyKey = `activity:${projectId}:history`;
    
    const message = JSON.stringify(activity);
    
    await Promise.all([
      fastify.redis.publish(streamKey, message),
      fastify.redis.lpush(historyKey, message),
      fastify.redis.ltrim(historyKey, 0, 99), // Keep last 100 items
      fastify.redis.expire(historyKey, 24 * 60 * 60), // 24 hours TTL
    ]);
    
    return { success: true };
  });

  fastify.post('/fs-event/:projectId', async (request) => {
    const { projectId } = request.params as { projectId: string };
    const fsEvent = FileSystemEvent.parse(request.body);
    
    const activity: ActivityFeedItem = {
      id: `fs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'fs_event',
      content: `File ${fsEvent.type}: ${fsEvent.path}`,
      metadata: { fsEvent },
      timestamp: fsEvent.timestamp,
    };
    
    const streamKey = `activity:${projectId}`;
    const historyKey = `activity:${projectId}:history`;
    
    const message = JSON.stringify(activity);
    
    await Promise.all([
      fastify.redis.publish(streamKey, message),
      fastify.redis.lpush(historyKey, message),
      fastify.redis.ltrim(historyKey, 0, 99),
      fastify.redis.expire(historyKey, 24 * 60 * 60),
    ]);
    
    return { success: true };
  });
};