'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  CheckSquare, 
  FolderOpen, 
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'engineers' | 'tasks' | 'projects';
  onPageChange: (page: 'dashboard' | 'engineers' | 'tasks' | 'projects') => void;
}

const navigation = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: BarChart3, 
    description: 'エンジニア稼働率とシステム概要' 
  },
  { 
    id: 'engineers', 
    name: 'Engineers', 
    icon: Users, 
    description: 'エンジニアの個別状況とタスク' 
  },
  { 
    id: 'tasks', 
    name: 'Tasks', 
    icon: CheckSquare, 
    description: '現在実行中のタスク詳細' 
  },
  { 
    id: 'projects', 
    name: 'Projects', 
    icon: FolderOpen, 
    description: '各プロジェクトの詳細進捗' 
  },
] as const;

export function MainLayout({ children, currentPage, onPageChange }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Engineer Dock</h1>
                  <p className="text-sm text-gray-600">Terminal-free Development Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, tasks..."
                  className="pl-10 pr-4 py-2 bg-white/60 border border-gray-200/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/30 backdrop-blur-sm"
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200/60 hover:bg-white/80">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200/60 hover:bg-white/80">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onPageChange(item.id as 'dashboard' | 'engineers' | 'tasks' | 'projects')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl transition-all duration-200 text-left group ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg'
                          : 'hover:bg-white/80 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'}`} />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </motion.button>
                  );
                })}
              </nav>
              
              {/* Status Indicator */}
              <div className="mt-6 p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-700">System Online</span>
                </div>
                <p className="text-xs text-green-600 mt-1">All services running</p>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}