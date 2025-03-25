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
      // Smoother initial progress steps
      for (let step = 1; step <= 15; step += 2) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const formData = new FormData();
      formData.append("file", file);
      
      const tempId = crypto.randomUUID();
      setTempId(tempId);
      
      // Upload progress
      for (let step = 16; step <= 25; step += 1) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const response = await fetch(`/api/preview/${tempId}`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      // Post-upload progress
      for (let step = 26; step <= 40; step += 1) {
        setProgress(step);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Analysis simulation with smoother progression
      for (let step = 41; step <= 99; step += 1) {
        setProgress(step);
        // Gradually slow down the increment to simulate intensive processing
        const delay = 50 + Math.floor((step - 40) / 10) * 20;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Complete
      setProgress(100);
      // Pause briefly at 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect while keeping modal open
      await router.push(`/preview/${tempId}`);
      // Close modal only after navigation is complete
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
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center ${
              isDragging ? 'border-yellow-400 bg-yellow-50/50' :
              error ? 'border-red-400 bg-red-50/50' : 
              file ? 'border-green-400 bg-green-50/50' : 
              'border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/20'
            } transition-colors`}
          >
            {!file ? (
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
                    className="bg-primary hover:bg-primary/90 px-6 py-5 text-base"
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
                <p className="text-sm text-slate-500 mt-4">
                  Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FileIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-medium text-slate-800">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
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

          {file && !error && (
            <Button
              className="w-full bg-primary hover:bg-primary/90 my-4 rounded-lg font-medium text-white py-6"
              onClick={() => handleUpload(file)}
              disabled={isUploading}
            >
              {isUploading ? 'Processing...' : 'Analyze Contract Now'}
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