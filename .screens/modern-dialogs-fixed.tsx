import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, Sparkles } from 'lucide-react';

const PreviewDialog = () => {
  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white/90 backdrop-blur-xl text-gray-900 rounded-2xl shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-yellow-500/10 text-yellow-600 px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Warning</span>
              </div>
              <div className="flex items-center bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="font-medium text-sm">Free Preview</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Clause */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Current Clause:</div>
            <div className="p-4 bg-gray-50 rounded-xl text-sm border border-gray-100">
              Payment shall be made within 30 days of invoice receipt.
            </div>
          </div>

          {/* Suggested Change */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Suggested Improvement:</div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-sm border border-green-100">
              Payment shall be made within 15 days of invoice receipt.
            </div>
          </div>
          
          {/* Explanation */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Why this matters:</div>
            <div className="text-sm text-gray-700 leading-relaxed">
              Industry standard payment terms are typically 15 days for software development agreements. 30 days may impact cash flow.
            </div>
          </div>

          {/* Next Action */}
          <div className="flex justify-end pt-2">
            <button className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm">
              See Next Issue
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 p-8 flex items-center justify-center">
      <PreviewDialog />
    </div>
  );
}
