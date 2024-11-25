import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import React from 'react';

export default function ProcessingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Scanning document",
    "Identifying key clauses",
    "Analyzing terms",
    "Checking for risks",
    "Generating insights"
  ];

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return old + 1;
      });
    }, 50);

    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    setCurrentStep(Math.floor((progress / 100) * steps.length));
  }, [progress]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto p-6">
        {/* Main Card */}
        <div className="bg-gradient-to-b from-indigo-900/40 to-indigo-900/20 rounded-2xl backdrop-blur-sm p-8">
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
                <div className="text-2xl font-bold text-blue-400">{Math.min(progress, 100)}%</div>
                <div className="text-sm text-white/60">Complete</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.ceil((100 - progress) / 20)}</div>
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
        </div>

        {/* Cancel Option */}
        <div className="text-center mt-6">
          <button className="text-white/60 hover:text-white transition-colors">
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
