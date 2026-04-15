import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-pointer')
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
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-accent rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isHovering ? 3 : 1,
          opacity: isHovering ? 0.5 : 1
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
      />
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[10000] hidden md:flex items-center justify-center text-[8px] font-mono font-bold text-concrete mix-blend-difference"
          animate={{
            x: mousePosition.x - 20,
            y: mousePosition.y - 6,
          }}
          transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
        >
          VIEW
        </motion.div>
      )}
    </>
  );
}
