'use client';
import { Plus, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Project {
  id: string;
  title: string;
  status: 'created' | 'building' | 'ready' | 'error';
  preview_url?: string;
  github_pr_url?: string;
  created_at: string;
}

interface Engineer {
  id: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  eta_minutes?: number;
  last_message?: string;
}

interface DashboardProps {
  engineers: Engineer[];
  projects: Project[];
  maxSeats: number;
  onHireEngineer: () => void;
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
  onStartTask: (engineerId: string) => void;
}

export function Dashboard({
  engineers,
  projects,
  maxSeats,
  onHireEngineer,
  onCreateProject,
  onViewProject,
  onStartTask,
}: DashboardProps) {
  const activeSeats = engineers.filter(e => e.status !== 'idle').length;
  const canHireMore = engineers.length < maxSeats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI Engineer Dock
                </h1>
                <p className="text-sm text-gray-600 font-medium">Terminal-free development platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Seat Counter */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <div className="text-sm">
                  <span className="font-bold text-primary-600">{activeSeats}</span>
                  <span className="text-gray-500 font-medium">/{maxSeats} active</span>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(activeSeats / maxSeats) * 100}%` }}
                  />
                </div>
              </div>
              
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200/60 hover:bg-white/80">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200/60 hover:bg-white/80">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engineers Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Engineers</h2>
                <p className="text-gray-600 mt-1">Manage your autonomous development team</p>
              </div>
              {canHireMore && (
                <Button 
                  onClick={onHireEngineer} 
                  className="gap-2 h-11 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/25 rounded-xl font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Hire Engineer
                </Button>
              )}
            </div>

            {engineers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Plus className="w-16 h-16 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to scale your team?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Hire your first AI engineer to start building amazing projects with autonomous development.
                </p>
                <Button 
                  onClick={onHireEngineer} 
                  size="lg" 
                  className="gap-2 h-12 px-8 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/25 rounded-xl font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Hire First Engineer
                </Button>
              </motion.div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-1/3">Engineer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-1/6">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-1/6">Progress</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-1/12">ETA</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 w-1/4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engineers.map((engineer, index) => (
                      <motion.tr
                        key={engineer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <span className="font-medium text-gray-900">{engineer.id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            engineer.status === 'idle' ? 'bg-gray-100 text-gray-700' :
                            engineer.status === 'planning' ? 'bg-amber-100 text-amber-700' :
                            engineer.status === 'building' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {engineer.status === 'idle' ? 'Ready' :
                             engineer.status === 'planning' ? 'Planning' :
                             engineer.status === 'building' ? 'Building' :
                             'Error'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {engineer.status === 'building' && (
                            <div className="w-24">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {engineer.eta_minutes && (
                            <span className="text-sm text-gray-600">{engineer.eta_minutes}m</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {engineer.status === 'idle' ? (
                              <Button
                                size="sm"
                                onClick={() => onStartTask(engineer.id)}
                                className="h-8 px-3 text-xs"
                              >
                                Start Task
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement stop task functionality
                                  console.log('Stop task for engineer:', engineer.id);
                                }}
                                className="h-8 px-3 text-xs"
                              >
                                停止
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Projects Sidebar */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                <p className="text-sm text-gray-600 mt-1">Recent builds</p>
              </div>
              <Button 
                variant="outline" 
                onClick={onCreateProject} 
                size="sm" 
                className="gap-2 h-9 px-4 rounded-lg border-gray-200/60 hover:bg-gray-50 hover:border-gray-300"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
            </div>

            <div className="space-y-3">
              {projects.length === 0 ? (
                <Card className="border-gray-200/60 shadow-sm">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-6 font-medium">No projects yet</p>
                    <Button 
                      onClick={onCreateProject} 
                      variant="outline" 
                      size="sm"
                      className="h-9 px-4 rounded-lg border-gray-200/60 hover:bg-gray-50"
                    >
                      Create First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                projects.map(project => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200/60 hover:border-primary-200 group"
                    onClick={() => onViewProject(project)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary-700 transition-colors">
                        {project.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          project.status === 'ready' ? 'bg-success/10 text-success' :
                          project.status === 'building' ? 'bg-primary-50 text-primary-600' :
                          project.status === 'error' ? 'bg-destructive/10 text-destructive' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}