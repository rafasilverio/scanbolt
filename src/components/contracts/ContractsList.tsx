'use client';

import { Contract } from '@prisma/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ContractsListProps {
  contracts: Contract[];
}

export function ContractsList({ contracts }: ContractsListProps) {
  return (
    <div className="grid gap-4">
      {contracts.map((contract) => (
        <Link 
          key={contract.id} 
          href={`/contracts/${contract.id}`}
          className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg">{contract.title}</h2>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                contract.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                contract.status === 'approved' ? 'bg-green-100 text-green-800' :
                contract.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {contract.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {contract.highlights?.length || 0} issues
              </span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600 line-clamp-2">
              {contract.content}
            </p>
          </div>
        </Link>
      ))}
      {contracts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No contracts found. Upload your first contract to get started.
        </div>
      )}
    </div>
  );
}
