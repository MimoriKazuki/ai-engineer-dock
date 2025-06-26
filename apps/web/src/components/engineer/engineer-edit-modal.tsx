'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Engineer {
  id: string;
  name: string;
  avatar?: string;
  status: 'idle' | 'planning' | 'building' | 'error';
  current_task_title?: string;
  current_task_id?: string;
  current_project_id?: string;
  eta_minutes?: number;
  last_message?: string;
  taskProgress?: number;
}

interface EngineerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updates: Partial<Pick<Engineer, 'name' | 'avatar'>>) => void;
  engineer: Engineer;
}

const avatarOptions = [
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬',
  '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🎨', '👩‍🎨', '🧑‍🎨',
  '🤖', '👨‍🚀', '👩‍🚀', '🧑‍🚀'
];

export function EngineerEditModal({ isOpen, onClose, onSubmit, engineer }: EngineerEditModalProps) {
  const [name, setName] = useState(engineer.name);
  const [selectedAvatar, setSelectedAvatar] = useState(engineer.avatar || '👨‍💻');

  // Update form when engineer changes
  React.useEffect(() => {
    setName(engineer.name);
    setSelectedAvatar(engineer.avatar || '👨‍💻');
  }, [engineer]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSubmit({
      name: name.trim(),
      avatar: selectedAvatar,
    });
    
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
          className="relative w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">
                  エンジニア情報を編集
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
              {/* Current Engineer Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl">{selectedAvatar}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{name || '名前未設定'}</p>
                  <p className="text-xs text-gray-500">Engineer #{engineer.id.slice(-4)}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  エンジニア名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 田中太郎"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-200"
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Camera className="w-4 h-4 inline mr-1" />
                  アバター選択
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                        selectedAvatar === avatar
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-lg border-gray-200 hover:bg-gray-50"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 shadow-lg"
                >
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}