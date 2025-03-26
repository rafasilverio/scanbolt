"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Upload, FileText, LayoutDashboard } from "lucide-react";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Contracts',
    href: '/contracts',
    icon: FileText
  },
  {
    title: 'Upload',
    href: '/contracts/upload',
    icon: Upload
  }
];

export function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="bg-[#5000f7] text-white border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link href="/dashboard" className="flex items-center mr-8">
            <img 
              src="/logo horizontal white big.png" 
              alt="Scancontract Logo" 
              className="h-8"
            />
          </Link>

          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <User className="w-4 h-4" />
              {session?.user?.email}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 