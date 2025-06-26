'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Zap, Brain, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  assignedTo?: string;
  progress?: number;
  status: 'todo' | 'in_progress' | 'completed' | 'review' | 'done';
  startedAt?: string;
  completedAt?: string;
  projectId: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'status'>) => void;
  projectId?: string;
  editingTask?: Task | null;
}

const priorityOptions = [
  { value: 'low', label: 'Low Priority', icon: Code, color: 'from-gray-500 to-gray-600' },
  { value: 'medium', label: 'Medium Priority', icon: Brain, color: 'from-amber-500 to-orange-600' },
  { value: 'high', label: 'High Priority', icon: Zap, color: 'from-red-500 to-pink-600' },
] as const;

export function TaskModal({ isOpen, onClose, onSubmit, projectId, editingTask }: TaskModalProps) {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(editingTask?.priority || 'medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(editingTask?.estimatedMinutes || 30);

  // Update form when editingTask changes
  React.useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setEstimatedMinutes(editingTask.estimatedMinutes);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setEstimatedMinutes(30);
    }
  }, [editingTask]);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !projectId) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedMinutes,
      projectId,
      assignedTo: editingTask?.assignedTo,
      progress: editingTask?.progress,
      startedAt: editingTask?.startedAt,
      completedAt: editingTask?.completedAt,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setEstimatedMinutes(30);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-lg"
        >
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {editingTask ? 'タスクを編集' : 'タスクを追加'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg border-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Implement user authentication"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what needs to be built..."
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-200 resize-none"
                />
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = priority === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setPriority(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {option.label.split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <div className="flex gap-2">
                  {[15, 30, 60, 120].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => setEstimatedMinutes(minutes)}
                      className={`flex-1 p-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                        estimatedMinutes === minutes
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="5"
                  max="240"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full mt-3"
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  {estimatedMinutes} minutes
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !description.trim()}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingTask ? '更新' : '追加'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}