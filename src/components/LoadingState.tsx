import logoMonogram from "@/assets/logo-monogram.png";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Analisando com base científica..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      <img 
        src={logoMonogram} 
        alt="Bella" 
        className="w-24 h-24 mb-8 animate-pulse"
      />
      
      <p className="font-heading text-xl text-primary text-center mb-2">
        {message}
      </p>
      
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Unindo ciência e tecnologia para criar sua visualização personalizada
      </p>
      
      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-serene-sand animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
