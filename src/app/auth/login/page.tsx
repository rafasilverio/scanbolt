'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        setError('Invalid credentials');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setError('Session not established');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white order-2 lg:order-1">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image src="/logo horizontal purple big.png" alt="ScanContract" width={240} height={60} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="mt-3 text-lg text-gray-600">Sign in to your account to continue</p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 text-base"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email address</label>
              <Input
                type="email"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-[#5000f7] hover:bg-[#4000d7] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#5000f7] hover:text-[#4000d7] font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Testimonials */}
      <div className="flex w-full lg:w-1/2 bg-gradient-to-br from-[#5000f7] to-[#4000d7] text-white p-8 flex-col justify-center order-1 lg:order-2">
        <div className="max-w-lg mx-auto space-y-8">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-6">Trusted by legal professionals worldwide</h3>
            
            <div className="space-y-6">
              <blockquote className="space-y-3">
                <p className="text-base lg:text-lg">&quot;This platform has revolutionized our contract review process. We&apos;ve reduced review time by 75% while improving accuracy.&quot;</p>
                <footer className="text-sm">
                  <cite className="font-medium">Sarah Chen</cite>
                  <p>Legal Director, TechCorp Inc.</p>
                </footer>
              </blockquote>

              <blockquote className="space-y-3 hidden lg:block">
                <p className="text-base lg:text-lg">&quot;The AI-powered analysis catches issues that could easily be missed. It&apos;s like having an extra senior partner reviewing every document.&quot;</p>
                <footer className="text-sm">
                  <cite className="font-medium">Michael Rodriguez</cite>
                  <p>Managing Partner, Rodriguez & Associates</p>
                </footer>
              </blockquote>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex -space-x-4">
              <Image src="/testimonial-1.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white" />
              <Image src="/testimonial-2.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white" />
              <Image src="/testimonial-3.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white" />
              <Image src="/testimonial-4.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white hidden sm:block" />
              <Image src="/testimonial-5.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white hidden sm:block" />
              <Image src="/testimonial-6.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white hidden lg:block" />
              <Image src="/testimonial-7.jpeg" alt="" width={48} height={48} className="rounded-full border-2 border-white hidden lg:block" />
            </div>
            <p className="text-xs sm:text-sm">Join thousands of legal professionals using our platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
