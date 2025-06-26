'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, GitBranch, Package, Zap, CheckCircle, Code } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TaskStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ComponentType<{className?: string}>;
  duration?: number;
  output?: string;
}

interface TaskProgressProps {
  taskTitle: string;
  isActive: boolean;
  progress: number;
}

const defaultSteps: TaskStep[] = [
  { id: 'analyze', name: 'Analyzing Requirements', status: 'pending', icon: Code },
  { id: 'plan', name: 'Creating Implementation Plan', status: 'pending', icon: GitBranch },
  { id: 'scaffold', name: 'Scaffolding Project Structure', status: 'pending', icon: Package },
  { id: 'implement', name: 'Writing Code', status: 'pending', icon: Terminal },
  { id: 'test', name: 'Running Tests', status: 'pending', icon: CheckCircle },
  { id: 'deploy', name: 'Deploying Preview', status: 'pending', icon: Zap },
];

export function TaskProgress({ taskTitle, isActive, progress }: TaskProgressProps) {
  const [steps, setSteps] = useState<TaskStep[]>(defaultSteps);
  const [liveOutput, setLiveOutput] = useState<string[]>([]);

  // Simulate real-time progress updates
  useEffect(() => {
    if (!isActive) return;

    const updateSteps = () => {
      setSteps(prev => prev.map((step, index) => {
        const stepProgress = (index + 1) / prev.length * 100;
        
        if (stepProgress <= progress) {
          return { ...step, status: 'completed' };
        } else if (stepProgress - (100 / prev.length) < progress) {
          return { ...step, status: 'running' };
        }
        return { ...step, status: 'pending' };
      }));
    };

    updateSteps();

    // Simulate live terminal output
    const outputs = [
      '> Initializing project...',
      '> Installing dependencies...',
      '> Generating components...',
      '> Configuring build tools...',
      '> Running linter...',
      '> Building for production...',
      '> Creating deployment...',
    ];

    const outputInterval = setInterval(() => {
      if (liveOutput.length < outputs.length && isActive) {
        setLiveOutput(prev => [...prev, outputs[prev.length]]);
      }
    }, 2000);

    return () => clearInterval(outputInterval);
  }, [isActive, progress, liveOutput.length]);

  return (
    <div className="space-y-4">
      {/* Task Header */}
      <Card className="border-0 bg-gradient-to-r from-primary-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{taskTitle}</h3>
              <p className="text-sm text-gray-600">AI Engineer is working...</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{Math.round(progress)}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-purple-600 h-full rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step Progress */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Implementation Steps</h4>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    step.status === 'completed'
                      ? 'bg-green-50 border border-green-200'
                      : step.status === 'running'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : step.status === 'running'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : step.status === 'running' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : (
                      <Icon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-medium ${
                      step.status === 'completed'
                        ? 'text-green-700'
                        : step.status === 'running'
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    }`}>
                      {step.name}
                    </div>
                    {step.status === 'running' && (
                      <div className="text-sm text-blue-600 font-medium">
                        In progress...
                      </div>
                    )}
                  </div>
                  
                  {step.status === 'running' && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Terminal Output */}
      {isActive && liveOutput.length > 0 && (
        <Card className="border-0 bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Live Output</span>
              <div className="flex gap-1 ml-auto">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="font-mono text-sm space-y-1 max-h-32 overflow-y-auto">
              {liveOutput.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400"
                >
                  {line}
                  {index === liveOutput.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                      className="ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}