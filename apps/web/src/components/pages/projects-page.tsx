'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  Search,
  Filter,
  ExternalLink,
  Github,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Settings,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface Project {
  id: string;
  title: string;
  status: 'created' | 'building' | 'ready' | 'error';
  preview_url?: string;
  github_pr_url?: string;
  created_at: string;
  description?: string;
  tasks?: Task[];
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

interface ProjectsPageProps {
  projects: Project[];
  engineers: Engineer[];
  onCreateProject: () => void;
  onViewProjectDetails: (project: Project) => void;
  onAssignEngineerToProject: (engineerId: string, projectId: string) => void;
}

const statusConfig = {
  created: { label: '作成済み', color: 'secondary', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  building: { label: '構築中', color: 'default', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  ready: { label: '完成', color: 'secondary', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  error: { label: 'エラー', color: 'destructive', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
} as const;

export function ProjectsPage({ 
  projects, 
  engineers, 
  onCreateProject, 
  onViewProjectDetails,
  onAssignEngineerToProject
}: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProjectForAssign, setSelectedProjectForAssign] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const projectStats = {
    total: projects.length,
    building: projects.filter(p => p.status === 'building').length,
    ready: projects.filter(p => p.status === 'ready').length,
    error: projects.filter(p => p.status === 'error').length
  };

  // Mock tasks for demonstration
  const getMockTasks = (projectId: string): Task[] => [
    {
      id: `${projectId}-1`,
      title: 'Set up authentication system',
      description: 'Implement user login/register with JWT tokens',
      priority: 'high',
      estimatedMinutes: 120,
      assignedTo: engineers[0]?.id,
      progress: 65,
      status: 'in_progress',
    },
    {
      id: `${projectId}-2`,
      title: 'Create user dashboard',
      description: 'Build responsive dashboard with navigation',
      priority: 'medium',
      estimatedMinutes: 90,
      status: 'todo',
    },
    {
      id: `${projectId}-3`,
      title: 'Add payment integration',
      description: 'Integrate Stripe for subscription billing',
      priority: 'high',
      estimatedMinutes: 180,
      status: 'todo',
    },
  ];

  const getProjectProgress = (project: Project) => {
    const tasks = getMockTasks(project.id);
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    return tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  };

  const getProjectEngineers = (projectId: string) => {
    return engineers.filter(engineer => engineer.assigned_project_id === projectId);
  };

  const getActiveEngineers = (projectId: string) => {
    return engineers.filter(engineer => 
      engineer.assigned_project_id === projectId && 
      (engineer.status === 'building' || engineer.status === 'planning')
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">各プロジェクトの詳細進捗状況と管理</p>
        </div>
        <Button
          onClick={onCreateProject}
          className="gap-2 h-11 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg rounded-xl"
        >
          <Plus className="w-4 h-4" />
          新しいプロジェクト
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">総プロジェクト数</p>
            <p className="text-xl font-bold text-gray-900">{projectStats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">構築中</p>
            <p className="text-xl font-bold text-blue-600">{projectStats.building}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">完成</p>
            <p className="text-xl font-bold text-green-600">{projectStats.ready}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">エラー</p>
            <p className="text-xl font-bold text-red-600">{projectStats.error}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="プロジェクト名や説明で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">全てのステータス</option>
                <option value="building">構築中</option>
                <option value="ready">完成</option>
                <option value="created">作成済み</option>
                <option value="error">エラー</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => {
          const config = statusConfig[project.status];
          const progress = getProjectProgress(project);
          const tasks = getMockTasks(project.id);
          const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
          const completedTasks = tasks.filter(t => t.status === 'done').length;
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${config.bgColor} ${config.borderColor} border`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">{project.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.color as 'secondary' | 'default' | 'destructive'} className="text-xs">
                          {config.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">進捗状況</span>
                      <span className="text-primary-600 font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-primary-500 to-purple-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Task Summary */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white/60 rounded-lg">
                      <p className="text-xs text-gray-600">総タスク</p>
                      <p className="font-bold text-gray-900">{tasks.length}</p>
                    </div>
                    <div className="p-2 bg-white/60 rounded-lg">
                      <p className="text-xs text-gray-600">実行中</p>
                      <p className="font-bold text-blue-600">{activeTasks}</p>
                    </div>
                    <div className="p-2 bg-white/60 rounded-lg">
                      <p className="text-xs text-gray-600">完了</p>
                      <p className="font-bold text-green-600">{completedTasks}</p>
                    </div>
                  </div>

                  {/* Assigned Engineers - Only show for created/building projects */}
                  {project.status !== 'ready' && (
                    <div className="p-3 bg-white/60 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">アサイン済みエンジニア</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {getProjectEngineers(project.id).length}名
                        </span>
                      </div>
                    
                    {getProjectEngineers(project.id).length > 0 ? (
                      <div className="space-y-2">
                        {getProjectEngineers(project.id).slice(0, 3).map(engineer => (
                          <div key={engineer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">
                                {engineer.avatar || '👤'}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{engineer.name}</p>
                                <p className="text-xs text-gray-500">#{engineer.id.slice(-4)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                engineer.status === 'building' ? 'bg-blue-500' :
                                engineer.status === 'planning' ? 'bg-orange-500' :
                                engineer.status === 'idle' ? 'bg-gray-400' : 'bg-red-500'
                              }`} />
                              <span className={`text-xs font-medium ${
                                engineer.status === 'building' ? 'text-blue-600' :
                                engineer.status === 'planning' ? 'text-orange-600' :
                                engineer.status === 'idle' ? 'text-gray-600' : 'text-red-600'
                              }`}>
                                {engineer.status === 'building' ? '稼働' :
                                 engineer.status === 'planning' ? '計画' :
                                 engineer.status === 'idle' ? '待機' : 'エラー'}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {getProjectEngineers(project.id).length > 3 && (
                          <div className="text-center">
                            <span className="text-xs text-gray-500">
                              +{getProjectEngineers(project.id).length - 3}名のエンジニア
                            </span>
                          </div>
                        )}
                        
                        {/* Active Engineers Summary */}
                        {getActiveEngineers(project.id).length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-blue-700">
                                {getActiveEngineers(project.id).length}名が現在稼働
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-center py-2">
                          <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500">エンジニア未割り当て</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProjectForAssign(project.id)}
                          className="w-full gap-1 h-8 text-xs"
                        >
                          <UserPlus className="w-3 h-3" />
                          エンジニアを割り当て
                        </Button>
                        {selectedProjectForAssign === project.id && (
                          <div className="mt-2 space-y-1">
                            {engineers
                              .filter(e => e.status === 'idle' && !e.assigned_project_id)
                              .map(engineer => (
                                <div
                                  key={engineer.id}
                                  onClick={() => {
                                    onAssignEngineerToProject(engineer.id, project.id);
                                    setSelectedProjectForAssign(null);
                                  }}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs">
                                    {engineer.avatar || '👤'}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-900">{engineer.name}</p>
                                    <p className="text-xs text-gray-500">待機中</p>
                                  </div>
                                </div>
                              ))}
                            {engineers.filter(e => e.status === 'idle' && !e.assigned_project_id).length === 0 && (
                              <p className="text-xs text-gray-500 text-center py-2">
                                利用可能なエンジニアがいません
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProjectDetails(project)}
                      className="flex-1 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      詳細
                    </Button>
                    
                    {project.preview_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.preview_url, '_blank')}
                        className="gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                    
                    {project.github_pr_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.github_pr_url, '_blank')}
                        className="gap-1"
                      >
                        <Github className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">プロジェクトが見つかりません</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? '検索条件に一致するプロジェクトがありません。フィルターを変更してみてください。'
                : 'まだプロジェクトが作成されていません。新しいプロジェクトを作成してください。'
              }
            </p>
            {(!searchQuery && filterStatus === 'all') && (
              <Button
                onClick={onCreateProject}
                className="gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                新しいプロジェクト
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}