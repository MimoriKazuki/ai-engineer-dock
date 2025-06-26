'use client';

import { useEffect, useRef, useState } from 'react';
import { WebSocketManager } from '@/lib/websocket';
import { ActivityFeedItem } from '@/types';

export function useWebSocket(projectId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const wsManager = new WebSocketManager(projectId);
    wsManagerRef.current = wsManager;

    const handleActivity = (activity: ActivityFeedItem) => {
      setActivityFeed(prev => [activity, ...prev.slice(0, 99)]); // Keep last 100 items
    };

    wsManager.addListener(handleActivity);

    wsManager.connect()
      .then(() => setIsConnected(true))
      .catch(console.error);

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setIsConnected(wsManager.isConnected());
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      wsManager.removeListener(handleActivity);
      wsManager.disconnect();
      wsManagerRef.current = null;
    };
  }, [projectId]);

  const sendMessage = (message: unknown) => {
    wsManagerRef.current?.sendMessage(message);
  };

  return {
    isConnected,
    activityFeed,
    sendMessage,
  };
}