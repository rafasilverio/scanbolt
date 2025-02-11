"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";

export function ContractUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('Uploading file...');
  const router = useRouter();

  const uploadContract = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress('Uploading file...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success && data.contract?.id) {
        await waitForAnalysis(data.contract.id);
      } else {
        throw new Error(data.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload contract');
      setUploading(false);
    }
  };

  const waitForAnalysis = async (contractId: string) => {
    let attempts = 0;
    const maxAttempts = 150; // 5 minutos (com 2s de intervalo)
    
    const checkStatus = async (): Promise<boolean> => {
      try {
        const response = await fetch(`/api/contracts/${contractId}/status`);
        const data = await response.json();
        
        switch (data.status) {
          case 'analyzing':
            setProgress(`Analyzing contract... (${Math.round((attempts/150) * 100)}%)`);
            return false;
          case 'under_review':
            setProgress('Analysis complete!');
            router.push(`/contracts/${contractId}`);
            return true;
          case 'error':
            throw new Error(data.error || 'Contract analysis failed');
          default:
            return false;
        }
      } catch (error) {
        console.error('Status check error:', error);
        setError(error instanceof Error ? error.message : 'Failed to process contract');
        setUploading(false);
        return true;
      }
    };

    while (attempts < maxAttempts) {
      const isDone = await checkStatus();
      if (isDone) break;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      setError('Analysis is taking longer than expected. You can check the status later.');
      router.push(`/contracts/${contractId}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadContract(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white/5">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-3" />
          <p className="mb-2 text-sm">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">PDF (MAX. 10MB)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      
      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{progress}</span>
          </div>
          <Progress value={100} className="animate-pulse" />
        </div>
      )}
      
      {error && (
        <div className="mt-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
