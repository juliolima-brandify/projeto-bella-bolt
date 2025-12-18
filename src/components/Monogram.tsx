import { cn } from "@/lib/utils";

interface MonogramProps {
  className?: string;
  animate?: boolean;
}

export function Monogram({ className, animate = false }: MonogramProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        animate && "animate-pulse-glow",
        className
      )}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer circle */}
        <circle
          cx="40"
          cy="40"
          r="38"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary"
        />
        
        {/* Letter I */}
        <path
          d="M32 20V60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
        />
        <path
          d="M28 20H36"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
        />
        <path
          d="M28 60H36"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
        />
        
        {/* Letter B */}
        <path
          d="M44 20V60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-primary"
        />
        <path
          d="M44 20H52C56.4183 20 60 23.5817 60 28C60 32.4183 56.4183 36 52 36H44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        <path
          d="M44 40H54C58.4183 40 62 43.5817 62 48C62 52.4183 58.4183 56 54 56H44"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>
    </div>
  );
}
