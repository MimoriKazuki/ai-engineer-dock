'use client';

import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Users,
  Target,
  Zap
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
  const recentActivity = [];
  
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
        message: `${engineer?.name || 'エンジニア'} が「${task.title}」を完了`,
        type: 'success' as const
      });
    } else if (task.status === 'in_progress' && task.startedAt) {
      const timeDiff = Math.round((Date.now() - new Date(task.startedAt).getTime()) / (1000 * 60));
      recentActivity.push({
        time: `${timeDiff}分前`,
        message: `${engineer?.name || 'エンジニア'} が「${task.title}」を開始`,
        type: 'info' as const
      });
    }
  });
  
  // エンジニアの状態変化
  engineers.forEach(engineer => {
    if (engineer.status === 'idle' && engineer.last_message) {
      recentActivity.push({
        time: '数分前',
        message: `${engineer.name} がアイドル状態に`,
        type: 'warning' as const
      });
    }
  });
  
  // 最新5件のみ表示
  recentActivity.sort((a, b) => {
    const getMinutes = (time: string) => {
      const match = time.match(/(\d+)分前/);
      return match ? parseInt(match[1]) : 999;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  }).slice(0, 5);

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
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Overview */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" />
            タスク概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-xs text-gray-600">総タスク数</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
              <p className="text-xs text-gray-600">実行中</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              <p className="text-xs text-gray-600">完了</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{totalTasks - completedTasks - inProgressTasks}</p>
              <p className="text-xs text-gray-600">待機中</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">タスク完了率</span>
              <span className="font-bold text-blue-600">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}