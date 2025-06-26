'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Plus,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Play,
  Pause,
  Edit,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EngineerEditModal } from '@/components/engineer/engineer-edit-modal';

interface Engineer {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  current_task_id?: string;
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
}

interface EngineersPageProps {
  engineers: Engineer[];
  projects: Project[];
  onHireEngineer: () => void;
  onStartTask: (engineerId: string) => void;
  onUpdateEngineer: (engineerId: string, updates: Partial<Pick<Engineer, 'name' | 'avatar'>>) => void;
  onAssignToProject: (engineerId: string, projectId: string) => void;
  onRemoveFromProject: (engineerId: string) => void;
  onFireEngineer: (engineerId: string) => void;
}


export function EngineersPage({ 
  engineers, 
  projects,
  onHireEngineer, 
  onStartTask,
  onUpdateEngineer,
  onAssignToProject,
  onRemoveFromProject,
  onFireEngineer
}: EngineersPageProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getProjectById = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const filteredEngineers = engineers.filter(engineer => {
    const matchesStatus = filterStatus === 'all' || engineer.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      engineer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engineer.current_task_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const engineerStats = {
    total: engineers.length,
    active: engineers.filter(e => e.status === 'building').length,
    idle: engineers.filter(e => e.status === 'idle').length,
    planning: engineers.filter(e => e.status === 'planning').length,
    error: engineers.filter(e => e.status === 'error').length
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Engineers</h1>
          <p className="text-gray-600">エンジニアの個別状況とタスク管理</p>
        </div>
        <Button
          onClick={onHireEngineer}
          className="gap-2 h-11 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg rounded-xl"
        >
          <Plus className="w-4 h-4" />
          新しいエンジニアを雇用
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">総エンジニア数</p>
            <p className="text-xl font-bold text-gray-900">{engineerStats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">稼働中</p>
            <p className="text-xl font-bold text-blue-600">{engineerStats.active}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">アイドル</p>
            <p className="text-xl font-bold text-gray-600">{engineerStats.idle}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">計画中</p>
            <p className="text-xl font-bold text-orange-600">{engineerStats.planning}</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">エラー</p>
            <p className="text-xl font-bold text-red-600">{engineerStats.error}</p>
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
                placeholder="エンジニアIDやタスク名で検索..."
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
                <option value="building">稼働中</option>
                <option value="idle">アイドル</option>
                <option value="planning">計画中</option>
                <option value="error">エラー</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engineers Table */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-600" />
            エンジニア一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                    エンジニア
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                    ステータス
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-80">
                    プロジェクト
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                    進捗
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEngineers.map((engineer, index) => {
                  const statusConfig = {
                    idle: { 
                      label: 'アイドル', 
                      bgColor: 'bg-gray-100', 
                      textColor: 'text-gray-700',
                      dotColor: 'bg-gray-400'
                    },
                    planning: { 
                      label: '計画中', 
                      bgColor: 'bg-orange-100', 
                      textColor: 'text-orange-700',
                      dotColor: 'bg-orange-500'
                    },
                    building: { 
                      label: '稼働中', 
                      bgColor: 'bg-blue-100', 
                      textColor: 'text-blue-700',
                      dotColor: 'bg-blue-500'
                    },
                    error: { 
                      label: 'エラー', 
                      bgColor: 'bg-red-100', 
                      textColor: 'text-red-700',
                      dotColor: 'bg-red-500'
                    }
                  };
                  
                  const config = statusConfig[engineer.status];
                  const currentProject = engineer.current_project_id ? getProjectById(engineer.current_project_id) : null;
                  
                  return (
                    <motion.tr
                      key={engineer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-lg">
                              {engineer.avatar || '👨‍💻'}
                            </div>
                            {engineer.status === 'building' && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {engineer.name}
                            </p>
                            <p className="text-xs text-gray-500">#{engineer.id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={engineer.status === 'building' ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${config.dotColor}`}
                          />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${config.bgColor} ${config.textColor}`}>
                            {config.label}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          {currentProject ? (
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <FolderOpen className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                <p className="text-sm font-medium text-blue-600 truncate" title={currentProject.title}>
                                  {currentProject.title}
                                </p>
                                {engineer.assigned_project_id === engineer.current_project_id && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1" title="所属プロジェクト"></div>
                                )}
                              </div>
                              {engineer.current_task_title && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs font-medium text-gray-700 truncate" title={engineer.current_task_title}>
                                    📋 {engineer.current_task_title}
                                  </p>
                                  {engineer.last_message && (
                                    <p className="text-xs text-gray-500 mt-1 truncate" title={engineer.last_message}>
                                      {engineer.last_message}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : engineer.assigned_project_id ? (
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <FolderOpen className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                <p className="text-sm font-medium text-blue-600 truncate">
                                  {getProjectById(engineer.assigned_project_id)?.title || 'プロジェクト不明'}
                                </p>
                                <div className="w-2 h-2 bg-green-500 rounded-full ml-1" title="所属プロジェクト"></div>
                              </div>
                              <p className="text-xs text-gray-500">次のタスクを待機中...</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-sm text-gray-400 italic">プロジェクト未割り当て</span>
                              <div className="mt-1">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      onAssignToProject(engineer.id, e.target.value);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                                  defaultValue=""
                                >
                                  <option value="">プロジェクトを選択</option>
                                  {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                      {project.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        {engineer.taskProgress !== undefined ? (
                          <div className="w-20">
                            <div className="text-xs text-center mb-1">
                              <span className="font-medium text-gray-700">{Math.round(engineer.taskProgress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${engineer.taskProgress}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      
                      
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingEngineer(engineer);
                              setIsEditModalOpen(true);
                            }}
                            className="gap-1 h-7 px-2 text-xs"
                          >
                            <Edit className="w-3 h-3" />
                            編集
                          </Button>
                          
                          {engineer.assigned_project_id && engineer.status === 'idle' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRemoveFromProject(engineer.id)}
                              className="gap-1 h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                            >
                              プロジェクト解除
                            </Button>
                          )}
                          
                          {engineer.status === 'idle' && engineer.assigned_project_id && (
                            <Button
                              size="sm"
                              onClick={() => onStartTask(engineer.id)}
                              className="gap-1 h-7 px-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            >
                              <Play className="w-3 h-3" />
                              タスク開始
                            </Button>
                          )}
                          
                          {engineer.status === 'building' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => console.log('Pause task')}
                              className="gap-1 h-7 px-2 text-xs"
                            >
                              <Pause className="w-3 h-3" />
                              停止
                            </Button>
                          )}
                          
                          {engineer.status === 'idle' && !engineer.assigned_project_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`${engineer.name}を削除しますか？`)) {
                                  onFireEngineer(engineer.id);
                                }
                              }}
                              className="gap-1 h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              削除
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredEngineers.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">エンジニアがまだ雇用されていません</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredEngineers.length === 0 && (
        <Card className="border-0 bg-white/60 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">エンジニアが見つかりません</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? '検索条件に一致するエンジニアがいません。フィルターを変更してみてください。'
                : 'まだエンジニアが雇用されていません。新しいエンジニアを雇用してください。'
              }
            </p>
            {(!searchQuery && filterStatus === 'all') && (
              <Button
                onClick={onHireEngineer}
                className="gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                新しいエンジニアを雇用
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Engineer Edit Modal */}
      {editingEngineer && (
        <EngineerEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEngineer(null);
          }}
          onSubmit={(updates) => {
            onUpdateEngineer(editingEngineer.id, updates);
            setIsEditModalOpen(false);
            setEditingEngineer(null);
          }}
          engineer={editingEngineer}
        />
      )}
    </div>
  );
}