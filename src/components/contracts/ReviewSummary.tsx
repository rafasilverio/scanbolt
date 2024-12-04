import { AlertTriangle, AlertCircle, Lightbulb, ArrowRight, Play } from 'lucide-react';
import { Contract } from '@/types/contract';
import { Button } from '@/components/ui/button';

interface ReviewSummaryProps {
  contract: Contract;
  onStartReview: () => void;
  showReview: boolean;
}

export function ReviewSummary({ contract, onStartReview, showReview }: ReviewSummaryProps) {
  const criticalCount = contract.highlights.filter(h => h.type === 'critical').length;
  const warningCount = contract.highlights.filter(h => h.type === 'warning').length;
  const improvementCount = contract.highlights.filter(h => h.type === 'improvement').length;

  const getMessageContent = () => {
    if (criticalCount > 0) {
      return {
        type: 'critical',
        icon: <AlertCircle className="w-6 h-6 text-red-400" />,
        title: 'Critical Issues Detected',
        color: 'text-red-100',
        bgColor: 'bg-gradient-to-r from-red-900/40 to-red-800/40',
        borderColor: 'border-red-500/30',
        messages: [
          `Your contract has ${criticalCount} critical issues that need immediate attention`,
          'These issues could put you at significant legal risk'
        ],
        symbol: '⚠️'
      };
    }
    if (warningCount > 0) {
      return {
        type: 'warning',
        icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
        title: 'Important Issues Found',
        color: 'text-yellow-100',
        bgColor: 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/40',
        borderColor: 'border-yellow-500/30',
        messages: [
          `${warningCount} sections need your attention`,
          'Review these issues to protect your interests'
        ],
        symbol: '⚠️'
      };
    }
    return {
      type: 'improvement',
      icon: <Lightbulb className="w-6 h-6 text-emerald-400" />,
      title: 'Contract Review Ready',
      color: 'text-emerald-100',
      bgColor: 'bg-gradient-to-r from-emerald-900/40 to-emerald-800/40',
      borderColor: 'border-emerald-500/30',
      messages: [
        `${improvementCount} potential improvements identified`,
        'Optimize your contract with our suggestions'
      ],
      symbol: '💡'
    };
  };

  const message = getMessageContent();

  return (
    <div className="mt-6">
      <div className="p-6">
        <div className={`${message.bgColor} backdrop-blur-md rounded-lg p-6 border ${message.borderColor} hover:bg-opacity-50 transition-all duration-200`}>
          <div className={`flex items-center gap-3 ${message.color} font-semibold text-lg mb-4`}>
            {message.icon}
            <span className="tracking-tight">{message.title}</span>
          </div>
          <div className={`space-y-3 text-sm ${message.color}`}>
            {message.messages.map((msg, index) => (
              <p key={index} className="flex items-center gap-2">
                <span className="text-base">{message.symbol}</span>
                <span className="font-medium">{msg}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}