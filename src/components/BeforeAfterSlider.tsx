import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Blueprint", 
  afterLabel = "Reality" 
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleInteractionStart = (clientX: number) => {
    setIsDragging(true);
    handleMove(clientX);
  };

  return (
    <div 
      className="relative w-full aspect-[16/9] overflow-hidden cursor-ew-resize select-none group"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
      onMouseDown={(e) => handleInteractionStart(e.clientX)}
      onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
    >
      {/* After Image (Reality) - Background */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={afterImage} 
          alt={afterLabel} 
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-charcoal/80 text-concrete px-3 py-1 text-xs font-mono uppercase tracking-widest backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Blueprint) - Foreground with clip-path */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src={beforeImage} 
          alt={beforeLabel} 
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-concrete/80 text-charcoal px-3 py-1 text-xs font-mono uppercase tracking-widest backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Line & Handle */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-bronze cursor-ew-resize flex items-center justify-center shadow-[0_0_15px_rgba(184,134,11,0.5)] z-10"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        <div className="w-6 h-20 bg-charcoal border-2 border-bronze shadow-2xl flex items-center justify-center transition-transform duration-200 hover:scale-105">
          <div className="w-0.5 h-12 bg-bronze"></div>
        </div>
      </div>
    </div>
  );
}
