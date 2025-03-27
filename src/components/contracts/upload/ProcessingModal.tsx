"use client";

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { getQueueStatus } from '@/lib/queue.common.client';
import { Progress } from '@/components/ui/progress';
import { useRouter, usePathname } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();
  const [queueStatus, setQueueStatus] = useState<{
    length: number;
    oldestJob: number | null;
    newestJob: number | null;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [consecutiveCompletionChecks, setConsecutiveCompletionChecks] = useState(0);
  const [storedContractId, setStoredContractId] = useState<string | null>(null);

  const steps = [
    "Scanning document",
    "Identifying key clauses",
    "Analyzing terms",
    "Checking for risks",
    "Generating insights"
  ];

  // Verificar se tem um contrato em processamento armazenado no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedContractId = localStorage.getItem("processingContractId");
      
      // Se temos um contractId da prop e o modal está aberto, salvamos no localStorage
      if (contractId && open) {
        localStorage.setItem("processingContractId", contractId);
      } 
      // Se não temos contractId da prop mas temos um armazenado, usamos ele e mantemos o modal aberto
      else if (!contractId && storedContractId && !isComplete) {
        onOpenChange(true);
      }
    }
  }, [contractId, open, onOpenChange, isComplete]);

  // Verificar status da fila e do contrato a cada 3 segundos
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const checkQueueStatus = async () => {
      try {
        const status = await getQueueStatus();
        setQueueStatus(status);
      } catch (error) {
        console.error('Error checking queue status:', error);
      }
    };

    const checkContractStatus = async () => {
      // Usar o contractId da prop ou do localStorage
      const idToCheck = contractId || (typeof window !== "undefined" ? 
        localStorage.getItem("processingContractId") : null);

      if (idToCheck) {
        try {
          const res = await fetch(`/api/contracts/${idToCheck}/status`);
          if (!res.ok) {
            throw new Error('Error checking status');
          }
          
          const data = await res.json();
          
          // Considerar análise completa quando o status for under_review ou approved
          // E quando houver issues (garantindo que a análise foi realmente concluída)
          const analysisComplete = 
            (data.status === 'under_review' || data.status === 'approved') && 
            data.isAnalysisComplete;
            
          // Se a análise estiver completa, incrementamos o contador de verificações consecutivas
          if (analysisComplete) {
            setConsecutiveCompletionChecks(prev => prev + 1);
          } else {
            setConsecutiveCompletionChecks(0);
          }
          
          // Somente concluímos após 3 verificações consecutivas bem-sucedidas
          // Isso evita que o modal seja fechado prematuramente
          if (consecutiveCompletionChecks >= 3) {
            setIsComplete(true);
            if (typeof window !== "undefined") {
              localStorage.removeItem("processingContractId");
            }
            
            // Força um refresh antes de fechar o modal
            router.refresh();
            
            setTimeout(() => {
              onOpenChange(false);
              
              // Força um segundo refresh para garantir que a página atualize com os novos dados
              setTimeout(() => {
                router.refresh();
              }, 500);
            }, 1500); // Delay adicional para garantir que a página esteja totalmente carregada
          }
        } catch (error) {
          console.error('Error checking contract status:', error);
          setConsecutiveCompletionChecks(0);
        }
      }
    };
    
    if (open) {
      // Verificar imediatamente
      checkQueueStatus();
      checkContractStatus();
      
      // Configurar intervalo para verificações periódicas
      intervalId = setInterval(() => {
        checkQueueStatus();
        checkContractStatus();
      }, 3000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [open, contractId, pathname, router, onOpenChange, consecutiveCompletionChecks]);

  // Atualizar o passo atual com base no progresso
  useEffect(() => {
    // Define o step com base no progresso
    if (uploadProgress < 20) {
      setCurrentStep(0);
    } else if (uploadProgress < 100) {
      setCurrentStep(1);
    } else if (queueStatus && queueStatus.length > 0) {
      setCurrentStep(2);
    } else {
      // Incrementa os passos gradualmente durante a análise
      const timer = setTimeout(() => {
        if (currentStep < 4) {
          setCurrentStep(prevStep => prevStep + 1);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadProgress, queueStatus, currentStep]);

  // Inicializar o storedContractId quando o componente montar no cliente
  useEffect(() => {
    setStoredContractId(localStorage.getItem("processingContractId"));
  }, []);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Impedir que o usuário feche o modal enquanto o processamento não estiver completo
        if (isComplete || !newOpen) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-xl p-0 border-none bg-transparent shadow-none">
        <DialogClose className="hidden" />
        <div className="bg-gradient-to-b from-indigo-950 to-indigo-900 text-white rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Analyzing Your Contract</h2>
              <p className="text-white/60">This will take just a moment</p>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${isComplete ? 100 : uploadProgress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              {steps.map((step, index) => (
                <div 
                  key={step}
                  className={`flex items-center transition-all duration-300 ${
                    index > currentStep ? 'text-white/40' : 'text-white'
                  }`}
                >
                  {index < currentStep || isComplete ? (
                    <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                  ) : index === currentStep ? (
                    <Clock className="w-5 h-5 mr-3 text-blue-400 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 mr-3" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Exibir informações da fila se estiver na fila */}
            {uploadProgress === 100 && queueStatus && queueStatus.length > 0 && (
              <div className="bg-indigo-800/50 p-3 rounded-md mb-6 text-left border border-indigo-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    Your contract is in queue
                  </span>
                </div>
                
                <p className="text-xs text-white/60">
                  There are {queueStatus.length} contracts ahead. 
                  Estimated time: {Math.ceil(queueStatus.length * 30 / 60)} minutes
                </p>
              </div>
            )}

            {/* Status de conclusão */}
            {isComplete && (
              <div className="bg-green-900/30 p-3 rounded-md mb-6 text-left border border-green-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-white">
                    Analysis completed successfully!
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Redirecting to results...
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{isComplete ? 100 : Math.min(uploadProgress, 100)}%</div>
                  <div className="text-sm text-white/60">Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{isComplete ? 0 : Math.ceil((100 - uploadProgress) / 20) || 1}</div>
                  <div className="text-sm text-white/60">Seconds Left</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{isComplete ? 5 : currentStep + 1}/5</div>
                  <div className="text-sm text-white/60">Steps</div>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  Bank-Level Security
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  AI-Powered Analysis
                </div>
              </div>
            </div>
            
            {/* Rodapé com ID do contrato */}
            {(contractId || storedContractId) && (
              <div className="mt-6 pt-3 text-center">
                <p className="text-xs text-white/40">
                  Contract ID: {contractId || storedContractId}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
