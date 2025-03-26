'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProcessingModal from './upload/ProcessingModal';

interface ContractProcessingMonitorProps {
  initialStatus?: string;
}

export default function ContractProcessingMonitor({ 
  initialStatus 
}: ContractProcessingMonitorProps) {
  const params = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(100); // Já está na página do contrato, então o upload está 100%
  
  // Checar se este contrato está em processamento ao montar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const contractId = params.id as string;
      const processingId = localStorage.getItem('processingContractId');
      
      // Se o ID do contrato atual corresponde ao que está em processamento, mostra o modal
      if (contractId && processingId && contractId === processingId) {
        setShowModal(true);
      }
      
      // Se o status inicial indica que o processamento já foi concluído, não mostrar modal
      if (initialStatus === 'under_review' || initialStatus === 'approved') {
        setIsComplete(true);
      }
    }
  }, [params.id, initialStatus]);
  
  // Atualizar a página quando o modal for fechado após a conclusão
  const handleModalChange = (open: boolean) => {
    // Se o modal estava aberto e agora está fechando
    if (showModal && !open) {
      setShowModal(false);
      
      // Verificar se o processamento foi concluído
      const checkIfComplete = async () => {
        try {
          const res = await fetch(`/api/contracts/${params.id}/status`);
          const data = await res.json();
          
          if (data.isAnalysisComplete) {
            // Se a análise foi concluída, redirecionar para a página de revisão
            router.push(`/contracts/${params.id}/revision`);
          }
        } catch (error) {
          console.error('Error checking contract completion status:', error);
        }
      };
      
      checkIfComplete();
    } else {
      setShowModal(open);
    }
  };
  
  return (
    <>
      {showModal && (
        <ProcessingModal
          open={showModal}
          onOpenChange={handleModalChange}
          uploadProgress={uploadProgress}
          uploadStep="Analyzing contract..."
          contractId={params.id as string}
        />
      )}
    </>
  );
}