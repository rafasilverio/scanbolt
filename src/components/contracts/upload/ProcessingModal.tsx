"use client";

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProcessingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  progress: number;
}

export function ProcessingModal({ isOpen, onCancel, progress: uploadProgress }: ProcessingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Scanning document",
    "Identifying key clauses",
    "Analyzing terms",
    "Checking for risks",
    "Generating insights"
  ];

  // Reset progress when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Handle upload progress (0-50%)
  useEffect(() => {
    if (isOpen && uploadProgress <= 100) {
      setProgress(uploadProgress / 2); // First 50% is upload
    }
  }, [uploadProgress, isOpen]);

  // Handle processing progress (50-100%)
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;

    if (isOpen && uploadProgress === 100) {
      progressTimer = setInterval(() => {
        setProgress(old => {
          if (old >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          // Slower increment for processing phase
          return old + 0.5;
        });
      }, 100); // Slower interval
    }

    return () => clearInterval(progressTimer);
  }, [uploadProgress, isOpen]);

  // Update steps based on progress
  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * steps.length);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [progress]);

  // Calculate time remaining
  const getTimeRemaining = () => {
    const totalTime = 30; // Total expected seconds
    const remainingTime = Math.ceil((totalTime * (100 - progress)) / 100);
    return Math.max(remainingTime, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-b from-indigo-950 to-indigo-900 text-white border-0">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Contract</h2>
            <p className="text-white/60">This will take just a moment</p>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step}
                className={`flex items-center transition-all duration-300 ${
                  index > currentStep ? 'text-white/40' : 'text-white'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                ) : index === currentStep ? (
                  <Clock className="w-5 h-5 mr-3 text-blue-400 animate-pulse" />
                ) : (
                  <div className="w-5 h-5 mr-3" />
                )}
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{Math.round(progress)}%</div>
                <div className="text-sm text-white/60">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{getTimeRemaining()}</div>
                <div className="text-sm text-white/60">Seconds Left</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentStep + 1}/5</div>
                <div className="text-sm text-white/60">Steps</div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                Bank-Level Security
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                AI-Powered Analysis
              </div>
            </div>
          </div>

          {/* Cancel Option */}
          <div className="text-center mt-6">
            <button 
              onClick={onCancel}
              className="text-white/60 hover:text-white transition-colors"
            >
              Cancel Analysis
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
