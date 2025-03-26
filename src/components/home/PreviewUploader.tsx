"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  FileText,
  FileUp,
  Loader2,
  RefreshCw,
  Upload,
  CheckCircle,
  Clock,
  File as FileIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone';
import { PreviewRegisterDialog } from "../auth/PreviewRegisterDialog";
import ProcessingModal from "@/components/contracts/upload/ProcessingModal";
import { ContractFileSchema } from '@/lib/validators/contract';
import { toast } from 'sonner';

export function PreviewUploader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [tempId, setTempId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [contractId, setContractId] = useState('');

  const handleFile = useCallback((selectedFile: File) => {
    setError(null);
    try {
      const result = ContractFileSchema.parse({ file: selectedFile });
      setSelectedFile(result.file);
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

  const handleUpload = async (file: File) => {
    try {
      // Validar o arquivo
      const validationResult = ContractFileSchema.safeParse({ file });
      if (!validationResult.success) {
        setError(validationResult.error.issues[0].message);
        return;
      }
      
      // Gerar um ID temporário para esta sessão de upload
      const tempId = crypto.randomUUID();
      
      // Atualizar estado e abrir modal
      setLoading(true);
      setSelectedFile(file);
      setTempId(tempId);
      setUploadProgress(0);
      setUploadStep('Preparando seu arquivo...');
      setIsProcessingModalOpen(true);
      
      // Preparar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Atualizar progresso durante o upload
      setUploadProgress(20);
      setUploadStep('Enviando arquivo...');
      
      // Fazer upload do arquivo com tempId
      const response = await fetch(`/api/preview/${tempId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar o arquivo');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
      // Arquivo foi enviado com sucesso e adicionado à fila
      setUploadProgress(100);
      setUploadStep('Arquivo enviado, aguardando processamento...');
      
      // Aguardar 5 segundos para dar tempo de iniciar o processamento
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Redirecionar para a página de preview
      router.push(`/preview/${tempId}`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Falha ao processar o arquivo. Por favor, tente novamente.');
      setLoading(false);
      setSelectedFile(null);
      setIsProcessingModalOpen(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center ${
              isDragging ? 'border-yellow-400 bg-yellow-50/50' :
              error ? 'border-red-400 bg-red-50/50' : 
              selectedFile ? 'border-green-400 bg-green-50/50' : 
              'border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/20'
            } transition-colors`}
          >
            {!selectedFile ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-yellow-50 p-5 rounded-full border border-yellow-100">
                    <Upload className="h-10 w-10 text-yellow-500" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-800 mb-3">Start Your Contract Analysis</p>
                  <p className="text-slate-600 mb-4">Drag and drop your contract here or click to browse files</p>
                  <Button
                    variant="default"
                    onClick={() => document.getElementById('preview-upload')?.click()}
                    className="bg-yellow-500 hover:bg-yellow-600 px-6 py-5 text-base"
                  >
                    Upload Contract Now!
                  </Button>
                  <input
                    id="preview-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FileIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-medium text-slate-800">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}

          {selectedFile && !error && (
            <Button
              className="w-full bg-primary hover:bg-primary/90 my-4 rounded-lg font-medium text-white py-6"
              onClick={() => handleUpload(selectedFile)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Analyze Contract Now'}
            </Button>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              By uploading, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      <ProcessingModal
        open={isProcessingModalOpen}
        onOpenChange={setIsProcessingModalOpen}
        uploadProgress={uploadProgress}
        uploadStep={uploadStep}
        contractId={contractId}
      />

      <PreviewRegisterDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        tempId={tempId}
      />
    </>
  );
}