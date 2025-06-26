'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Zap, Brain, Code, User, GripVertical, Pause, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  UniqueIdentifier,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  assignedTo?: string;
  progress?: number;
  status: 'todo' | 'in_progress' | 'done';
}

interface TaskBoardProps {
  tasks: Task[];
  onAddTask: () => void;
  onAssignTask: (taskId: string, engineerId: string) => void;
  onTaskStatusChange: (taskId: string, newStatus: Task['status']) => void;
  engineers: Array<{ id: string; status: string; }>;
}

const priorityConfig = {
  low: { icon: Code, color: 'from-gray-500 to-gray-600', badge: 'secondary' },
  medium: { icon: Brain, color: 'from-amber-500 to-orange-600', badge: 'warning' },
  high: { icon: Zap, color: 'from-red-500 to-pink-600', badge: 'destructive' },
} as const;

const statusColumns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-50' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', title: 'Done', color: 'bg-green-50' },
] as const;

const getCurrentStep = (progress: number): string => {
  if (progress < 16) return 'Analyzing requirements...';
  if (progress < 33) return 'Planning implementation...';
  if (progress < 50) return 'Setting up structure...';
  if (progress < 66) return 'Writing code...';
  if (progress < 83) return 'Running tests...';
  return 'Finalizing deployment...';
};

export function TaskBoard({ tasks, onAddTask, onAssignTask, onTaskStatusChange, engineers }: TaskBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id;

    // Find the task being dragged
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    // Determine the target column
    let targetColumnId: string;
    
    if (over.data.current?.type === 'column') {
      // Dropped directly on a column
      targetColumnId = overId as string;
    } else {
      // Dropped on a task, get the column from the task
      const targetTask = tasks.find(t => t.id === overId);
      if (targetTask) {
        targetColumnId = targetTask.status;
      } else {
        return;
      }
    }

    // Update task status if it's different
    if (activeTask.status !== targetColumnId) {
      onTaskStatusChange(activeTaskId, targetColumnId as Task['status']);
    }
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  // Auto-assign tasks based on priority
  const handleAutoMode = () => {
    setAutoMode(!autoMode);
    
    if (!autoMode) {
      // Start auto mode - assign high priority tasks first
      const availableEngineers = engineers.filter(e => e.status === 'idle');
      const pendingTasks = tasks
        .filter(t => t.status === 'todo' && !t.assignedTo)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

      // Assign tasks to available engineers
      availableEngineers.forEach((engineer, index) => {
        if (pendingTasks[index]) {
          onAssignTask(pendingTasks[index].id, engineer.id);
        }
      });
    }
  };

  const DroppableColumn = ({ 
    children, 
    id, 
    isOver 
  }: { 
    children: React.ReactNode; 
    id: string;
    isOver: boolean;
  }) => {
    const { setNodeRef } = useDroppable({
      id,
      data: {
        type: 'column',
      },
    });

    return (
      <div
        ref={setNodeRef}
        className={`min-h-[500px] p-3 rounded-lg transition-all duration-200 border-2 border-dashed ${
          isOver 
            ? 'border-blue-400 bg-blue-50/50' 
            : 'border-transparent hover:border-gray-200'
        }`}
      >
        {children}
      </div>
    );
  };

  const SortableTaskRow = ({ task }: { task: Task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: task.id,
      data: {
        type: 'task',
        task: task,
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const priorityInfo = priorityConfig[task.priority];
    const PriorityIcon = priorityInfo.icon;
    const assignedEngineer = engineers.find(e => e.id === task.assignedTo);

    return (
      <motion.tr
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
          isDragging ? 'opacity-50 bg-blue-50' : ''
        }`}
        onClick={() => {
          console.log('Task row clicked:', task.id);
        }}
      >
        {/* Drag Handle */}
        <td className="py-4 px-4">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="ドラッグして移動"
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </button>
        </td>

        {/* Task Title & Description */}
        <td className="py-4 px-4">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {task.title}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {task.description}
            </p>
            {/* Current Step for In Progress tasks */}
            {task.status === 'in_progress' && assignedEngineer?.status === 'building' && (
              <div className="mt-2 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="text-xs font-medium text-blue-700">
                  {getCurrentStep(task.progress || 0)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-red-100 hover:text-red-600 text-red-500 ml-2"
                  title="一時停止"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Pause task:', task.id);
                  }}
                >
                  <Pause className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </td>

        {/* Priority */}
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${priorityInfo.color} flex items-center justify-center`}>
              <PriorityIcon className="w-3 h-3 text-white" />
            </div>
            <Badge variant={priorityInfo.badge as 'secondary' | 'warning' | 'destructive'} className="text-xs">
              {task.priority}
            </Badge>
          </div>
        </td>

        {/* Estimated Time */}
        <td className="py-4 px-4">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedMinutes}m</span>
          </div>
        </td>

        {/* Assigned Engineer */}
        <td className="py-4 px-4">
          {assignedEngineer ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">
                #{assignedEngineer.id.slice(-4)}
              </span>
              {assignedEngineer.status === 'building' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">未割り当て</span>
          )}
        </td>

        {/* Progress */}
        <td className="py-4 px-4">
          {task.status === 'in_progress' && task.progress !== undefined ? (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{Math.round(task.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          ) : task.status === 'done' ? (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">完了</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </td>

        {/* Actions */}
        <td className="py-4 px-4">
          <div className="flex items-center justify-end gap-1">
            <div className="text-xs text-gray-400 font-mono">
              #{task.id.slice(-4)}
            </div>
          </div>
        </td>
      </motion.tr>
    );
  };


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and track development tasks</p>
          {autoMode && (
            <div className="flex items-center gap-2 mt-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="text-xs font-medium text-green-700">自動開発モード実行中</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAutoMode}
            variant={autoMode ? "default" : "outline"}
            className={`gap-2 h-10 px-4 rounded-lg transition-all duration-200 ${
              autoMode 
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                : "border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700"
            }`}
          >
            {autoMode ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Bot className="w-4 h-4" />
                </motion.div>
                自動開発停止
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                自動開発開始
              </>
            )}
          </Button>
          <Button
            onClick={onAddTask}
            className="gap-2 h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex-1 min-w-0">
                {/* Column Header */}
                <div className={`p-4 rounded-xl ${column.color} border border-gray-200/50 mb-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        {columnTasks.length}
                      </span>
                      {column.id === 'in_progress' && columnTasks.length > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks Table */}
                <DroppableColumn 
                  id={column.id}
                  isOver={overId === column.id}
                >
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {columnTasks.length > 0 ? (
                      <SortableContext
                        items={columnTasks.map(task => task.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-8"></th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">タスク</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">優先度</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">時間</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-28">担当者</th>
                              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">進捗</th>
                              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">アクション</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {columnTasks.map((task) => (
                              <SortableTaskRow key={task.id} task={task} />
                            ))}
                          </tbody>
                        </table>
                      </SortableContext>
                    ) : (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">
                            {column.id === 'todo' ? 'Add your first task' : `No ${column.title.toLowerCase()} tasks`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 scale-105 opacity-90 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${priorityConfig[activeTask.priority].color} flex items-center justify-center`}>
                  {React.createElement(priorityConfig[activeTask.priority].icon, { className: "w-3 h-3 text-white" })}
                </div>
                <span className="font-semibold text-gray-900 text-sm">{activeTask.title}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}