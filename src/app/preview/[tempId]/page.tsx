"use client";

import { useState, useEffect } from 'react';
import { Contract, ContractIssue } from '@/types/contract';
import { useRouter } from 'next/navigation';
import { DocumentWrapper } from '@/components/contracts/DocumentWrapper';
import { NewContractContent } from '@/components/contracts/NewContractContent';
import { AlertCircle, FileText, CheckCircle, Clock, RefreshCw, Loader2, Eye } from 'lucide-react';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';
import { PreviewRegisterDialog } from '@/components/auth/PreviewRegisterDialog';
import { BlurredPreview } from '@/components/preview/BlurredPreview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

// Function to count the number of issues in the contract
function countIssues(issues: any): number {
  if (!issues) return 0;
  if (Array.isArray(issues)) return issues.length;
  return 0;
}

// Interface for the contract
interface RawContract {
  id: string;
  title: string;
  content: string;
  status: string;
  issues: any;
}

export default function PreviewPage({ params }: { params: { tempId: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<RawContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  useEffect(() => {
    async function fetchContractDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/preview/details?tempId=${params.tempId}`);
        
        if (!response.ok) {
          // If contract not found, redirect to home
          if (response.status === 404) {
            router.push('/');
            return;
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.found && data.contract) {
          setContract(data.contract);
        } else if (data.found && data.inPreviewCache) {
          // Contract still in cache, not processed yet
          setContract({
            id: params.tempId,
            title: data.previewData?.fileName || 'New Contract',
            content: 'Contract content is being processed...',
            status: 'processing',
            issues: []
          });
        } else {
          throw new Error('Contract not found');
        }
      } catch (e) {
        console.error('Error fetching contract details:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchContractDetails();
  }, [params.tempId, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-indigo-950 to-indigo-900 text-white rounded-xl overflow-hidden shadow-xl p-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">Loading your contract</h1>
            <p className="text-white/60 mb-6">Please REGISTER to see full analysis while we fetch your data...</p>
            <Progress value={95} className="h-2 bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-red-900 to-red-800 text-white rounded-xl overflow-hidden shadow-xl p-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">Error loading contract</h1>
            <p className="text-white/80 mb-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If no contract, something went wrong
  if (!contract) {
    router.push('/');
    return null;
  }

  // Main layout for any contract status
  return (
    <div className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-6xl">
        {/* Header with back button */}
        <div className="flex flex-col mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* File info */}
        <div className="flex items-center mb-6">
          <div className="text-gray-600 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-400" />
            <span className="blur-sm">Contract-{contract.id.substring(0, 8)}.pdf • application/pdf • 2 pages</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content area with blur effect */}
          <div className="flex-grow bg-white rounded-xl shadow-md overflow-hidden relative">
            {/* Document content with blur */}
            <div className="p-8 blur-sm select-none pointer-events-none">
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold uppercase">CONTRACT DOCUMENT</h1>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold mb-2">LESSOR (PROPERTY OWNER):</h2>
                  <p className="mb-1">- Name: ___________________________________________________________</p>
                  <p className="mb-1">- Nationality: ____________________________________________________</p>
                  <p className="mb-1">- Civil Status: ___________________________________________________</p>
                  <p className="mb-1">- Profession: ____________________________________________________</p>
                  <p className="mb-1">- ID Number: ____________________________________________________</p>
                  <p className="mb-1">- Address: ______________________________________________________</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-bold mb-2">LESSEE:</h2>
                  <p className="mb-1">- Name: ___________________________________________________________</p>
                  <p className="mb-1">- Nationality: ____________________________________________________</p>
                  <p className="mb-1">- Civil Status: ___________________________________________________</p>
                  <p className="mb-1">- Profession: ____________________________________________________</p>
                  <p className="mb-1">- ID Number: ____________________________________________________</p>
                  <p className="mb-1">- Address: ______________________________________________________</p>
                </div>
              </div>
            </div>
            
            {/* Absolute positioned overlay with analyzing box */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
              <div className="bg-gradient-to-b from-indigo-950 to-indigo-900 text-white rounded-xl overflow-hidden shadow-xl p-8 max-w-md w-full">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Analyzing Your Contract</h2>
                  <p className="text-white/60 mb-6">Your contract is being processed. Please wait...</p>
                  
                  <div className="relative w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-3/5 animate-pulse"></div>
                  </div>
                  
                  <div className="mb-6">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => setShowRegisterDialog(true)}
                    >
                      Register & View Complete Analysis
                    </Button>
                  </div>
                  
                  <p className="text-xs text-white/40">
                    Temporary ID: {params.tempId}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar with blurred issue counts */}
          <div className="md:w-80 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-4 text-center blur-sm">
                <div className="text-3xl font-bold text-red-600 mb-1">5</div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center blur-sm">
                <div className="text-3xl font-bold text-blue-600 mb-1">3</div>
                <div className="text-sm text-gray-600">New Clauses</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 blur-sm">
              <h3 className="font-medium flex items-center mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                Critical Issues
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">3</span>
              </h3>
              
              <h3 className="font-medium flex items-center mb-4">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                Warnings
                <span className="ml-auto bg-indigo-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">1</span>
              </h3>
              
              <h3 className="font-medium flex items-center">
                <AlertCircle className="w-4 h-4 text-green-500 mr-2" />
                Improvements
                <span className="ml-auto bg-gray-200 text-gray-800 text-xs rounded-full w-6 h-6 flex items-center justify-center">1</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <PreviewRegisterDialog
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        tempId={params.tempId}
      />
    </div>
  );
}