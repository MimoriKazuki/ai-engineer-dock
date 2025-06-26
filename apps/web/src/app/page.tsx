'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { EngineersPage } from '@/components/pages/engineers-page';
import { TasksPage } from '@/components/pages/tasks-page';
import { ProjectsPage } from '@/components/pages/projects-page';
import { Wizard } from '@/components/project/wizard';
import { ProjectDetail } from '@/components/project/project-detail';

// Mock data for development
interface EngineerData {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  current_task_id?: string;
  current_project_id?: string;
  assigned_project_id?: string; // エンジニアが所属しているプロジェクト
  eta_minutes?: number;
  last_message?: string;
  taskProgress?: number;
}

interface TaskData {
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

interface ProjectData {
  id: string;
  title: string;
  status: 'created' | 'building' | 'ready' | 'error';
  preview_url?: string;
  github_pr_url?: string;
  created_at: string;
  description?: string;
}

const mockEngineers: EngineerData[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: '👨‍💻',
    status: 'idle' as const, // 初期状態はidle
    current_task_title: undefined,
    current_task_id: undefined,
    current_project_id: undefined,
    assigned_project_id: '2', // E-commerce Platformに所属
    eta_minutes: undefined,
    last_message: 'Ready to start!',
    taskProgress: undefined,
  },
  {
    id: '2',
    name: 'Sarah Kim', 
    avatar: '👩‍💻',
    status: 'idle' as const,
    current_task_title: undefined,
    current_task_id: undefined,
    current_project_id: undefined,
    assigned_project_id: '2', // E-commerce Platformに所属
    eta_minutes: undefined,
    last_message: 'Ready for next assignment!',
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    avatar: '🧑‍💻',
    status: 'idle' as const, // 初期状態はidle
    current_task_title: undefined,
    current_task_id: undefined,
    current_project_id: undefined,
    assigned_project_id: '3', // Mobile App Backendに所属
    eta_minutes: undefined,
    last_message: 'Ready to work!',
    taskProgress: undefined,
  },
];

const mockTasks: TaskData[] = [
  {
    id: '1',
    title: 'Set up authentication system',
    description: 'Implement user login/register with JWT tokens and secure session management',
    priority: 'high',
    estimatedMinutes: 120,
    status: 'todo', // 初期状態はtodo
    projectId: '2',
  },
  {
    id: '2',
    title: 'Create user dashboard',
    description: 'Build responsive dashboard with navigation and user profile management',
    priority: 'medium',
    estimatedMinutes: 90,
    status: 'todo',
    projectId: '2',
  },
  {
    id: '3',
    title: 'Add payment integration',
    description: 'Integrate Stripe for subscription billing and payment processing',
    priority: 'high',
    estimatedMinutes: 180,
    status: 'todo',
    projectId: '2',
  },
  {
    id: '4',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment workflows',
    priority: 'medium',
    estimatedMinutes: 60,
    status: 'todo', // 初期状態はtodo
    projectId: '3',
  },
  {
    id: '5',
    title: 'Write API documentation',
    description: 'Create comprehensive API documentation with examples',
    priority: 'low',
    estimatedMinutes: 45,
    assignedTo: '2', // 完了タスクには必ずassignedToが必要
    completedBy: '2', // 誰が完了したかを記録
    status: 'done',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    projectId: '1',
  },
  {
    id: '6',
    title: 'Implement responsive design',
    description: 'Ensure the landing page works perfectly on all device sizes',
    priority: 'medium',
    estimatedMinutes: 75,
    assignedTo: '1', // 完了タスクには必ずassignedToが必要
    completedBy: '1', // 誰が完了したかを記録
    status: 'done',
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    projectId: '1',
  },
  {
    id: '7',
    title: 'Add contact form',
    description: 'Create and integrate contact form with email notifications',
    priority: 'low',
    estimatedMinutes: 30,
    status: 'todo', // 初期状態はtodo
    projectId: '1',
  },
  {
    id: '8',
    title: 'Optimize database queries',
    description: 'Improve database performance and add proper indexing',
    priority: 'medium',
    estimatedMinutes: 90,
    status: 'todo', // 初期状態はtodo
    projectId: '2',
  },
  {
    id: '9',
    title: 'Add error handling',
    description: 'Implement proper error handling and user feedback',
    priority: 'high',
    estimatedMinutes: 45,
    status: 'todo',
    projectId: '3',
  },
];

const mockProjects: ProjectData[] = [
  {
    id: '1',
    title: 'Marketing Landing Page',
    status: 'ready' as const,
    preview_url: 'https://example.com',
    github_pr_url: 'https://github.com/example/repo/pull/1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Modern landing page for marketing campaigns with responsive design',
  },
  {
    id: '2',
    title: 'E-commerce Platform',
    status: 'building' as const,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Full-featured e-commerce platform with payment integration',
  },
  {
    id: '3',
    title: 'Mobile App Backend',
    status: 'created' as const,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'RESTful API backend for mobile application',
  },
];

type CurrentView = 'dashboard' | 'engineers' | 'tasks' | 'projects' | 'wizard' | 'project';

export default function Home() {
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [engineers, setEngineers] = useState(mockEngineers);
  const [tasks, setTasks] = useState(mockTasks);
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // Function to automatically update project status based on tasks
  const updateProjectStatus = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    if (projectTasks.length === 0) {
      // No tasks means project is in created state
      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, status: 'created' as const } : project
      ));
      return;
    }

    // Check if all tasks are done
    const allTasksDone = projectTasks.every(task => task.status === 'done');
    
    // Check if at least one task is in progress
    const hasTaskInProgress = projectTasks.some(task => 
      task.status === 'in_progress' || task.status === 'review' || task.status === 'completed'
    );
    
    // Check if all tasks are todo
    const allTasksTodo = projectTasks.every(task => task.status === 'todo');

    let newStatus: 'created' | 'building' | 'ready' | 'error' = 'created';
    
    if (allTasksDone) {
      newStatus = 'ready';
    } else if (hasTaskInProgress) {
      newStatus = 'building';
    } else if (allTasksTodo) {
      newStatus = 'created';
    }

    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, status: newStatus } : project
    ));
  };

  // Update all project statuses on mount and when tasks change
  useEffect(() => {
    // Update status for all projects
    const uniqueProjectIds = new Set(tasks.map(task => task.projectId));
    uniqueProjectIds.forEach(projectId => {
      updateProjectStatus(projectId);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // Simulate real-time task progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEngineers(prev => prev.map(engineer => {
        if (engineer.status === 'building' && engineer.taskProgress !== undefined) {
          const newProgress = Math.min(100, engineer.taskProgress + Math.random() * 3);
          return {
            ...engineer,
            taskProgress: newProgress,
            eta_minutes: Math.max(0, engineer.eta_minutes! - 1),
          };
        }
        return engineer;
      }));

      setTasks(prev => {
        const updatedTasks = prev.map(task => {
          if (task.status === 'in_progress' && task.progress !== undefined) {
            const newProgress = Math.min(100, task.progress + Math.random() * 2);
            
            // Auto transition to review when task reaches 100%
            if (newProgress >= 100 && task.progress < 100) {
              return {
                ...task,
                progress: 100,
                status: 'completed' as const,
              };
            }
            
            return {
              ...task,
              progress: newProgress,
            };
          }
          // Auto transition completed tasks to review after a short delay
          if (task.status === 'completed') {
            // Simulate auto transition to review after "completion"
            return {
              ...task,
              status: 'review' as const,
            };
          }
          
          return task;
        });
        
        // Update project statuses for affected projects
        const affectedProjectIds = new Set<string>();
        updatedTasks.forEach((task, index) => {
          if (prev[index].status !== task.status) {
            affectedProjectIds.add(task.projectId);
          }
        });
        affectedProjectIds.forEach(projectId => {
          setTimeout(() => updateProjectStatus(projectId), 0);
        });
        
        return updatedTasks;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: 'dashboard' | 'engineers' | 'tasks' | 'projects') => {
    setCurrentView(page);
  };

  const handleHireEngineer = () => {
    const engineerNames = ['Emily Davis', 'John Smith', 'Jessica Wong', 'David Johnson', 'Maria Garcia', 'Ryan Lee'];
    const avatars = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬'];
    
    const newEngineer: EngineerData = {
      id: `${Date.now()}`,
      name: engineerNames[Math.floor(Math.random() * engineerNames.length)],
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      status: 'idle' as const,
      current_task_title: undefined,
      current_task_id: undefined,
      current_project_id: undefined,
      eta_minutes: undefined,
      last_message: 'Just hired! Ready to work.',
    };
    setEngineers(prev => [...prev, newEngineer]);
  };

  const handleCreateProject = () => {
    setCurrentView('wizard');
  };

  const handleWizardComplete = (spec: { title: string; purpose: string; details: string }) => {
    const newProject: ProjectData = {
      id: `${Date.now()}`,
      title: spec.title,
      status: 'created' as const,
      created_at: new Date().toISOString(),
      description: spec.purpose,
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentView('projects');
  };

  const handleWizardCancel = () => {
    setCurrentView('projects');
  };

  const handleViewProjectDetails = (project: ProjectData) => {
    setSelectedProject(project);
    setCurrentView('project');
  };


  const handleUpdateEngineer = (engineerId: string, updates: Partial<Pick<EngineerData, 'name' | 'avatar'>>) => {
    setEngineers(prev => prev.map(engineer =>
      engineer.id === engineerId ? { ...engineer, ...updates } : engineer
    ));
  };

  // エンジニアをプロジェクトに割り当て
  const handleAssignEngineerToProject = (engineerId: string, projectId: string) => {
    setEngineers(prev => prev.map(engineer =>
      engineer.id === engineerId 
        ? { 
            ...engineer, 
            assigned_project_id: projectId,
            last_message: `${projects.find(p => p.id === projectId)?.title || 'プロジェクト'}に参加しました`
          }
        : engineer
    ));

    // プロジェクトに参加後は自動的にタスクを開始しない
    // ユーザーが明示的に「次のタスク開始」ボタンを押すまで待機
  };

  // プロジェクトからエンジニアを解除
  const handleRemoveEngineerFromProject = (engineerId: string) => {
    setEngineers(prev => prev.map(engineer =>
      engineer.id === engineerId 
        ? { 
            ...engineer, 
            assigned_project_id: undefined,
            current_project_id: undefined,
            current_task_id: undefined,
            current_task_title: undefined,
            status: 'idle',
            taskProgress: undefined,
            eta_minutes: undefined,
            last_message: 'プロジェクトから離脱しました'
          }
        : engineer
    ));

    // 関連するタスクを未割り当てに戻す
    setTasks(prev => {
      const affectedProjectIds = new Set<string>();
      const updatedTasks = prev.map(task => {
        if (task.assignedTo === engineerId) {
          affectedProjectIds.add(task.projectId);
          return { ...task, assignedTo: undefined, status: 'todo' as const, progress: 0 };
        }
        return task;
      });
      // Update project statuses
      affectedProjectIds.forEach(projectId => {
        setTimeout(() => updateProjectStatus(projectId), 0);
      });
      return updatedTasks;
    });
  };


  const handleStartTask = (engineerId: string, taskId?: string) => {
    const engineer = engineers.find(e => e.id === engineerId);
    if (!engineer) return;

    // エンジニアが既にタスクを実行中の場合は拒否
    if (engineer.status === 'building' || engineer.status === 'planning') {
      console.log('エンジニアは既に他のタスクを実行中です');
      return;
    }

    // プロジェクトに割り当てられていない場合は拒否
    if (!engineer.assigned_project_id) {
      console.log('エンジニアがプロジェクトに割り当てられていません');
      return;
    }

    let targetTask;
    if (taskId) {
      targetTask = tasks.find(t => t.id === taskId);
    } else {
      // まずエンジニアに既に割り当てられている待機中タスクを確認
      const assignedPendingTask = tasks.find(t => 
        t.status === 'todo' && 
        t.assignedTo === engineerId && 
        t.projectId === engineer.assigned_project_id
      );
      
      if (assignedPendingTask) {
        targetTask = assignedPendingTask;
      } else {
        // 優先度の高い順に未割り当てタスクを検索
        const projectTasks = tasks
          .filter(t => 
            t.status === 'todo' && 
            !t.assignedTo && 
            t.projectId === engineer.assigned_project_id
          )
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });
        
        targetTask = projectTasks[0];
      }
    }

    if (!targetTask) {
      console.log('利用可能なタスクがありません');
      return;
    }

    // エンジニアの所属プロジェクトと異なるプロジェクトのタスクは拒否
    if (targetTask.projectId !== engineer.assigned_project_id) {
      console.log('エンジニアは他のプロジェクトのタスクを実行できません');
      return;
    }
    
    // エンジニアが既に実行中のタスクがあるか確認
    const hasActiveTask = tasks.some(t => 
      t.assignedTo === engineerId && t.status === 'in_progress'
    );
    
    if (hasActiveTask) {
      console.log('エンジニアは既にタスクを実行中です');
      // タスクを割り当てるが待機状態に
      setTasks(prev => prev.map(task => 
        task.id === targetTask.id 
          ? { ...task, assignedTo: engineerId, status: 'todo' as const }
          : task
      ));
      return;
    }

    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === targetTask.id 
          ? { ...task, assignedTo: engineerId, status: 'in_progress' as const, progress: 0, startedAt: new Date().toISOString() }
          : task
      );
      // Update project status
      setTimeout(() => updateProjectStatus(targetTask.projectId), 0);
      return updatedTasks;
    });
    
    setEngineers(prev => prev.map(engineer =>
      engineer.id === engineerId
        ? { 
            ...engineer, 
            status: 'building', 
            current_task_title: targetTask.title, 
            current_task_id: targetTask.id,
            current_project_id: targetTask.projectId,
            taskProgress: 0, 
            eta_minutes: targetTask.estimatedMinutes,
            last_message: `${targetTask.title} を開始しました`
          }
        : engineer
    ));
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'pause' | 'stop' | 'complete' | 'approve' | 'reject') => {
    setTasks(prev => {
      let affectedProjectId: string | null = null;
      const updatedTasks = prev.map(task => {
        if (task.id === taskId) {
          affectedProjectId = task.projectId;
          switch (action) {
            case 'complete':
              // 未割り当てのタスクは完了できない
              if (!task.assignedTo) {
                console.warn('未割り当てのタスクは完了できません');
                return task;
              }
              return { ...task, status: 'completed' as const, progress: 100, completedBy: task.assignedTo };
            case 'approve':
              // completedByを保持して承認
              return { ...task, status: 'done' as const };
            case 'reject':
              return { ...task, status: 'in_progress' as const, progress: 75 };
            case 'pause':
              // タスクを一時停止する際、completedByはクリアしない（履歴として保持）
              return { ...task, status: 'todo' as const, assignedTo: undefined, progress: 0 };
            default:
              return task;
          }
        }
        return task;
      });
      // Update project status
      if (affectedProjectId) {
        setTimeout(() => updateProjectStatus(affectedProjectId!), 0);
      }
      return updatedTasks;
    });
    
    // Update engineers when task status changes
    if (action === 'complete' || action === 'pause' || action === 'approve') {
      const task = tasks.find(t => t.id === taskId);
      if (task?.assignedTo) {
        setEngineers(prev => prev.map(engineer => {
          // completedByが設定されている場合はそれを使用、そうでなければassignedToを使用
          const taskEngineerId = task.completedBy || task.assignedTo;
          return engineer.id === taskEngineerId
            ? { 
                ...engineer, 
                status: 'idle', 
                current_task_title: undefined, 
                current_task_id: undefined,
                current_project_id: undefined,
                taskProgress: undefined, 
                eta_minutes: undefined,
                last_message: action === 'approve' ? 'タスクが承認されました！' : 'タスクが完了しました'
              }
            : engineer;
        }));

        // タスク完了後は自動的に次のタスクを開始しない
        // ユーザーが明示的に「次のタスク開始」ボタンを押すまで待機
      }
    }
  };

  const handleViewTaskDetails = (task: TaskData) => {
    console.log('View task details:', task);
  };

  const handleAddTask = (taskData: Omit<TaskData, 'id'>) => {
    const newTask: TaskData = {
      ...taskData,
      id: `task_${Date.now()}`,
    };
    setTasks(prev => [...prev, newTask]);
    // Update project status
    setTimeout(() => updateProjectStatus(newTask.projectId), 0);
  };

  const handleEditTask = (updatedTask: TaskData) => {
    setTasks(prev => {
      const oldTask = prev.find(t => t.id === updatedTask.id);
      const updatedTasks = prev.map(task => {
        if (task.id === updatedTask.id) {
          // 完了情報を保持
          if (oldTask?.completedBy) {
            return { ...updatedTask, completedBy: oldTask.completedBy };
          }
          return updatedTask;
        }
        return task;
      });
      // Update project status if task status changed
      if (oldTask && oldTask.status !== updatedTask.status) {
        setTimeout(() => updateProjectStatus(updatedTask.projectId), 0);
      }
      return updatedTasks;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
    // Also update engineers if they were assigned to this task
    setEngineers(prev => prev.map(engineer => {
      const wasAssigned = tasks.find(t => t.id === taskId && t.assignedTo === engineer.id);
      if (wasAssigned) {
        return { 
          ...engineer, 
          status: 'idle', 
          current_task_title: undefined, 
          current_task_id: undefined,
          current_project_id: undefined,
          taskProgress: undefined, 
          eta_minutes: undefined 
        };
      }
      return engineer;
    }));
    // Update project status
    if (taskToDelete) {
      setTimeout(() => updateProjectStatus(taskToDelete.projectId), 0);
    }
  };

  const handleFireEngineer = (engineerId: string) => {
    // エンジニアが実行中のタスクがある場合は未割り当てに戻す
    const engineer = engineers.find(e => e.id === engineerId);
    if (engineer && engineer.current_task_id) {
      setTasks(prev => {
        let affectedProjectId: string | null = null;
        const updatedTasks = prev.map(task => {
          if (task.id === engineer.current_task_id) {
            affectedProjectId = task.projectId;
            return { ...task, assignedTo: undefined, status: 'todo' as const, progress: 0 };
          }
          return task;
        });
        // Update project status
        if (affectedProjectId) {
          setTimeout(() => updateProjectStatus(affectedProjectId!), 0);
        }
        return updatedTasks;
      });
    }
    
    // エンジニアを削除
    setEngineers(prev => prev.filter(e => e.id !== engineerId));
  };

  // Handle special views
  if (currentView === 'wizard') {
    return (
      <Wizard
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  if (currentView === 'project' && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        engineers={engineers}
        onBack={() => setCurrentView('projects')}
      />
    );
  }

  // Main application with navigation
  return (
    <MainLayout currentPage={currentView as 'dashboard' | 'engineers' | 'tasks' | 'projects'} onPageChange={handlePageChange}>
      {currentView === 'dashboard' && (
        <DashboardPage 
          engineers={engineers} 
          projects={projects}
          tasks={tasks}
        />
      )}
      
      {currentView === 'engineers' && (
        <EngineersPage
          engineers={engineers}
          projects={projects}
          onHireEngineer={handleHireEngineer}
          onStartTask={handleStartTask}
          onUpdateEngineer={handleUpdateEngineer}
          onAssignToProject={handleAssignEngineerToProject}
          onRemoveFromProject={handleRemoveEngineerFromProject}
          onFireEngineer={handleFireEngineer}
        />
      )}
      
      {currentView === 'tasks' && (
        <TasksPage
          tasks={tasks}
          engineers={engineers}
          projects={projects}
          onTaskAction={handleTaskAction}
          onViewTaskDetails={handleViewTaskDetails}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
      
      {currentView === 'projects' && (
        <ProjectsPage
          projects={projects}
          engineers={engineers}
          onCreateProject={handleCreateProject}
          onViewProjectDetails={handleViewProjectDetails}
          onAssignEngineerToProject={handleAssignEngineerToProject}
        />
      )}
    </MainLayout>
  );
}