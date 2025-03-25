"use client";

import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProcessingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  progress: number;
}

export function ProcessingModal({ isOpen, onCancel, progress: uploadProgress }: ProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const lastProgressRef = useRef(0);
  
  const steps = [
    "Scanning document",
    "Identifying key clauses",
    "Analyzing terms",
    "Checking for risks",
    "Generating improvements"
  ];

  // Ensure progress is always moving forward
  useEffect(() => {
    if (uploadProgress > lastProgressRef.current) {
      lastProgressRef.current = uploadProgress;
      setDisplayedProgress(uploadProgress);
    }
  }, [uploadProgress]);

  // Reset only when modal first opens
  useEffect(() => {
    if (isOpen) {
      // Only reset if it was previously closed
      if (lastProgressRef.current === 0) {
        setCurrentStep(0);
        setDisplayedProgress(0);
      }
    } else {
      // Reset when modal closes completely
      lastProgressRef.current = 0;
    }
  }, [isOpen]);

  // Update steps based on progress - never go backward in steps
  useEffect(() => {
    // Map progress to steps with thresholds
    let newStep = 0;
    
    if (displayedProgress <= 15) {
      newStep = 0; // Scanning document
    } else if (displayedProgress <= 35) {
      newStep = 1; // Identifying key clauses
    } else if (displayedProgress <= 60) {
      newStep = 2; // Analyzing terms
    } else if (displayedProgress <= 80) {
      newStep = 3; // Checking for risks
    } else {
      newStep = 4; // Generating improvements
    }
    
    // Only update if stepping forward
    if (newStep > currentStep) {
      setCurrentStep(newStep);
    }
  }, [displayedProgress, currentStep]);

  // Calculate time remaining
  const getTimeRemaining = () => {
    const totalTime = 30; // Total expected seconds
    const remainingTime = Math.ceil((totalTime * (100 - displayedProgress)) / 100);
    return Math.max(remainingTime, 0);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => onCancel()}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-xl bg-gradient-to-b from-slate-900 to-primary text-white border-0 rounded-xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
          <div className="relative w-full h-3 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${displayedProgress}%` }}
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
                <div className="text-2xl font-bold text-blue-400">{Math.round(displayedProgress)}%</div>
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
