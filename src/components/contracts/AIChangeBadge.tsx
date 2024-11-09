import { 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';

interface AIChangeBadgeProps {
  accepted: number;
  pending: number;
  rejected: number;
}

export function AIChangeBadge({ accepted, pending, rejected }: AIChangeBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="text-green-700">{accepted}</span>
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-yellow-500" />
        <span className="text-yellow-700">{pending}</span>
      </span>
      <span className="flex items-center gap-1">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="text-red-700">{rejected}</span>
      </span>
    </div>
  );
}
