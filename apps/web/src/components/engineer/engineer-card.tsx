'use client';

import { motion } from 'framer-motion';
import { Bot, Clock, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskProgress } from './task-progress';

interface EngineerCardProps {
  id: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  currentTaskTitle?: string;
  etaMinutes?: number;
  lastMessage?: string;
  taskProgress?: number;
  showTaskProgress?: boolean;
  onViewDetails: () => void;
  onStartTask?: () => void;
}

const statusConfig = {
  idle: { 
    color: 'secondary' as const, 
    label: 'Ready', 
    bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    iconColor: 'text-gray-500',
    dotColor: 'bg-gray-400'
  },
  planning: { 
    color: 'warning' as const, 
    label: 'Planning', 
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
    iconColor: 'text-amber-600',
    dotColor: 'bg-amber-400'
  },
  building: { 
    color: 'default' as const, 
    label: 'Building', 
    bgColor: 'bg-gradient-to-br from-primary-50 to-primary-100',
    iconColor: 'text-primary-600',
    dotColor: 'bg-primary-500'
  },
  error: { 
    color: 'destructive' as const, 
    label: 'Error', 
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    iconColor: 'text-red-600',
    dotColor: 'bg-red-500'
  },
} as const;

const getCurrentStep = (progress: number): string => {
  if (progress < 16) return 'Analyzing requirements...';
  if (progress < 33) return 'Planning implementation...';
  if (progress < 50) return 'Setting up structure...';
  if (progress < 66) return 'Writing code...';
  if (progress < 83) return 'Running tests...';
  return 'Finalizing deployment...';
};

export function EngineerCard({
  id,
  status,
  currentTaskTitle,
  etaMinutes,
  lastMessage,
  taskProgress = 0,
  showTaskProgress = false,
  onViewDetails,
  onStartTask,
}: EngineerCardProps) {
  const config = statusConfig[status];
  const progress = etaMinutes ? Math.max(0, 100 - (etaMinutes / 30) * 100) : 0;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      className="w-full"
    >
      <Card className={`${config.bgColor} border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 backdrop-blur-sm`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/40">
                  <Bot className={`w-7 h-7 ${config.iconColor}`} />
                </div>
                {status === 'building' && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 ${config.dotColor} rounded-full animate-pulse shadow-sm`} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Engineer #{id.slice(-4)}</h3>
                <Badge variant={config.color} className="text-xs font-semibold mt-1">
                  {config.label}
                </Badge>
              </div>
            </div>
            {etaMinutes && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg backdrop-blur-sm border border-white/40">
                <Clock className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">{etaMinutes}m</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {currentTaskTitle && (
            <div className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50">
              <p className="text-sm font-semibold text-gray-700 mb-2">Current Task</p>
              <p className="text-sm text-gray-600 line-clamp-2 font-medium">{currentTaskTitle}</p>
              {status === 'building' && taskProgress !== undefined && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                    <span className="text-xs font-medium text-blue-700">
                      {getCurrentStep(taskProgress)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {etaMinutes && (
            <div className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50">
              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {lastMessage && (
            <div className="flex items-start gap-3 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50">
              <MessageCircle className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <p className="text-sm text-gray-600 line-clamp-2 font-medium">{lastMessage}</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewDetails} 
              className="flex-1 h-10 rounded-lg bg-white/50 border-white/60 hover:bg-white/70 font-semibold"
            >
              View Details
            </Button>
            {status === 'idle' && onStartTask && (
              <Button 
                size="sm" 
                onClick={onStartTask} 
                className="flex-1 h-10 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 font-semibold shadow-lg shadow-primary-500/25"
              >
                Start Task
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Task Progress Modal/Expansion */}
      {showTaskProgress && currentTaskTitle && status === 'building' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <TaskProgress
            taskTitle={currentTaskTitle}
            isActive={status === 'building'}
            progress={taskProgress}
          />
        </motion.div>
      )}
    </motion.div>
  );
}