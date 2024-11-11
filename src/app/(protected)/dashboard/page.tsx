'use client';

import { useContractStore } from '@/lib/store/contract-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#5000f7] to-[#2563EB] rounded-lg p-6 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="opacity-90">Upload a new contract or continue working on your recent documents.</p>
      </div>

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
        <Button 
          onClick={() => router.push('/contracts/upload')}
          className="bg-[#2563EB] hover:bg-[#1E40AF] gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Contract
        </Button>
      </div>

      {/* Quick Upload Zone */}
      <Card className="border-2 border-dashed hover:border-[#2563EB] transition-colors cursor-pointer"
            onClick={() => router.push('/contracts/upload')}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-12 w-12 text-[#64748B] mb-4" />
          <h2 className="text-lg font-semibold text-[#1E293B] mb-2">
            Upload New Contract
          </h2>
          <p className="text-[#64748B] mb-4">
            Drag and drop your contract here or click to browse
          </p>
          <Button className="bg-[#2563EB] hover:bg-[#1E40AF]">
            Choose File
          </Button>
        </CardContent>
      </Card>

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
