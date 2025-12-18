interface BrandHeaderProps {
  className?: string;
}

export function BrandHeader({ className = "" }: BrandHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="font-heading text-2xl md:text-3xl text-primary mb-1">
        Dra. Izabella Brasão
      </h1>
      <p className="text-sm md:text-base text-secondary font-medium mb-1">
        Obesidade | Emagrecimento | Saúde hormonal
      </p>
      <p className="text-xs text-muted-foreground">
        CRM/MG 106624
      </p>
    </div>
  );
}
