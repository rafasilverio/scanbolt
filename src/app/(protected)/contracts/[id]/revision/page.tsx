"use client";

import { useEffect, useState } from 'react';
import { ContractRevision } from '@/components/contracts/ContractRevision';
import { Contract } from '@/types/contract';
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";

export default function RevisionPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch contract');
        const data = await response.json();
        setContract(data);
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white">
        {/* PDF Area Loading */}
        <div className="flex-1 p-4 space-y-4">
          {/* File Info Skeleton */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 animate-pulse">
            <FileText className="w-4 h-4 text-gray-300" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-gray-200" />
            </div>
          </div>
          
          {/* PDF Viewer Skeleton */}
          <div className="h-[calc(100vh-8rem)] bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <Skeleton className="w-16 h-16 rounded-full bg-gray-200 mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 bg-gray-200 mx-auto" />
                <Skeleton className="h-4 w-32 bg-gray-200 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Loading */}
        <div className="w-96 border-l border-gray-100 p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-lg bg-red-50" />
            <Skeleton className="h-24 rounded-lg bg-red-50" />
          </div>

          {/* Issues Summary Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-50/50 rounded">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50/50 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50/50 rounded">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-200" />
                <Skeleton className="h-4 w-24 bg-gray-200" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full bg-gray-200" />
            </div>
          </div>

          {/* Issues List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-gray-200" />
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-gray-100" />
                  <Skeleton className="h-3 w-5/6 bg-gray-100" />
                  <Skeleton className="h-3 w-4/6 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="h-screen">
      <ContractRevision contract={contract} />
    </div>
  );
}