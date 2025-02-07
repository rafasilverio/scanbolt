"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { GoogleIcon } from "../ui/google-icon";
import { Progress } from "@/components/ui/progress";

interface PreviewRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempId: string;
}

type AuthMode = 'login' | 'register';

export function PreviewRegisterDialog({
  open,
  onOpenChange,
  tempId,
}: PreviewRegisterDialogProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'analyzing' | 'completed'>('idle');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: `/api/preview/migrate?tempId=${tempId}` });
  };

  // Função para verificar o status do contrato
  const checkContractStatus = async (contractId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/status`);
      const data = await response.json();
      
      // Usar o isAnalysisComplete que já existe na rota
      return data.isAnalysisComplete === true;
      
    } catch (error) {
      console.error('Error checking contract status:', error);
      return false;
    }
  };

  const handleMigration = async () => {
    try {
      setMigrationStatus('migrating');
      
      const response = await fetch('/api/preview/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempId })
      });

      if (!response.ok) throw new Error('Migration failed');
      
      const { contractId } = await response.json();
      
      // Aguardar o processamento do contrato
      setMigrationStatus('analyzing');
      
      // Polling para verificar o status do contrato
      const maxAttempts = 30; // 30 segundos
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        const isComplete = await checkContractStatus(contractId);
        
        if (isComplete) {
          setMigrationStatus('completed');
          router.push(`/contracts/${contractId}`);
          return;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      }
      
      // Se chegou aqui, timeout
      throw new Error('Contract processing timeout');
      
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to process contract');
    } finally {
      if (migrationStatus !== 'completed') {
        setMigrationStatus('idle');
      }
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        // Register new user
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            selectedPlan: 'free'
          })
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          throw new Error(registerData.error || 'Registration failed');
        }
      }

      // Sign in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Invalid credentials');
      }

      // Migrate preview data if registration was successful
      await handleMigration();

    } catch (error) {
      console.log('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {authMode === 'register' ? 'Create your account' : 'Welcome back'}
          </DialogTitle>
          <DialogDescription>
            {authMode === 'register' 
              ? 'Get instant access to your contract analysis and start protecting your legal interests.'
              : 'Sign in to access your contract analysis.'}
          </DialogDescription>
        </DialogHeader>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-12 flex items-center justify-center gap-3 text-base"
          disabled={isLoading}
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full text-white" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {authMode === 'register' ? 'Create Account & View Analysis' : 'Sign in & View Analysis'}
          </Button>
        </form>

        <p className="text-center text-sm">
          {authMode === 'register' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setAuthMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-primary hover:underline font-medium"
              >
                Create one
              </button>
            </>
          )}
        </p>

        {migrationStatus === 'analyzing' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Analyzing Your Contract
                </h3>
                <p className="text-gray-600 mb-4">
                  Please wait while our AI analyzes your contract. This may take a few seconds...
                </p>
                <div className="flex justify-center">
                  <Icons.spinner className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}