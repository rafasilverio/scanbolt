"use client";

import { Contract } from '@/types/contract';
import { LockKeyhole, FileText, Sparkles } from 'lucide-react';

interface BlurredPreviewProps {
  tempId: string;
  onViewFullAnalysis: () => void;
  contract: Contract | null;
}

export function BlurredPreview({ tempId, onViewFullAnalysis, contract }: BlurredPreviewProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/95 to-indigo-900/95 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="max-w-xl w-full mx-auto p-6">
        <div className="bg-gradient-to-b from-indigo-900/40 to-indigo-900/20 rounded-2xl backdrop-blur-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <LockKeyhole className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Want to See the Full Analysis?
            </h2>
            <p className="text-white/60">
              Create an account or sign in to view the complete contract analysis and all our powerful features.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-3 text-white/80">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Detailed Analysis</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>AI-Powered Insights</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onViewFullAnalysis}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25"
          >
            View Full Analysis
          </button>

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
      </div>
    </div>
  );
}