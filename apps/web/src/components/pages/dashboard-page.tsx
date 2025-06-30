'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Users,
  Target,
  Zap,
  CheckCircle,
  Play,
  AlertCircle,
  Rocket,
  FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Engineer {
  id: string;
  name: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  current_task_id?: string;
  current_project_id?: string;
  assigned_project_id?: string;
  eta_minutes?: number;
  last_message?: string;
  taskProgress?: number;
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed' | 'review' | 'done';
  assignedTo?: string;
  completedBy?: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high';
  startedAt?: string;
  completedAt?: string;
}

interface Project {
  id: string;
  title: string;
  status: 'created' | 'building' | 'ready' | 'error';
  preview_url?: string;
  github_pr_url?: string;
  created_at: string;
}

interface DashboardPageProps {
  engineers: Engineer[];
  projects: Project[];
  tasks: Task[];
}

export function DashboardPage({ engineers, projects, tasks }: DashboardPageProps) {
  const activeEngineers = engineers.filter(e => e.status === 'building').length;
  const idleEngineers = engineers.filter(e => e.status === 'idle').length;
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'ready').length;
  
  const utilizationRate = engineers.length > 0 ? (activeEngineers / engineers.length) * 100 : 0;
  const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
  
  // タスク関連の統計
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  
  // 平均実行時間の計算（完了タスクから）
  const tasksWithTime = tasks.filter(t => t.startedAt && t.completedAt);
  const avgExecutionTime = tasksWithTime.length > 0
    ? tasksWithTime.reduce((acc, task) => {
        const start = new Date(task.startedAt!).getTime();
        const end = new Date(task.completedAt!).getTime();
        return acc + (end - start);
      }, 0) / tasksWithTime.length / (1000 * 60) // ミリ秒を分に変換
    : 0;
  
  // システム効率の計算
  const errorCount = engineers.filter(e => e.status === 'error').length + projects.filter(p => p.status === 'error').length;
  const totalEntities = engineers.length + projects.length;
  const systemEfficiency = totalEntities > 0 ? ((totalEntities - errorCount) / totalEntities) * 100 : 100;
  
  // エンジニア生産性（エンジニアあたりの完了タスク数）
  const engineerProductivity = engineers.length > 0 ? completedTasks / engineers.length : 0;

  const stats = [
    {
      title: 'エンジニア稼働率',
      value: `${Math.round(utilizationRate)}%`,
      change: utilizationRate > 50 ? `+${Math.round(utilizationRate - 50)}%` : `${Math.round(utilizationRate - 50)}%`,
      trend: utilizationRate > 50 ? 'up' : 'down',
      icon: Activity,
      color: 'from-blue-500 to-cyan-600',
      description: `${activeEngineers}/${engineers.length} エンジニアが稼働中`
    },
    {
      title: 'プロジェクト完了率',
      value: `${Math.round(completionRate)}%`,
      change: completionRate > 30 ? `+${Math.round(completionRate - 30)}%` : `${Math.round(completionRate - 30)}%`,
      trend: completionRate > 30 ? 'up' : 'down',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      description: `${completedProjects}/${totalProjects} プロジェクト完了`
    },
    {
      title: '平均実行時間',
      value: avgExecutionTime > 0 ? `${Math.round(avgExecutionTime)}分` : '-',
      change: avgExecutionTime > 0 && avgExecutionTime < 60 ? `-${Math.round(60 - avgExecutionTime)}分` : '+0分',
      trend: avgExecutionTime > 0 && avgExecutionTime < 60 ? 'down' : 'up',
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      description: `${tasksWithTime.length}タスクの平均`
    },
    {
      title: 'システム効率',
      value: `${Math.round(systemEfficiency)}%`,
      change: systemEfficiency > 90 ? `+${Math.round(systemEfficiency - 90)}%` : `${Math.round(systemEfficiency - 90)}%`,
      trend: systemEfficiency > 90 ? 'up' : 'down',
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      description: `エラー率 ${Math.round(100 - systemEfficiency)}%`
    }
  ];

  // 最近のアクティビティを動的に生成
  const recentActivity: Array<{ 
    time: string; 
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning';
    icon: typeof CheckCircle;
    iconColor: string;
    bgColor: string;
  }> = [];
  
  // 最近のタスクアクティビティ
  const recentTasks = tasks
    .filter(t => t.completedAt || t.startedAt)
    .sort((a, b) => {
      const timeA = new Date(a.completedAt || a.startedAt || '').getTime();
      const timeB = new Date(b.completedAt || b.startedAt || '').getTime();
      return timeB - timeA;
    })
    .slice(0, 3);
  
  recentTasks.forEach(task => {
    const engineer = engineers.find(e => e.id === (task.completedBy || task.assignedTo));
    if (task.status === 'done' && task.completedAt) {
      const timeDiff = Math.round((Date.now() - new Date(task.completedAt).getTime()) / (1000 * 60));
      recentActivity.push({
        time: `${timeDiff}分前`,
        title: 'タスク完了',
        description: `${engineer?.name || 'エンジニア'} が「${task.title}」を完了しました`,
        type: 'success' as const,
        icon: CheckCircle,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    } else if (task.status === 'in_progress' && task.startedAt) {
      const timeDiff = Math.round((Date.now() - new Date(task.startedAt).getTime()) / (1000 * 60));
      recentActivity.push({
        time: `${timeDiff}分前`,
        title: 'タスク開始',
        description: `${engineer?.name || 'エンジニア'} が「${task.title}」の作業を開始しました`,
        type: 'info' as const,
        icon: Play,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });
    }
  });
  
  // エンジニアの状態変化
  engineers.forEach(engineer => {
    if (engineer.status === 'idle' && engineer.last_message) {
      recentActivity.push({
        time: '数分前',
        title: 'エンジニア待機',
        description: `${engineer.name} が作業を完了し、待機状態になりました`,
        type: 'warning' as const,
        icon: AlertCircle,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }
  });
  
  // プロジェクトの最近のアクティビティ
  const recentProjects = projects
    .filter(p => p.status === 'ready' || p.status === 'building')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2);
    
  recentProjects.forEach(project => {
    const timeDiff = Math.round((Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60)); // 時間単位
    if (project.status === 'ready') {
      recentActivity.push({
        time: timeDiff < 24 ? `${timeDiff}時間前` : `${Math.round(timeDiff / 24)}日前`,
        title: 'プロジェクト完成',
        description: `「${project.title}」が正常に完成しました`,
        type: 'success' as const,
        icon: Rocket,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50'
      });
    } else if (project.status === 'building') {
      recentActivity.push({
        time: timeDiff < 24 ? `${timeDiff}時間前` : `${Math.round(timeDiff / 24)}日前`,
        title: 'プロジェクト構築中',
        description: `「${project.title}」を構築中です`,
        type: 'info' as const,
        icon: FolderOpen,
        iconColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      });
    }
  });
  
  // 最新6件のみ表示（時間順にソート）
  recentActivity.sort((a, b) => {
    const getTime = (time: string) => {
      const minuteMatch = time.match(/(\d+)分前/);
      if (minuteMatch) return parseInt(minuteMatch[1]);
      
      const hourMatch = time.match(/(\d+)時間前/);
      if (hourMatch) return parseInt(hourMatch[1]) * 60;
      
      const dayMatch = time.match(/(\d+)日前/);
      if (dayMatch) return parseInt(dayMatch[1]) * 24 * 60;
      
      return 999;
    };
    return getTime(a.time) - getTime(b.time);
  }).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">システム全体のエンジニア稼働状況と性能指標</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-600">{stat.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engineer Status Chart */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              エンジニア状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: 'building', label: '稼働中', count: activeEngineers, color: 'bg-blue-500' },
                { status: 'idle', label: 'アイドル', count: idleEngineers, color: 'bg-gray-400' },
                { status: 'planning', label: '計画中', count: engineers.filter(e => e.status === 'planning').length, color: 'bg-orange-500' },
                { status: 'error', label: 'エラー', count: engineers.filter(e => e.status === 'error').length, color: 'bg-red-500' }
              ].map((item) => {
                const percentage = engineers.length > 0 ? (item.count / engineers.length) * 100 : 0;
                
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="text-gray-600">{item.count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`${item.color} h-full rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* 追加統計 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{Math.round(engineerProductivity * 10) / 10}</p>
                    <p className="text-xs text-gray-600">タスク/エンジニア</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{highPriorityTasks}</p>
                    <p className="text-xs text-gray-600">優先度高タスク</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4 p-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                          <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {activity.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {activity.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {activity.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">まだアクティビティがありません</p>
                </div>
              )}
            </div>
            {recentActivity.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                  すべてのアクティビティを表示 →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Task Overview */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            タスク概要
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
                  <p className="text-xs text-gray-500 font-medium">総タスク数</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
                  <p className="text-xs text-gray-600 font-medium">実行中</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                  <p className="text-xs text-gray-600 font-medium">完了</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-3xl font-bold text-orange-600">{totalTasks - completedTasks - inProgressTasks}</p>
                  <p className="text-xs text-gray-600 font-medium">待機中</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">タスク完了率</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="relative h-full rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                </motion.div>
              </div>
              {/* プログレスバーのハイライト効果 */}
              <motion.div
                className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-128px', totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%'],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
            </div>
            
            {/* 追加情報 */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>実行中 {Math.round((inProgressTasks / totalTasks) * 100) || 0}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>完了 {Math.round((completedTasks / totalTasks) * 100) || 0}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

    </div>
  );
}