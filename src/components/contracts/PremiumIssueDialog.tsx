import { X, ArrowRight, CheckCircle, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';

export interface Highlight {
  id: string;
  content: {
    text: string;
  };
  comment?: {
    type: 'critical' | 'warning' | 'improvement';
    message: string;
    suggestion: string;
  };
}

interface PremiumIssueDialogProps {
  highlight: Highlight;
  onClose: () => void;
  onNext: () => void;
  hasNext: boolean;
}

export function PremiumIssueDialog({ highlight, onClose, onNext, hasNext }: PremiumIssueDialogProps) {
  const getIssueIcon = () => {
    switch (highlight.comment?.type) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 mr-1.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 mr-1.5" />;
      case 'improvement':
        return <Lightbulb className="w-4 h-4 mr-1.5" />;
    }
  };

  const getIssueColor = () => {
    switch (highlight.comment?.type) {
      case 'critical':
        return 'bg-red-50 text-red-600';
      case 'warning':
        return 'bg-yellow-50 text-yellow-600';
      case 'improvement':
        return 'bg-green-50 text-green-600';
    }
  };

  const getIssueLabel = () => {
    switch (highlight.comment?.type) {
      case 'critical':
        return 'Critical Issue';
      case 'warning':
        return 'Warning';
      case 'improvement':
        return 'Improvement';
    }
  };

  return (
    <div className="w-[400px] bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className={`flex items-center ${getIssueColor()} px-2.5 py-1 rounded-full`}>
          {getIssueIcon()}
          <span className="text-sm font-medium">{getIssueLabel()}</span>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current Clause */}
        <div>
          <div className="text-sm text-gray-600 mb-1.5">Current Text:</div>
          <div className="p-3 bg-gray-50 rounded text-sm border">
            {highlight.content.text}
          </div>
        </div>
        
        {/* Quick Reason */}
        <div className="text-sm text-gray-600">
          {highlight.comment?.message}
        </div>

        {/* Premium CTA */}
        <div className="bg-blue-50 p-4 rounded">
          <div className="space-y-2 mb-3">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Get professional suggestions
              </span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Fix all issues instantly
              </span>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
            Upgrade to Pro ($19)
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            Instant access • Money-back guarantee
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 text-sm">
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            Skip
          </button>
          {hasNext && (
            <button 
              className="text-blue-600 hover:text-blue-700 flex items-center"
              onClick={onNext}
            >
              Next Issue
              <ArrowRight size={14} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 