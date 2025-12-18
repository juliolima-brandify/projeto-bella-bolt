export function OrganicShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top right organic shape */}
      <div 
        className="organic-shape w-[500px] h-[500px] -top-40 -right-40"
        style={{ opacity: 0.4 }}
      />
      
      {/* Bottom left organic shape */}
      <div 
        className="organic-shape w-[600px] h-[600px] -bottom-60 -left-60"
        style={{ 
          opacity: 0.3,
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        }}
      />
      
      {/* Center accent */}
      <div 
        className="organic-shape w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ 
          opacity: 0.15,
          borderRadius: '50% 50% 50% 50%',
        }}
      />
    </div>
  );
}
