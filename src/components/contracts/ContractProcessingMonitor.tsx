'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ContractProcessingMonitorProps {
  contractId: string;
  initialStatus: string;
  onComplete?: () => void;
}

export function ContractProcessingMonitor({
  contractId,
  initialStatus,
  onComplete
}: ContractProcessingMonitorProps) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(initialStatus === 'UNDER_REVIEW' ? 100 : 35);
  const [isComplete, setIsComplete] = useState(initialStatus === 'UNDER_REVIEW');

  useEffect(() => {
    if (isComplete) return;

    // Simular progresso visual enquanto aguarda
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Limitar o progresso máximo a 95% até que a análise seja concluída
        if (prev < 95) {
          return prev + 0.2;
        }
        return prev;
      });
    }, 300);

    // Verificar o status do contrato periodicamente
    const statusInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}/status`);
        const data = await response.json();
        
        setStatus(data.status);
        
        if (data.status === 'UNDER_REVIEW') {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          setProgress(100);
          setIsComplete(true);
          toast.success('Contract analysis complete!');
          if (onComplete) onComplete();
        } else if (data.status === 'ERROR') {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          toast.error('Error analyzing contract. Please try again.');
        }
      } catch (error) {
        console.error('Error checking contract status:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [contractId, isComplete, onComplete]);

  if (isComplete) return null;

  return (
    <div className="w-full p-4 bg-blue-900/20 rounded-lg mb-6">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-white font-medium">Analyzing your contract</h3>
        <span className="text-sm text-blue-300">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2 mb-2" />
      <p className="text-sm text-blue-300">
        {status === 'UPLOADING' && 'Uploading your contract...'}
        {status === 'PROCESSING' && 'Processing your contract...'}
        {status === 'ANALYZING' && 'AI is analyzing your contract...'}
        {status === 'ERROR' && 'Error analyzing your contract. Please try again.'}
      </p>
    </div>
  );
}