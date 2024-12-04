import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, CheckCircle, Sparkles, FileText } from 'lucide-react';

const FreePreviewDialog = ({ onClose, onNext }) => {
  return (
    <div className="absolute right-8 top-20 w-[400px] bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Warning</span>
          </div>
          <div className="flex items-center bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Free Preview</span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <div className="text-sm text-gray-600 mb-1.5">Current Clause:</div>
          <div className="p-3 bg-gray-50 rounded text-sm border">
            Payment shall be made within 30 days of invoice receipt.
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-1.5">Suggested Improvement:</div>
          <div className="p-3 bg-green-50 rounded text-sm border border-green-100">
            Payment shall be made within 15 days of invoice receipt.
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Industry standard payment terms are typically 15 days for software development agreements.
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={onNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Next Issue <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PremiumDialog = ({ onClose, onNext }) => {
  return (
    <div className="absolute right-8 top-20 w-[400px] bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          <span className="text-sm font-medium">Critical Issue</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <div className="text-sm text-gray-600 mb-1.5">Current Clause:</div>
          <div className="p-3 bg-gray-50 rounded text-sm border">
            Developer shall be liable for any and all damages.
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          This clause exposes you to unlimited liability risk.
        </div>

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

        <div className="flex justify-between items-center pt-2 text-sm">
          <button className="text-gray-500 hover:text-gray-700">
            Skip
          </button>
          <button 
            onClick={onNext}
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            Next Issue
            <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentReview = () => {
  const [currentDialog, setCurrentDialog] = useState('free'); // 'free' or 'premium'
  const [highlightedText, setHighlightedText] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center text-yellow-600">
              <AlertTriangle size={20} className="mr-2" />
              <span>2 Warnings</span>
            </div>
            <div className="flex items-center text-red-600">
              <AlertTriangle size={20} className="mr-2" />
              <span>1 Critical Issue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 relative">
          {/* Document Content */}
          <div className="prose max-w-none">
            <div className="flex items-center text-gray-600 mb-6">
              <FileText size={20} className="mr-2" />
              <span className="font-medium">Software_Development_Agreement.pdf</span>
            </div>

            <p className="mb-4">This Software Development Agreement is made between:</p>
            
            <p className="mb-4">
              <span 
                className="bg-yellow-100 px-1 rounded cursor-pointer"
                onClick={() => setCurrentDialog('free')}
              >
                Payment shall be made within 30 days of invoice receipt.
              </span>
            </p>

            <p className="mb-4">The Developer agrees to provide the following services:</p>

            <p className="mb-4">
              <span 
                className="bg-red-100 px-1 rounded cursor-pointer"
                onClick={() => setCurrentDialog('premium')}
              >
                Developer shall be liable for any and all damages.
              </span>
            </p>
          </div>

          {/* Dialogs */}
          {currentDialog === 'free' && (
            <FreePreviewDialog 
              onClose={() => setCurrentDialog(null)}
              onNext={() => setCurrentDialog('premium')}
            />
          )}
          {currentDialog === 'premium' && (
            <PremiumDialog 
              onClose={() => setCurrentDialog(null)}
              onNext={() => setCurrentDialog(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentReview;
