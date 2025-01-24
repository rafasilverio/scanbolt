'use client';

import { useState, useCallback } from 'react';
import { Upload, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSession } from 'next-auth/react';
import { ContractFileSchema } from '@/lib/validators/contract';
import { toast } from 'sonner';
import { ProcessingModal } from "./ProcessingModal";

export function UploadZone() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const router = useRouter();

  const handleFile = useCallback((selectedFile: File) => {
    setError(null);
    try {
      const result = ContractFileSchema.parse({ file: selectedFile });
      setFile(result.file);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid file');
      }
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const uploadContract = async (formData: FormData) => {
    try {
      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(300000), // 5 minutes timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to upload contract');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setShowProcessing(true);
      
      // Começar do 0 apenas se não houver progresso anterior
      if (progress === 0) {
        setProgress(0);
      }
      
      // Upload progress mais gradual (0-30%)
      let uploadProgress = 0;
      const uploadTimer = setInterval(() => {
        if (uploadProgress < 30) {
          uploadProgress += 0.5;
          setProgress(prev => Math.max(prev, uploadProgress));
        }
      }, 100);

      const formData = new FormData();
      formData.append('file', file);
      
      const data = await uploadContract(formData);
      clearInterval(uploadTimer);

      if (!data.success) {
        throw new Error(data.error || 'Invalid response from server');
      }

      // Novo fluxo: Se não estiver autenticado, redireciona para preview
      if (!session) {
        setProgress(100);
        toast.success('Contract analyzed! Register to see the results.');
        router.push(`/preview/${data.tempId}`);
        return;
      }

      // Garantir que estamos em pelo menos 35% antes de começar a análise
      setProgress(prev => Math.max(prev, 35));
      
      // Fluxo para usuários autenticados: aguardar análise completa
      await waitForAnalysis(data.contract.id);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setShowProcessing(false);
      setLoading(false);
    }
  };

  const waitForAnalysis = async (contractId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutos máximo (com 1s de intervalo)
    
    const checkStatus = async (): Promise<boolean> => {
      try {
        const response = await fetch(`/api/contracts/${contractId}/status`);
        const data = await response.json();
        
        if (data.status === 'under_review' && 
            Array.isArray(data.issues) && 
            data.issues.length > 0) {
          
          // Progresso final mais suave e gradual
          const finalProgress = Math.max(progress, 90);
          for (let p = finalProgress; p <= 100; p += 0.5) {
            setProgress(p);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          toast.success('Contract analyzed successfully!');
          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push(`/contracts/${contractId}`);
          return true;
        }
        
        switch (data.status) {
          case 'analyzing':
            // Progresso mais gradual durante a análise (35-90%)
            const currentProgress = progress;
            const targetProgress = Math.min(90, 35 + (attempts * 1)); // Aumenta 1% por tentativa
            
            // Garantir que o progresso nunca diminua
            if (targetProgress > currentProgress) {
              setProgress(targetProgress);
            }
            return false;
            
          case 'error':
            throw new Error('Contract analysis failed');
          default:
            return false;
        }
      } catch (error) {
        console.error('Status check error:', error);
        setError('Failed to process contract');
        setLoading(false);
        setShowProcessing(false);
        return true;
      }
    };

    while (attempts < maxAttempts) {
      const isDone = await checkStatus();
      if (isDone) break;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      setError('Analysis timeout. Please try again.');
      setLoading(false);
      setShowProcessing(false);
    }
  };

  // Update the UI based on session state
  const getUploadText = () => {
    if (!session) {
      return {
        main: "Start Your Contract Analysis",
        sub: "Sign up or login to analyze your contract"
      };
    }
    return {
      main: "Drag and drop your contract here",
      sub: "or"
    };
  };

  const uploadText = getUploadText();

  return (
    <>
      <div className="w-full">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragging ? 'border-[#2563EB] bg-blue-50/10' :
            error ? 'border-red-500 bg-red-50/10' : 
            file ? 'border-green-500 bg-green-50/10' : 
            'border-[#BFDBFE]/30 hover:border-[#2563EB] hover:bg-[#2563EB]/20'
          } transition-colors`}
        >
          {!file ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-[#BFDBFE]" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">{uploadText.main}</p>
                <p className="text-sm text-[#BFDBFE]">{uploadText.sub}</p>
                <Button
                  variant="ghost"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-sky-600 hover:bg-sky-400"
                >
                  Browse files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                />
              </div>
              <p className="text-sm text-[#BFDBFE]">
                Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <FileIcon className="h-8 w-8 text-green-500" />
                <span className="font-medium text-white">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-[#BFDBFE] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        {file && !error && (
          <div className="space-y-4">
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="bg-[#2563EB]/20" />
                <p className="text-sm text-[#BFDBFE] text-center">
                  {progress === 100 ? 'Processing contract...' : 'Uploading...'}
                </p>
              </div>
            )}
            <Button
              className="w-full bg-[#179401] hover:bg-[#07b81c] my-2 rounded-lg"
              onClick={() => handleUpload(file)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Analyze Contract Now'}
            </Button>
          </div>
        )}
      </div>
      <ProcessingModal 
        isOpen={showProcessing}
        onCancel={() => setShowProcessing(false)}
        progress={progress}
      />
    </>
  );
}
