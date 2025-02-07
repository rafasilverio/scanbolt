"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, File as FileIcon, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcessingModal } from "../contracts/upload/ProcessingModal";
import { PreviewRegisterDialog } from "../auth/PreviewRegisterDialog";
import { ContractFileSchema } from '@/lib/validators/contract';
import { toast } from 'sonner';

export function PreviewUploader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [tempId, setTempId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Progresso inicial mais suave
      for (const step of [5, 10, 15]) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const formData = new FormData();
      formData.append("file", file);
      
      const tempId = crypto.randomUUID();
      setTempId(tempId);
      
      // Progresso durante o upload
      setProgress(20);
      
      const response = await fetch(`/api/preview/${tempId}`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      // Progresso após upload bem sucedido
      setProgress(40);
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Simulação de análise com progresso mais suave
      const analysisSteps = [45, 50, 60, 70, 80, 90, 95, 100];
      for (const step of analysisSteps) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Manter o modal por um momento após 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirecionar mantendo o modal aberto
      await router.push(`/preview/${tempId}`);
      // Fechar o modal apenas após a navegação estar completa
      setIsUploading(false);
      setFile(null);

    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast.error('Failed to upload contract', {
        description: errorMessage
      });
      setIsUploading(false);
      setFile(null);
    }
  };

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
                <p className="text-lg font-medium text-white">Start Your Contract Analysis</p>
                <p className="text-sm text-[#BFDBFE]">Drag and drop your contract here or</p>
                <Button
                  variant="ghost"
                  onClick={() => document.getElementById('preview-upload')?.click()}
                  className="bg-sky-600 hover:bg-sky-400"
                >
                  Browse files
                </Button>
                <input
                  id="preview-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  disabled={isUploading}
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
          <Button
            className="w-full bg-[#179401] hover:bg-[#07b81c] my-2 rounded-lg"
            onClick={() => handleUpload(file)}
            disabled={isUploading}
          >
            {isUploading ? 'Processing...' : 'Analyze Contract Now'}
          </Button>
        )}
      </div>

      <ProcessingModal
        isOpen={isUploading}
        onCancel={() => setIsUploading(false)}
        progress={progress}
      />

      <PreviewRegisterDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        tempId={tempId}
      />
    </>
  );
}