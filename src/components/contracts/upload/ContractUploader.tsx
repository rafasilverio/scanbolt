"use client";

import { UploadZone } from "./UploadZone";
import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContractUploader() {
  return (
    <div className="border-2 border-dashed border-[#BFDBFE]/30 rounded-xl p-12 bg-[#2563EB]/10 max-w-4xl mx-auto">
      {/* Use existing UploadZone with custom styling */}
      <div className="flex flex-col items-center gap-4">
        <UploadZone />
        
        {/* Import buttons */}
        <div className="flex gap-4 mt-4">
          <Button 
            variant="outline" 
            className="gap-2 bg-[#2563EB]/20 border-[#BFDBFE]/30 text-white hover:bg-[#2563EB]/30"
          >
            <Link className="w-4 h-4" />
            Import from Google Docs
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 bg-[#2563EB]/20 border-[#BFDBFE]/30 text-white hover:bg-[#2563EB]/30"
          >
            <Link className="w-4 h-4" />
            Import from Office 365
          </Button>
        </div>
      </div>

      {/* Features indicators */}
      <div className="flex items-center justify-center gap-8 mt-6 text-sm text-[#BFDBFE]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
          <span>Secure Upload</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
          <span>Instant Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span>No signup required</span>
        </div>
      </div>
    </div>
  );
}
