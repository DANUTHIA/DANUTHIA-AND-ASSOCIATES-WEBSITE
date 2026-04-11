import React from 'react';

interface TechnicalOverlayProps {
  active: boolean;
}

export default function TechnicalOverlay({ active }: TechnicalOverlayProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #b8860b 1px, transparent 1px), linear-gradient(to bottom, #b8860b 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }}
      ></div>
      
      {/* Dimension Lines */}
      <div className="absolute top-4 left-4 right-4 h-px bg-bronze"></div>
      <div className="absolute top-4 bottom-4 left-4 w-px bg-bronze"></div>
      <div className="absolute top-4 bottom-4 right-4 w-px bg-bronze"></div>
      <div className="absolute bottom-4 left-4 right-4 h-px bg-bronze"></div>
      
      {/* Callout */}
      <div className="absolute top-8 left-8 bg-charcoal/80 text-bronze p-2 text-[10px] font-mono border border-bronze">
        STRUCTURAL_GRID_A1
      </div>
    </div>
  );
}
