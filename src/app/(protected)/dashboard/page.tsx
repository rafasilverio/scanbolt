'use client';

import { useContractStore } from '@/lib/store/contract-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, AlertTriangle, Lightbulb, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const contract = useContractStore(state => state.contract);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate completion percentage
  const totalIssues = contract.highlights.length;
  const resolvedIssues = contract.changes.length;
  const completionPercentage = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

  const stats = {
    critical: contract.highlights.filter(h => h.type === 'critical').length,
    warning: contract.highlights.filter(h => h.type === 'warning').length,
    improvement: contract.highlights.filter(h => h.type === 'improvement').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#5000f7] to-[#2563EB] rounded-lg p-6 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="opacity-90">You have {totalIssues} issues to review across your contracts.</p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EF4444]">{stats.critical}</div>
            <p className="text-xs text-gray-500 mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        {/* Similar cards for Warning and Improvements... */}

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Clock className="h-4 w-4 text-[#2563EB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2563EB]">{completionPercentage.toFixed(0)}%</div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>
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
            <div 
              className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg cursor-pointer hover:bg-[#BFDBFE] transition-all hover:scale-[1.01]"
              onClick={() => router.push(`/contracts/${contract.id}`)}
            >
              <div className="flex items-center space-x-4">
                <FileText className="h-6 w-6 text-[#2563EB]" />
                <div>
                  <div className="font-medium text-[#1E293B]">{contract.title}</div>
                  <div className="text-sm text-[#94A3B8] flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(contract.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {/* Placeholder for user avatars */}
                  <div className="w-8 h-8 rounded-full bg-[#BFDBFE]" />
                  <div className="w-8 h-8 rounded-full bg-[#2563EB]" />
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-[#BFDBFE] text-[#2563EB] capitalize">
                  {contract.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
