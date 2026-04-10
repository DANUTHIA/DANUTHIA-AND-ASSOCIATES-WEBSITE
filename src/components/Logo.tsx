import React from 'react';
import { motion } from 'motion/react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center md:items-start ${className}`}>
      <div className="relative w-24 h-12 md:w-32 md:h-16 flex items-center justify-center">
        {/* Real Logo SVG: D&C with architectural elements */}
        <svg 
          viewBox="0 0 300 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full transition-colors duration-500"
        >
          {/* Stylized 'D' with Bridge */}
          <path 
            d="M20 20V100H60C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20H20Z" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          {/* Bridge inside D */}
          <path 
            d="M35 80C35 80 45 60 60 60C75 60 85 80 85 80" 
            stroke="currentColor" 
            strokeWidth="3" 
          />
          <path d="M35 80H85" stroke="currentColor" strokeWidth="2" />
          <line x1="45" y1="80" x2="45" y2="70" stroke="currentColor" strokeWidth="1" />
          <line x1="60" y1="80" x2="60" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="75" y1="80" x2="75" y2="70" stroke="currentColor" strokeWidth="1" />

          {/* Stylized '&' with Compass and Road */}
          <path 
            d="M140 100C160 100 175 85 175 65C175 45 160 40 150 40C140 40 125 45 125 65C125 85 140 100 160 100Z" 
            stroke="var(--color-bronze, #B08D57)" 
            strokeWidth="8" 
          />
          <path 
            d="M175 100L150 40" 
            stroke="var(--color-bronze, #B08D57)" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          {/* Compass inside & */}
          <path 
            d="M150 55L155 70L150 85L145 70L150 55Z" 
            fill="var(--color-bronze, #B08D57)" 
          />
          <path 
            d="M135 70L150 65L165 70L150 75L135 70Z" 
            fill="var(--color-bronze, #B08D57)" 
          />
          {/* Road curve */}
          <path 
            d="M130 90C140 80 160 80 170 90" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeDasharray="4 4"
          />

          {/* Stylized 'C' with City Skyline */}
          <path 
            d="M280 40C270 25 250 20 230 20C205 20 185 40 185 65C185 90 205 110 230 110C250 110 270 105 280 90" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          {/* City Skyline inside C */}
          <rect x="205" y="70" width="10" height="30" fill="var(--color-bronze, #B08D57)" />
          <rect x="220" y="55" width="12" height="45" fill="var(--color-bronze, #B08D57)" />
          <rect x="238" y="65" width="8" height="35" fill="var(--color-bronze, #B08D57)" />
          <rect x="252" y="75" width="10" height="25" fill="var(--color-bronze, #B08D57)" />
        </svg>
      </div>
      
      <div className="flex flex-col items-center md:items-start leading-none mt-2">
        <span className="font-display font-bold text-xl md:text-2xl tracking-tighter transition-colors duration-500">
          DANUTHIA & CO.
        </span>
      </div>
    </div>
  );
}
