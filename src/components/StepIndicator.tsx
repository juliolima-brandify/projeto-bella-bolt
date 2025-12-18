import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground scale-110 shadow-soft",
                  isCompleted && "bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "bg-serene-sand/40 text-secondary"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </div>
              {labels && labels[i] && (
                <span className={cn(
                  "text-xs font-body transition-colors duration-300",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {labels[i]}
                </span>
              )}
            </div>
            
            {i < totalSteps - 1 && (
              <div 
                className={cn(
                  "w-12 h-0.5 transition-colors duration-300",
                  stepNumber < currentStep ? "bg-primary" : "bg-serene-sand/40"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
