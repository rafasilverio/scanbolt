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
import { Progress } from "@/components/ui/progress";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { GoogleIcon } from "../ui/google-icon";
import { CheckIcon, Sparkles, Loader } from "lucide-react";

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
      {migrationStatus === 'analyzing' ? (
        <DialogContent className="sm:max-w-[425px]">
          <div className="relative bg-[#1e1b4b] -m-6 p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-300/80 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Magic in Progress! ✨
              </h3>
              
              <p className="text-white mb-6 text-sm leading-relaxed">
                Our AI is diving deep into your contract, uncovering insights and potential issues. Just a moment while we work our magic...
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Analyzing document structure</span>
                  <CheckIcon className="w-4 h-4 text-green-300/80" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Identifying key clauses</span>
                  <CheckIcon className="w-4 h-4 text-green-300/80" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Running legal analysis</span>
                  <Loader className="w-4 h-4 animate-spin text-blue-300/80" />
                </div>
              </div>

              <div className="bg-indigo-900/20 rounded-lg p-4 text-sm text-white mb-6">
                <p className="font-medium text-white mb-1">Did you know? 🤓</p>
                <p>Our AI reads contracts faster than a lawyer on espresso! It analyzes hundreds of legal patterns in seconds.</p>
              </div>

              <div>
                <Progress 
                  value={75} 
                  className="h-1.5 bg-white/5"
                />
                <p className="text-white/40 text-xs mt-2">Almost there...</p>
              </div>
            </div>
          </div>
        </DialogContent>
      ) : (
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
        </DialogContent>
      )}
    </Dialog>
  );
}