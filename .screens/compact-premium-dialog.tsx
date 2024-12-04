import React from 'react';
import { AlertTriangle, X, ArrowRight, CheckCircle } from 'lucide-react';

const CompactPremiumDialog = () => {
  return (
    <div className="w-[400px] bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          <span className="text-sm font-medium">Critical Issue</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current Clause */}
        <div>
          <div className="text-sm text-gray-600 mb-1.5">Current Clause:</div>
          <div className="p-3 bg-gray-50 rounded text-sm border">
            Developer shall be liable for any and all damages.
          </div>
        </div>
        
        {/* Quick Reason */}
        <div className="text-sm text-gray-600">
          This clause exposes you to unlimited liability risk.
        </div>

        {/* Premium CTA */}
        <div className="bg-blue-50 p-4 rounded">
          <div className="space-y-2 mb-3">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Get professional liability protection
              </span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Fix all critical issues instantly
              </span>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
            Generate Safe Contract ($19)
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            Instant delivery • Money-back guarantee
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 text-sm">
          <button className="text-gray-500 hover:text-gray-700">
            Skip
          </button>
          <button className="text-blue-600 hover:text-blue-700 flex items-center">
            Next Issue
            <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompactPremiumDialog;
