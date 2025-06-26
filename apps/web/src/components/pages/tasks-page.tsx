'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Pause,
  Clock,
  User,
  CheckCircle,
  Activity,
  Filter,
  Search,
  Eye,
  Code,
  Brain,
  Zap,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskModal } from '@/components/project/task-modal';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  assignedTo?: string;
  completedBy?: string;
  progress?: number;
  status: 'todo' | 'in_progress' | 'completed' | 'review' | 'done';
  startedAt?: string;
  completedAt?: string;
  projectId: string;
}

interface Project {
  id: string;
  title: string;
  status: 'created' | 'building' | 'ready' | 'error';
  description?: string;
}

interface Engineer {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  eta_minutes?: number;
  last_message?: string;
  taskProgress?: number;
}

interface TasksPageProps {
  tasks: Task[];
  engineers: Engineer[];
  projects: Project[];
  onTaskAction: (taskId: string, action: 'start' | 'pause' | 'stop' | 'complete' | 'approve' | 'reject') => void;
  onViewTaskDetails: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const priorityConfig = {
  low: { icon: Code, color: 'from-gray-500 to-gray-600', badge: 'secondary', label: '低' },
  medium: { icon: Brain, color: 'from-amber-500 to-orange-600', badge: 'warning', label: '中' },
  high: { icon: Zap, color: 'from-red-500 to-pink-600', badge: 'destructive', label: '高' },
} as const;

const getCurrentStep = (progress: number): string => {
  if (progress < 16) return 'Analyzing requirements...';
  if (progress < 33) return 'Planning implementation...';
  if (progress < 50) return 'Setting up structure...';
  if (progress < 66) return 'Writing code...';
  if (progress < 83) return 'Running tests...';
  return 'Finalizing deployment...';
};

export function TasksPage({ 
  tasks, 
  engineers, 
  projects,
  onTaskAction, 
  onViewTaskDetails,
  onAddTask,
  onEditTask,
  onDeleteTask
}: TasksPageProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterEngineer, setFilterEngineer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesEngineer = filterEngineer === 'all' || 
      (filterEngineer === 'unassigned' && !task.assignedTo) ||
      task.assignedTo === filterEngineer;
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesProject && matchesEngineer && matchesSearch;
  });

  // Group tasks by engineer
  const tasksByEngineer = filteredTasks.reduce((acc, task) => {
    const engineerId = task.assignedTo || (task.status === 'done' && task.completedBy ? task.completedBy : 'unassigned');
    if (!acc[engineerId]) {
      acc[engineerId] = [];
    }
    acc[engineerId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getProjectById = (projectId: string) => {
    return projects.find(p => p.id === projectId) || { 
      id: projectId, 
      title: `Unknown Project (${projectId})`, 
      status: 'created' as const 
    };
  };

  const getEngineerById = (engineerId: string) => {
    return engineers.find(e => e.id === engineerId) || { 
      id: engineerId, 
      name: `Unknown Engineer (${engineerId})`,
      status: 'idle' as const 
    };
  };

  const taskStats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    pending: tasks.filter(t => t.status === 'todo').length
  };

  // Modal handlers

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedProjectId(task.projectId);
    setIsTaskModalOpen(true);
  };

  const handleModalSubmit = (taskData: Omit<Task, 'id' | 'status'>) => {
    if (editingTask) {
      // Edit existing task
      onEditTask({
        ...taskData,
        id: editingTask.id,
        status: editingTask.status,
      });
    } else {
      // Add new task
      onAddTask({
        ...taskData,
        status: 'todo',
        projectId: selectedProjectId!,
      });
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setSelectedProjectId(null);
  };

  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setSelectedProjectId(null);
  };

  const activeTasks = tasks.filter(t => t.status === 'in_progress');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">現在実行中のタスクの詳細状況と進捗管理</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">総タスク数</p>
            <p className="text-xl font-bold text-gray-900">{taskStats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">待機中</p>
            <p className="text-xl font-bold text-orange-600">{taskStats.pending}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">実行中</p>
            <p className="text-xl font-bold text-blue-600">{taskStats.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">完了</p>
            <p className="text-xl font-bold text-purple-600">{taskStats.completed}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">確認中</p>
            <p className="text-xl font-bold text-yellow-600">{taskStats.review}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">終了</p>
            <p className="text-xl font-bold text-green-600">{taskStats.done}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks Overview */}
      {activeTasks.length > 0 && (
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              現在実行中のタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTasks.map((task) => {
                const assignedEngineer = engineers.find(e => e.id === task.assignedTo);
                const priorityInfo = priorityConfig[task.priority];
                const Icon = priorityInfo.icon;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${priorityInfo.color} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <Badge variant={priorityInfo.badge as 'secondary' | 'warning' | 'destructive'} className="text-xs">
                          {priorityInfo.label}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewTaskDetails(task)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">
                      {task.title}
                    </h4>
                    
                    {task.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>進捗</span>
                          <span>{Math.round(task.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-blue-600 font-medium">
                          {getCurrentStep(task.progress)}
                        </div>
                      </div>
                    )}
                    
                    {assignedEngineer && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        <span>Engineer #{assignedEngineer.id.slice(-4)}</span>
                        {assignedEngineer.status === 'building' && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-green-500 rounded-full ml-1"
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="タスク名や説明で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="all">全てのステータス</option>
                  <option value="todo">待機中</option>
                  <option value="in_progress">実行中</option>
                  <option value="completed">完了</option>
                  <option value="review">確認中</option>
                  <option value="done">終了</option>
                </select>
              </div>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">全ての優先度</option>
                <option value="high">高優先度</option>
                <option value="medium">中優先度</option>
                <option value="low">低優先度</option>
              </select>
              
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">全てのプロジェクト</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              
              <select
                value={filterEngineer}
                onChange={(e) => setFilterEngineer(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">全てのエンジニア</option>
                <option value="unassigned">未割り当て</option>
                {engineers.map(engineer => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.name || `Engineer #${engineer.id.slice(-4)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Engineer */}
      <div className="space-y-8">
        {Object.keys(tasksByEngineer).length === 0 ? (
          <Card className="border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">タスクが見つかりません</h3>
              <p className="text-gray-600">
                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all'
                  ? '検索条件に一致するタスクがありません。フィルターを変更してみてください。'
                  : 'まだタスクが作成されていません。'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(tasksByEngineer).map(([engineerId, engineerTasks], engineerIndex) => {
            const engineer = engineerId === 'unassigned' 
              ? { id: 'unassigned', name: '未割り当て', status: 'idle' as const }
              : getEngineerById(engineerId);
            
            const engineerStatusConfig = {
              idle: { bgColor: 'bg-gray-50', borderColor: 'border-gray-200', textColor: 'text-gray-700', icon: '💤' },
              planning: { bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-700', icon: '🧠' },
              building: { bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700', icon: '🔨' },
              error: { bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700', icon: '❌' }
            };
            const engineerConfig = engineerStatusConfig[engineer.status];
            
            return (
              <motion.div
                key={engineerId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: engineerIndex * 0.2 }}
                className="space-y-4"
              >
                {/* Engineer Header */}
                <Card className={`border-0 backdrop-blur-sm ${engineerConfig.bgColor} ${engineerConfig.borderColor} border`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                          {engineer.avatar || engineerConfig.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{engineer.name}</h2>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className={`text-xs ${engineerConfig.textColor}`}>
                              {engineer.status === 'idle' ? 'アイドル' :
                               engineer.status === 'planning' ? '計画中' :
                               engineer.status === 'building' ? '稼働中' : 'エラー'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              #{engineer.id.slice(-4)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {engineerTasks.length}個のタスク
                            </span>
                            <span className="text-sm text-gray-600">
                              実行中: {engineerTasks.filter(t => t.status === 'in_progress').length}
                            </span>
                            <span className="text-sm text-gray-600">
                              完了: {engineerTasks.filter(t => t.status === 'completed').length}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Engineer Stats */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          {Math.round((engineerTasks.filter(t => t.status === 'done').length / engineerTasks.length) * 100)}%
                        </div>
                        <div className="text-sm text-gray-500">完了率</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Engineer Tasks Table */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">タスク</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">プロジェクト</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">優先度</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">ステータス</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">進捗/完了者</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">アクション</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {engineerTasks.map((task, taskIndex) => {
                            const project = getProjectById(task.projectId);
                            const priorityInfo = priorityConfig[task.priority];
                            const Icon = priorityInfo.icon;
                    
                            return (
                              <motion.tr
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (engineerIndex * 0.1) + (taskIndex * 0.05) }}
                                className={`hover:bg-gray-50 transition-colors duration-200 ${
                                  task.status === 'in_progress' ? 'bg-blue-50/50' :
                                  task.status === 'completed' ? 'bg-purple-50/50' :
                                  task.status === 'review' ? 'bg-yellow-50/50' :
                                  task.status === 'done' ? 'bg-green-50/50' : ''
                                }`}
                              >
                                {/* Task Title & Description */}
                                <td className="py-4 px-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                      {task.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                      {task.description}
                                    </p>
                                    {task.status === 'in_progress' && task.progress !== undefined && (
                                      <div className="mt-2">
                                        <p className="text-xs text-blue-600 font-medium">
                                          {getCurrentStep(task.progress)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Project */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-primary-500"></div>
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {project.title}
                                    </span>
                                  </div>
                                </td>

                                {/* Priority */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${priorityInfo.color} flex items-center justify-center`}>
                                      <Icon className="w-3 h-3 text-white" />
                                    </div>
                                    <Badge variant={priorityInfo.badge as 'secondary' | 'warning' | 'destructive'} className="text-xs">
                                      {priorityInfo.label}
                                    </Badge>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-4 px-4">
                                  <Badge 
                                    variant={
                                      task.status === 'in_progress' ? 'default' :
                                      task.status === 'completed' ? 'secondary' :
                                      task.status === 'review' ? 'warning' :
                                      task.status === 'done' ? 'secondary' : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {task.status === 'in_progress' ? '実行中' :
                                     task.status === 'completed' ? '完了' :
                                     task.status === 'review' ? '確認中' :
                                     task.status === 'done' ? '終了' : '待機中'}
                                  </Badge>
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
                                    <div className="flex items-center gap-1">
                                      {task.completedBy ? (
                                        <div className="flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3 text-green-600" />
                                          <span className="text-xs text-green-600">
                                            {getEngineerById(task.completedBy)?.name || 'Engineer #' + task.completedBy.slice(-4)}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-green-600">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-xs font-medium">完了</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>


                                {/* Actions */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center justify-end gap-1">
                                    {/* Review Actions */}
                                    {task.status === 'review' && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => onTaskAction(task.id, 'approve')}
                                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onTaskAction(task.id, 'reject')}
                                          className="h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                          <XCircle className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                    
                                    {task.status === 'in_progress' && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onTaskAction(task.id, 'complete')}
                                          className="h-7 px-2 text-xs bg-purple-600 text-white hover:bg-purple-700"
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onTaskAction(task.id, 'pause')}
                                          className="h-7 px-2 text-xs"
                                        >
                                          <Pause className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                    
                                    {task.status !== 'done' && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEditTask(task)}
                                          className="h-7 px-2 text-xs"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => onDeleteTask(task.id)}
                                          className="h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    )}
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => onViewTaskDetails(task)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        projectId={selectedProjectId || undefined}
        editingTask={editingTask}
      />
    </div>
  );
}