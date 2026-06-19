import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = 0, targetY = 0;
    
    const updateMousePosition = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      setMousePosition({ x: targetX, y: targetY });
      animationFrameId = 0;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const elWithText = target.closest('[data-cursor-text]') as HTMLElement;
      if (elWithText) {
        setCursorText(elWithText.getAttribute('data-cursor-text'));
        setIsHovering(true);
        return;
      }
      
      setCursorText(null);

      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-pointer') ||
        target.classList.contains('group')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 bg-white mix-blend-difference rounded-full pointer-events-none z-[9999] hidden md:flex items-center justify-center font-bold font-mono tracking-widest text-black text-[6px]"
        animate={{
          x: mousePosition.x - (cursorText ? 40 : 6),
          y: mousePosition.y - (cursorText ? 40 : 6),
          width: cursorText ? 80 : 12,
          height: cursorText ? 80 : 12,
          scale: isHovering && !cursorText ? 3 : 1,
          opacity: 1
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
      >
        {cursorText && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
