"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Plus } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: "All Contracts",
      href: "/contracts",
      icon: FileText,
    },
    {
      title: "View Demo",
      href: "/contracts/1",
      icon: FileText,
    },
  ];

  return (
    <div className="border-b bg-muted/50">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center space-x-4 flex-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Button asChild>
            <Link href="/contracts/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload Contract
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
