import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import logoMonogram from "@/assets/logo-monogram.png";

interface LoadingStateProps {
  message?: string;
}

interface ProcessStep {
  label: string;
  duration: number;
  motivationalMessage: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    label: "Preparando seus dados",
    duration: 3000,
    motivationalMessage: "Cada mudança começa com um primeiro passo...",
  },
  {
    label: "Gerando sua transformação",
    duration: 15000,
    motivationalMessage: "Visualizar seus objetivos é o caminho para alcançá-los",
  },
  {
    label: "Finalizando seu relatório",
    duration: 2000,
    motivationalMessage: "Sua jornada de transformação está prestes a começar!",
  },
];

export function LoadingState({ message }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Update step progression
    let stepTimeout: number;
    let progressInterval: number;

    const startStep = (stepIndex: number) => {
      if (stepIndex >= PROCESS_STEPS.length) {
        return;
      }

      setCurrentStep(stepIndex);
      setProgress(0);

      const step = PROCESS_STEPS[stepIndex];
      const progressIncrement = 100 / (step.duration / 100);

      // Smooth progress bar
      progressInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return Math.min(prev + progressIncrement, 100);
        });
      }, 100);

      // Move to next step
      stepTimeout = window.setTimeout(() => {
        clearInterval(progressInterval);
        startStep(stepIndex + 1);
      }, step.duration);
    };

    startStep(0);

    return () => {
      clearTimeout(stepTimeout);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStepData = PROCESS_STEPS[currentStep] || PROCESS_STEPS[PROCESS_STEPS.length - 1];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      {/* Logo with pulse animation */}
      <div className="w-32 h-32 mb-8 animate-pulse flex items-center justify-center">
        <img
          src={logoMonogram}
          alt="Bella"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Main message */}
      <p className="font-heading text-xl text-primary text-center mb-2">
        {message || currentStepData.label}
      </p>

      {/* Motivational message */}
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-8">
        {currentStepData.motivationalMessage}
      </p>

      {/* Progress steps */}
      <div className="w-full max-w-md space-y-4 mb-6">
        {PROCESS_STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex items-center gap-3">
              {/* Step icon */}
              <div className="flex-shrink-0">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/30" />
                )}
              </div>

              {/* Step label */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors ${
                    isComplete
                      ? "text-green-600"
                      : isCurrent
                      ? "text-primary"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {step.label}
                </p>

                {/* Progress bar for current step */}
                {isCurrent && (
                  <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated time */}
      <p className="text-xs text-muted-foreground/70">
        Tempo estimado: 15-20 segundos
      </p>
    </div>
  );
}
