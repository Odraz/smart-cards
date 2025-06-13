import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullPage?: boolean;
  text?: string;
}

export default function LoadingSpinner({ size = 24, className, fullPage = false, text }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 z-50">
        <Loader2 className={cn("animate-spin text-primary", className)} style={{ width: size * 2, height: size * 2 }} />
        {text && <p className="mt-4 text-lg text-foreground">{text}</p>}
      </div>
    );
  }
  return <Loader2 className={cn("animate-spin text-primary", className)} style={{ width: size, height: size }} />;
}
