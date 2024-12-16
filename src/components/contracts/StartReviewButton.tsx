import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface StartReviewButtonProps {
  onClick: () => void;
}

export function StartReviewButton({ onClick }: StartReviewButtonProps) {
  return (
    <div className="flex justify-center my-6">
      <Button 
        size="lg"
        className="bg-[#5000f7] hover:bg-[#5000f7]/90 text-white px-8 py-6 text-lg font-medium"
        onClick={onClick}
      >
        <Play className="w-5 h-5 mr-2" />
        Start Review
      </Button>
    </div>
  );
}