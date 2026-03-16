import React from 'react';
import { motion } from 'motion/react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* If the user uploads 'logo.png' to the public folder, it will display here. 
          We use a fallback stylized SVG if the image fails to load or isn't uploaded yet. */}
      <div className="relative group cursor-pointer flex flex-col items-center">
        <img 
          src="/logo.png" 
          alt="Danuthia & Co. Logo" 
          className="h-16 md:h-20 object-contain z-10 relative transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback to stylized SVG if image is not found
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        
        {/* Fallback Stylized SVG (hidden by default, shown if img fails) */}
        <div className="hidden flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105" style={{ display: 'none' }}>
          <svg width="200" height="80" viewBox="0 0 200 80" className="drop-shadow-sm">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A871" />
                <stop offset="100%" stopColor="#8A7342" />
              </linearGradient>
              <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A5A6A" />
                <stop offset="100%" stopColor="#2A3439" />
              </linearGradient>
            </defs>
            
            {/* The "D" with Bridge */}
            <g transform="translate(10, 10)">
              <path d="M10,60 L10,10 L30,10 C45,10 55,20 55,35 C55,50 45,60 30,60 Z" fill="none" stroke="url(#slateGrad)" strokeWidth="8" />
              {/* Bridge inside D */}
              <path d="M15,45 L50,45 M25,45 L25,30 M40,45 L40,30 M15,45 Q32.5,25 50,45" fill="none" stroke="url(#slateGrad)" strokeWidth="2" />
            </g>

            {/* The "&" with Compass/Road */}
            <g transform="translate(70, 10)">
              <path d="M30,55 C15,55 10,45 15,35 C20,25 35,20 25,10 C15,0 5,10 5,20 C5,35 25,40 25,50 C25,60 10,60 0,50" fill="none" stroke="url(#slateGrad)" strokeWidth="6" />
              {/* Compass Star */}
              <path d="M20,15 L25,25 L35,30 L25,35 L20,45 L15,35 L5,30 L15,25 Z" fill="url(#goldGrad)" />
            </g>

            {/* The "C" with Skyline */}
            <g transform="translate(130, 10)">
              <path d="M45,15 C35,5 15,5 5,20 C-5,35 5,55 25,60 C35,60 45,55 50,45" fill="none" stroke="url(#slateGrad)" strokeWidth="8" />
              {/* Skyline inside C */}
              <path d="M10,50 L10,35 L18,35 L18,25 L25,25 L25,40 L32,40 L32,20 L40,20 L40,50 Z" fill="url(#goldGrad)" />
            </g>
          </svg>
          <span className="text-[0.65rem] md:text-xs tracking-[0.3em] uppercase font-medium text-charcoal mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            Danuthia & Co.
          </span>
        </div>
      </div>
    </div>
  );
}
