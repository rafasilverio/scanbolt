'use client';

import { signIn } from "next-auth/react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import bcryptjs from 'bcryptjs';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };
  
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Register user through API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          selectedPlan
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Sign in after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (signInResult?.error) {
        setError('Failed to sign in after registration');
        return;
      }

      router.push('/dashboard');

    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Start your journey</h2>
            <p className="mt-3 text-lg text-gray-600">Choose a plan and create your account</p>
          </div>

          <RadioGroup 
            value={selectedPlan} 
            onValueChange={(value: 'free' | 'pro') => setSelectedPlan(value)}
            className="space-y-4"
          >
            <div className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all
              ${selectedPlan === 'free' ? 'border-[#5000f7] bg-[#5000f7]/5' : 'border-gray-200'}`}
            >
              <RadioGroupItem value="free" id="free" className="absolute right-4 top-4" />
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Free Plan</h3>
                <p className="text-gray-600">Perfect for getting started</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#5000f7]" />
                    <span>3 contracts per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#5000f7]" />
                    <span>Basic AI analysis</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all
              ${selectedPlan === 'pro' ? 'border-[#5000f7] bg-[#5000f7]/5' : 'border-gray-200'}`}
            >
              <RadioGroupItem value="pro" id="pro" className="absolute right-4 top-4" />
              <div className="space-y-2">
                <h3 className="font-semibold text-xl">Pro Plan</h3>
                <p className="text-gray-600">For professional users</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#5000f7]" />
                    <span>Unlimited contracts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#5000f7]" />
                    <span>Advanced AI features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#5000f7]" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </RadioGroup>

          <form onSubmit={handleEmailRegister} className="space-y-6">
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
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base bg-[#5000f7] hover:bg-[#4000d7]">
              Create Account
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 text-base"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </Button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#5000f7] hover:text-[#4000d7] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Features & Benefits */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#5000f7] to-[#4000d7] text-white p-8 flex-col justify-center">
        <div className="max-w-lg mx-auto space-y-12">
          <div>
            <h3 className="text-3xl font-bold mb-8">AI-Powered Contract Analysis</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xl font-semibold">Smart Risk Detection</h4>
                <p className="text-blue-100">Our AI analyzes contracts for potential risks and legal issues, ensuring nothing is missed.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-semibold">Time-Saving Automation</h4>
                <p className="text-blue-100">Reduce contract review time by up to 75% with automated analysis and suggestions.</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-semibold">Compliance Assurance</h4>
                <p className="text-blue-100">Stay compliant with automatic checks against legal requirements and best practices.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              <Image src="/testimonial-1.jpg" alt="" width={48} height={48} className="rounded-full border-2 border-white -mr-4" />
              <Image src="/testimonial-2.jpg" alt="" width={48} height={48} className="rounded-full border-2 border-white -mr-4" />
              <Image src="/testimonial-3.jpg" alt="" width={48} height={48} className="rounded-full border-2 border-white" />
            </div>
            <p className="text-sm">Join thousands of legal professionals using our platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
