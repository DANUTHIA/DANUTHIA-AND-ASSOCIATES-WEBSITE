import React, { useEffect, useRef } from 'react';

interface HeroVideoProps {
  src: string;
  poster?: string;
  opacity?: number;
  className?: string;
  overlayClassName?: string;
}

export default function HeroVideo({ 
  src, 
  poster, 
  opacity = 70, 
  className = "",
  overlayClassName = "bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent"
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Force properties explicitly on the DOM element for robust cross-browser autoplay
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      
      // Load the new source to ensure dynamic CMS updates play correctly
      video.load();
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay was prevented by browser-specific constraints. Retaining poster.", error);
        });
      }
    }
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${className}`}
        style={{ opacity: opacity / 100 }}
      >
        <source src={src} />
      </video>
      <div className={`absolute inset-0 ${overlayClassName}`}></div>
    </>
  );
}
