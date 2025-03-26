"use client";

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getQueueStatus } from '@/lib/queue';
import { Progress } from '@/components/ui/progress';

interface ProcessingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadProgress: number;
  uploadStep: string;
  contractId?: string;
}

export default function ProcessingModal({
  open,
  onOpenChange,
  uploadProgress,
  uploadStep,
  contractId
}: ProcessingModalProps) {
  const [queueStatus, setQueueStatus] = useState<{
    length: number;
    oldestJob: number | null;
    newestJob: number | null;
  } | null>(null);

  // Verificar status da fila a cada 5 segundos quando o modal estiver aberto
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const checkQueueStatus = async () => {
      try {
        const status = await getQueueStatus();
        setQueueStatus(status);
      } catch (error) {
        console.error('Erro ao verificar status da fila:', error);
      }
    };
    
    if (open) {
      // Verificar imediatamente
      checkQueueStatus();
      
      // Configurar intervalo para verificações periódicas
      intervalId = setInterval(checkQueueStatus, 5000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [open]);

  // Determinar o passo atual do processamento
  const getCurrentStep = () => {
    if (uploadProgress < 100) {
      return uploadStep || 'Preparando arquivo...';
    }
    
    if (queueStatus && queueStatus.length > 0) {
      return 'Na fila para processamento...';
    }
    
    return 'Analisando contrato...';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-4">
          <h3 className="text-lg font-medium mb-2">
            Processando seu contrato
          </h3>
          
          <Progress 
            value={uploadProgress} 
            className="h-2 mb-4" 
          />
          
          <p className="text-sm text-gray-500 mb-4">
            {getCurrentStep()}
          </p>
          
          {/* Exibir informações da fila se estiver na fila */}
          {uploadProgress === 100 && queueStatus && queueStatus.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-md mt-2 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">
                  Seu contrato está na fila
                </span>
              </div>
              
              <p className="text-xs text-gray-600">
                Existem {queueStatus.length} contratos na frente. 
                Tempo estimado: {Math.ceil(queueStatus.length * 30 / 60)} minutos
              </p>
            </div>
          )}
          
          {/* Rodapé com ID do contrato */}
          {contractId && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                ID do contrato: {contractId}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
