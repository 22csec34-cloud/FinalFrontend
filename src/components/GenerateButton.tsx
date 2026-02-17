import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

const GenerateButton = ({ onClick, isGenerating, disabled }: GenerateButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isGenerating}
      variant="luxury"
      size="xl"
      className={cn(
        "w-full relative overflow-hidden",
        isGenerating && "cursor-wait"
      )}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating Your Outfit...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>Generate Virtual Try-On</span>
        </>
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/10 to-transparent animate-shimmer" 
          style={{ backgroundSize: '200% 100%' }} 
        />
      )}
    </Button>
  );
};

export default GenerateButton;
