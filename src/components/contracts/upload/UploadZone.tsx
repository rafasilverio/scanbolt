'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProcessingModal from './ProcessingModal';
import { useRouter } from 'next/navigation';

export function UploadZone() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [contractId, setContractId] = useState<string>('');
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setShowProcessingModal(true);
    setUploadProgress(0);
    setUploadStep('Preparando arquivo...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process contract');
      }

      const data = await response.json();

      if (data?.contract?.id) {
        setContractId(data.contract.id);
        setUploadProgress(100);
        setUploadStep('Arquivo enviado com sucesso! Redirecionando...');
        
        // Adicionar atraso de 3 segundos antes de redirecionar
        // Isso dará tempo para o usuário ver o modal de processamento
        setTimeout(() => {
          router.push(`/contracts/${data.contract.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível fazer o upload do arquivo. Tente novamente.',
        variant: 'destructive',
      });
      setShowProcessingModal(false);
    } finally {
      setIsUploading(false);
      // Não resetamos o progresso nem fechamos o modal aqui,
      // ele continuará visível durante o redirecionamento
    }
  }, [toast, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-gray-500">{uploadStep}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Solte o arquivo aqui...'
                  : 'Arraste e solte um arquivo PDF aqui, ou clique para selecionar'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Apenas arquivos PDF são aceitos
              </p>
            </div>
          </div>
        )}
      </div>

      <ProcessingModal
        open={showProcessingModal}
        onOpenChange={setShowProcessingModal}
        uploadProgress={uploadProgress}
        uploadStep={uploadStep}
        contractId={contractId}
      />
    </div>
  );
}
