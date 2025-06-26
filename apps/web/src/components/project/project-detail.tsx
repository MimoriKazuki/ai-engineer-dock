'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, User, Plus, Bot, Sparkles, Clock, CheckCircle, AlertCircle, Activity, Zap, Brain, Code, Play, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskModal } from './task-modal';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  assignedTo?: string;
  completedBy?: string; // 完了したエンジニアのID
  progress?: number;
  status: 'todo' | 'in_progress' | 'done';
}

interface Engineer {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  current_project_id?: string;
  assigned_project_id?: string;
  eta_minutes?: number;
  last_message?: string;
  taskProgress?: number;
}

interface Project {
  id: string;
  title: string;
  status: 'created' | 'building' | 'ready' | 'error';
  preview_url?: string;
  github_pr_url?: string;
  created_at: string;
}

interface ProjectDetailProps {
  project: Project;
  engineers: Engineer[];
  onBack: () => void;
}

const priorityConfig = {
  low: { icon: Code, color: 'from-gray-500 to-gray-600', badge: 'secondary', label: '低', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  medium: { icon: Brain, color: 'from-amber-500 to-orange-600', badge: 'warning', label: '中', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  high: { icon: Zap, color: 'from-red-500 to-pink-600', badge: 'destructive', label: '高', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
} as const;

export function ProjectDetail({ project, engineers, onBack }: ProjectDetailProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Set up authentication system',
      description: 'Implement user login/register with JWT tokens',
      priority: 'high',
      estimatedMinutes: 120,
      status: 'todo', // 全てのタスクは初期状態でtodo
      progress: 0,
    },
    {
      id: '2',
      title: 'Create user dashboard',
      description: 'Build responsive dashboard with navigation',
      priority: 'medium',
      estimatedMinutes: 90,
      status: 'todo',
      progress: 0,
    },
    {
      id: '3',
      title: 'Add payment integration',
      description: 'Integrate Stripe for subscription billing',
      priority: 'high',
      estimatedMinutes: 180,
      status: 'todo',
      progress: 0,
    },
  ]);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const handleAddTask = (newTask: Omit<Task, 'id' | 'status'>) => {
    const task: Task = {
      ...newTask,
      id: `task_${Date.now()}`,
      status: 'todo',
    };
    setTasks(prev => [...prev, task]);
  };

  const handleAssignTask = (taskId: string, engineerId: string) => {
    // エンジニアが既に他のタスクを実行中か確認
    const engineer = engineers.find(e => e.id === engineerId);
    const engineerHasActiveTask = tasks.some(t => 
      t.assignedTo === engineerId && t.status === 'in_progress'
    );
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        // 既に完了しているタスクは再割り当てできない
        if (task.status === 'done') {
          return task;
        }
        
        // エンジニアが既に他のタスクを実行中の場合は待機状態に
        if (engineerHasActiveTask) {
          return { ...task, assignedTo: engineerId, status: 'todo', progress: 0 };
        }
        
        // エンジニアがアイドルの場合のみ実行状態に
        return { ...task, assignedTo: engineerId, status: engineer?.status === 'idle' ? 'in_progress' : 'todo', progress: 0 };
      }
      return task;
    }));
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        // 未割り当てのタスクは完了にできない
        if (!task.assignedTo && newStatus === 'done') {
          return task;
        }
        // 完了時にエンジニア情報を保存
        if (newStatus === 'done' && task.assignedTo) {
          return { ...task, status: newStatus, completedBy: task.assignedTo };
        }
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const handleAutoMode = () => {
    setAutoMode(!autoMode);
    
    if (!autoMode) {
      // 自動開発モード開始時、アイドルエンジニアにタスクを割り当て
      const projectEngineers = engineers.filter(e => e.assigned_project_id === project.id);
      const idleEngineers = projectEngineers.filter(e => e.status === 'idle');
      
      idleEngineers.forEach((engineer) => {
        // エンジニアに既に割り当てられている待機中タスクを確認
        const assignedPendingTask = tasks.find(t => 
          t.status === 'todo' && t.assignedTo === engineer.id
        );
        
        if (assignedPendingTask) {
          // 待機中タスクを実行状態に
          setTasks(prev => prev.map(t => 
            t.id === assignedPendingTask.id && t.assignedTo === engineer.id
              ? { ...t, status: 'in_progress' as const, progress: 0 } 
              : t
          ));
        } else {
          // 新規タスクを割り当て
          const nextTask = tasks
            .filter(t => t.status === 'todo' && !t.assignedTo)
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            })[0];
          
          if (nextTask) {
            handleAssignTask(nextTask.id, engineer.id);
          }
        }
      });
    }
  };

  // プロジェクトに所属しているエンジニアを取得
  const projectEngineers = engineers.filter(e => e.assigned_project_id === project.id);
  const activeEngineers = projectEngineers.filter(e => e.status === 'building' || e.status === 'planning');
  const idleEngineers = projectEngineers.filter(e => e.status === 'idle');
  
  // タスクに実際にアサインされているエンジニアを反映
  const getActualEngineerTask = (engineer: Engineer) => {
    const assignedTask = tasks.find(t => t.assignedTo === engineer.id && t.status === 'in_progress');
    return assignedTask;
  };

  const getEngineerById = (engineerId: string) => {
    return engineers.find(e => e.id === engineerId);
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="h-10 w-10 rounded-xl border-gray-200/60 hover:bg-white/80"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    project.status === 'ready' ? 'bg-green-100 text-green-700' :
                    project.status === 'building' ? 'bg-blue-50 text-blue-600' :
                    project.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status === 'ready' ? '完成' :
                     project.status === 'building' ? '構築中' :
                     project.status === 'error' ? 'エラー' : '作成済み'}
                  </span>
                  <span className="text-sm text-gray-500">
                    作成日 {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {project.github_pr_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(project.github_pr_url, '_blank')}
                  className="gap-2 h-10 px-4 rounded-xl border-gray-200/60 hover:bg-white/80"
                >
                  <Github className="w-4 h-4" />
                  PR表示
                </Button>
              )}
              {project.preview_url && (
                <Button
                  onClick={() => window.open(project.preview_url, '_blank')}
                  className="gap-2 h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                  プレビュー表示
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Engineers & Stats */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">プロジェクト統計</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                  <div className="text-sm text-gray-600">総タスク</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                  <div className="text-sm text-gray-600">実行</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{taskStats.todo}</div>
                  <div className="text-sm text-gray-600">待機</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                  <div className="text-sm text-gray-600">完了</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">進捗率</span>
                  <span className="font-bold text-blue-600">
                    {tasks.length > 0 ? Math.round((taskStats.done / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tasks.length > 0 ? (taskStats.done / tasks.length) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Assigned Engineers */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">アサイン済みエンジニア</h3>
                <span className="text-sm text-gray-600">{projectEngineers.length}名</span>
              </div>

              {projectEngineers.length > 0 ? (
                <div className="space-y-3">
                  {projectEngineers.map((engineer) => (
                    <div
                      key={engineer.id}
                      className={`p-3 rounded-lg border ${
                        engineer.status === 'idle' 
                          ? 'bg-gray-50 border-gray-200' 
                          : engineer.status === 'building' 
                          ? 'bg-blue-50 border-blue-200'
                          : engineer.status === 'planning'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                          {engineer.avatar || '👤'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{engineer.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              engineer.status === 'idle' ? 'bg-gray-400' :
                              engineer.status === 'building' ? 'bg-blue-500 animate-pulse' :
                              engineer.status === 'planning' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <span className="text-xs text-gray-600">
                              {engineer.status === 'idle' ? '待機' :
                               engineer.status === 'building' ? '稼働' :
                               engineer.status === 'planning' ? '計画' : 'エラー'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const currentTask = getActualEngineerTask(engineer);
                        if (currentTask && engineer.status !== 'idle') {
                          return (
                            <div className="mt-2 pl-13">
                              <p className="text-xs text-gray-700 font-medium">
                                {currentTask.title}
                              </p>
                              {currentTask.progress !== undefined && (
                                <div className="mt-1">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <motion.div 
                                        className="h-full bg-blue-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${currentTask.progress}%` }}
                                        transition={{ duration: 0.5 }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      {currentTask.progress}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    エンジニアが割り当てられていません
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              {/* Task Board Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">タスクボード</h2>
                    <p className="text-sm text-gray-600 mt-1">プロジェクトの全タスク一覧</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleAutoMode}
                      variant={autoMode ? "default" : "outline"}
                      className={`gap-2 h-10 px-4 rounded-lg ${
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
                      onClick={() => setIsTaskModalOpen(true)}
                      className="gap-2 h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      タスク追加
                    </Button>
                  </div>
                </div>
                {autoMode && (
                  <div className="flex items-center gap-2 mt-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span className="text-xs font-medium text-green-700">
                      自動開発モード実行中 - 優先度の高いタスクから自動的に処理されます
                    </span>
                  </div>
                )}
              </div>

              {/* Task List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">タスク</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">優先度</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">ステータス</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">担当者</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">進捗</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task, index) => {
                      const priorityInfo = priorityConfig[task.priority];
                      const Icon = priorityInfo.icon;
                      const assignedEngineer = task.assignedTo ? getEngineerById(task.assignedTo) : null;
                      
                      return (
                        <motion.tr
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:bg-gray-50 transition-colors duration-200 ${
                            task.status === 'in_progress' ? 'bg-blue-50/30' :
                            task.status === 'done' ? 'bg-green-50/30' : ''
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${priorityInfo.color} flex items-center justify-center`}>
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                              <Badge variant={priorityInfo.badge as 'secondary' | 'warning' | 'destructive'} className="text-xs">
                                {priorityInfo.label}
                              </Badge>
                            </div>
                          </td>
                          
                          <td className="py-4 px-6">
                            <Badge 
                              variant={
                                task.status === 'in_progress' && task.assignedTo ? 'default' :
                                task.status === 'done' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {task.status === 'in_progress' && task.assignedTo ? '実行' :
                               task.status === 'done' ? '完了' : '待機'}
                            </Badge>
                          </td>
                          
                          <td className="py-4 px-6">
                            {assignedEngineer ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
                                  {assignedEngineer.avatar || '👤'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium text-gray-900">{assignedEngineer.name}</p>
                                    {task.status === 'todo' && task.assignedTo && assignedEngineer.status === 'idle' && (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          // エンジニアがアイドル状態の場合のみタスクを開始
                                          setTasks(prev => prev.map(t => 
                                            t.id === task.id && t.assignedTo === assignedEngineer.id
                                              ? { ...t, status: 'in_progress' as const, progress: 0 }
                                              : t
                                          ));
                                        }}
                                        className="h-5 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Play className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                  {task.status === 'in_progress' && assignedEngineer.status === 'building' ? (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-1.5 h-1.5 bg-green-500 rounded-full"
                                      />
                                      <span className="text-xs text-green-600">稼働中</span>
                                    </div>
                                  ) : task.status === 'todo' && task.assignedTo ? (
                                    <span className="text-xs text-orange-600">待機中</span>
                                  ) : null}
                                </div>
                              </div>
                            ) : task.status === 'done' && task.completedBy ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-xs">
                                  {getEngineerById(task.completedBy)?.avatar || '👤'}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-700">{getEngineerById(task.completedBy)?.name || '不明'}</p>
                                  <p className="text-xs text-green-600">完了済み</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // エンジニア選択ドロップダウンを表示するロジックを後で追加
                                    const idleEngineers = projectEngineers.filter(e => e.status === 'idle');
                                    if (idleEngineers.length > 0) {
                                      // 最初のアイドルエンジニアに割り当て
                                      handleAssignTask(task.id, idleEngineers[0].id);
                                    }
                                  }}
                                  className="h-6 w-6 p-0 border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                >
                                  <Plus className="w-3 h-3 text-gray-500" />
                                </Button>
                                <span className="text-xs text-gray-400">担当者を選択</span>
                              </div>
                            )}
                          </td>
                          
                          <td className="py-4 px-6">
                            {task.status === 'in_progress' && task.assignedTo && task.progress !== undefined ? (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${task.progress}%` }}
                                      transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 font-medium">
                                    {task.progress}%
                                  </span>
                                </div>
                              </div>
                            ) : task.status === 'done' ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">完了</span>
                                {task.completedBy && (
                                  <span className="text-xs text-gray-500">
                                    ({getEngineerById(task.completedBy)?.name || 'Engineer #' + task.completedBy.slice(-4)})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {tasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">タスクがありません</h3>
                    <p className="text-gray-600">新しいタスクを追加してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}