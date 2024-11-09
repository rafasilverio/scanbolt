"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Upload, 
  LayoutDashboard,
  Settings, 
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-emerald-500",
  },
  {
    title: "Contracts",
    icon: FileText,
    href: "/contracts",
    badge: "12",
    color: "text-blue-500",
  },
  {
    title: "Upload",
    icon: Upload,
    href: "/contracts/upload",
    color: "text-purple-500",
  },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('')
    : session?.user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className="bg-[#5000f7] border-b border-[#4000c6]">
      <div className="h-16 px-6 flex items-center">
        {/* Logo with Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-[#5000f7] font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl text-white">Scancontract</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors relative group flex items-center gap-2",
                    isActive 
                      ? "bg-white text-[#5000f7]" 
                      : "text-blue-100 hover:text-white hover:bg-[#4000c6]"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", 
                    isActive ? item.color : "text-current"
                  )} />
                  {item.title}
                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full",
                        typeof item.badge === "string" && item.badge.toLowerCase() === "new"
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-[#5000f7]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md border-2 border-white"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Push actions to the right */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-[#4000c6] text-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="gap-2 hover:bg-[#4000c6]"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {session.user.name || session.user.email}
                      </span>
                      <ChevronDown className="h-4 w-4 text-blue-100" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-[#4000c6]">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
