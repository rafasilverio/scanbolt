'use client';

import { useState, useCallback } from 'react';
import { Upload, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSession } from 'next-auth/react';
import { ContractFileSchema } from '@/lib/validators/contract';
import { toast } from 'sonner';

export function UploadZone() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setProgress(10);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/contracts/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      setProgress(50);

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setProgress(100);

      if (data.success && data.contract) {
        toast.success('Contract uploaded successfully!');
        router.push(`/contracts/${data.contract.id}`);
      } else {
        throw new Error(data.error || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center ${
          isDragging ? 'border-[#2563EB] bg-blue-50' :
          error ? 'border-red-500 bg-red-50' : 
          file ? 'border-green-500 bg-green-50' : 
          'border-gray-300 hover:border-[#2563EB] hover:bg-blue-50'
        } transition-colors`}
      >
        {!file ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium">Drag and drop your contract here</p>
              <p className="text-sm text-gray-500">or</p>
              <Button
                variant="ghost"
                onClick={() => document.getElementById('file-upload')?.click()}
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
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <FileIcon className="h-8 w-8 text-green-500" />
              <span className="font-medium">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {file && !error && (
        <div className="space-y-4">
          {loading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-gray-500 text-center">
                {progress === 100 ? 'Processing contract...' : 'Uploading...'}
              </p>
            </div>
          )}
          <Button
            className="w-full bg-[#2563EB] hover:bg-[#1E40AF]"
            onClick={() => handleUpload(file)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Analyze Contract'}
          </Button>
        </div>
      )}
    </div>
  );
}
