'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WizardProps {
  onComplete: (spec: {
    title: string;
    purpose: string;
    details: string;
  }) => void;
  onCancel: () => void;
}

const questions = [
  {
    id: 'title',
    label: 'What do you want to build?',
    placeholder: 'e.g., A marketing landing page for my SaaS product',
    type: 'text' as const,
  },
  {
    id: 'purpose',
    label: 'What is the main purpose?',
    placeholder: 'e.g., Convert visitors into paying customers with clear value proposition',
    type: 'textarea' as const,
  },
  {
    id: 'details',
    label: 'Any specific requirements or details?',
    placeholder: 'e.g., Include hero section, pricing table, testimonials, contact form. Use blue and white color scheme.',
    type: 'textarea' as const,
  },
];

export function Wizard({ onComplete, onCancel }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion.id]?.trim().length > 0;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onComplete({
        title: answers.title,
        purpose: answers.purpose,
        details: answers.details,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="w-full max-w-3xl"
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-12 bg-gradient-to-br from-primary-50 to-purple-50">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create Your Project
            </CardTitle>
            <p className="text-gray-600 font-medium mt-2">
              Step {currentStep + 1} of {questions.length}
            </p>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-purple-600 h-full rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-primary-500 shadow-sm' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xl font-bold text-gray-900 block">
                    {currentQuestion.label}
                  </label>
                  <p className="text-gray-600 font-medium">
                    Please provide detailed information to help our AI engineer understand your requirements.
                  </p>
                </div>

                {currentQuestion.type === 'text' ? (
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => updateAnswer(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full p-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none text-lg font-medium transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    autoFocus
                  />
                ) : (
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => updateAnswer(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    rows={5}
                    className="w-full p-5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none text-lg font-medium resize-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    autoFocus
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-100">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="h-11 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </Button>
                {currentStep > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="h-11 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
                className={`min-w-[140px] h-11 px-8 rounded-xl font-semibold transition-all duration-200 ${
                  canProceed && !isSubmitting
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg shadow-primary-500/25'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : isLastStep ? (
                  'Create Project'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}