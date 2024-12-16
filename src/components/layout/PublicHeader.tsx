"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function PublicHeader() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">
              Scancontract
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-sm text-white/80 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-white/80 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-white/80 hover:text-white transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 