'use client';

import { useContractStore } from '@/lib/store/contract-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { UploadZone } from '@/components/contracts/upload/UploadZone';
import  prisma  from '@/lib/prisma';

interface Contract {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);

  useEffect(() => {
    const fetchRecentContracts = async () => {
      try {
        const response = await fetch('/api/contracts/recent');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (Array.isArray(data.contracts)) {
          setRecentContracts(data.contracts);
        } else {
          console.error('Invalid contracts data:', data);
        }
      } catch (error) {
        console.error('Error fetching recent contracts:', error);
      }
    };

    fetchRecentContracts();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section - Modern SaaS Style */}
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-900 rounded-2xl p-8 text-white mb-8 border border-white/10 shadow-xl relative overflow-hidden">
        {/* Gradient Orb Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center mb-6">
            <img 
              src="/logo icon white big.png" 
              alt="Scancontract Logo" 
              className="h-12 mr-4" 
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Free AI Contract Analysis
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Transform Your Legal Documents with AI
          </h1>
          
          <p className="text-lg text-white/80 mb-6 leading-relaxed">
            Get instant AI-powered insights on your contracts. Identify risks, 
            optimize clauses, and ensure your agreements are secure - all for free.
          </p>
          
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                ⚡️
              </div>
              <span className="text-white/70">Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                🔒
              </div>
              <span className="text-white/70">Risk Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                ✨
              </div>
              <span className="text-white/70">Smart Suggestions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nova seção de Upload usando UploadZone */}
      <UploadZone />

      
      {/* Search and Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search contracts..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Contracts</CardTitle>
            <Button variant="ghost" onClick={() => router.push('/contracts')}>
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContracts.length > 0 ? (
              recentContracts.map((contract) => (
                <div 
                  key={contract.id}
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg cursor-pointer hover:bg-[#BFDBFE] transition-all hover:scale-[1.01]"
                  onClick={() => router.push(`/contracts/${contract.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-6 w-6 text-[#2563EB]" />
                    <div>
                      <div className="font-medium text-[#1E293B]">
                        {contract.title || 'Untitled Contract'}
                      </div>
                      <div className="text-sm text-[#94A3B8] flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(contract.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-[#BFDBFE]" />
                      <div className="w-8 h-8 rounded-full bg-[#2563EB]" />
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-[#BFDBFE] text-[#2563EB] capitalize">
                      {contract.status?.replace('_', ' ') || 'Draft'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#64748B]">
                No recent contracts found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
