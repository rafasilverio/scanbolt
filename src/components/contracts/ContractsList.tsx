'use client';

import { Contract } from '@prisma/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FileText, AlertCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContractsListProps {
  contracts: Contract[];
}

export function ContractsList({ contracts }: ContractsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contracts.map((contract) => (
        <Link 
          key={contract.id} 
          href={`/contracts/${contract.id}`}
          className="group transition-transform hover:-translate-y-1 duration-200"
        >
          <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden border-2 hover:border-primary/20">
            <CardHeader className="space-y-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold line-clamp-1">{contract.title}</h3>
                </div>
                <Badge 
                  variant="secondary"
                  className={getStatusColor(contract.status)}
                >
                  {contract.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {contract.content}
              </p>
            </CardContent>

            <CardFooter className="border-t bg-muted/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3" />
                <span>
                  {contract.highlights ? 
                    `${JSON.parse(contract.highlights).length} issues found` : 
                    'No issues found'}
                </span>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}

      {contracts.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No contracts found</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first contract to get started with the analysis.
          </p>
        </div>
      )}
    </div>
  );
}
