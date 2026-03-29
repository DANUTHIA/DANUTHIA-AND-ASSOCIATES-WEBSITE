import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggle: () => void;
}

export default function ThemeToggle({ isDarkMode, toggle }: ThemeToggleProps) {
  return (
    <button
      onClick={toggle}
      className={`relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-500 border ${
        isDarkMode ? 'bg-charcoal border-steel/40' : 'bg-concrete border-steel/30 shadow-inner'
      }`}
      aria-label="Toggle Theme"
    >
      {/* Background Icons */}
      <div className="absolute inset-0 w-full flex items-center justify-between px-2 pointer-events-none">
        <Moon size={14} className={isDarkMode ? 'text-transparent' : 'text-steel/40'} />
        <Sun size={14} className={isDarkMode ? 'text-steel/40' : 'text-transparent'} />
      </div>
      
      {/* Animated Handle */}
      <motion.div
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-md ${
          isDarkMode ? 'bg-concrete text-charcoal' : 'bg-charcoal text-concrete'
        }`}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{
          x: isDarkMode ? 0 : 32,
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDarkMode ? -360 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {isDarkMode ? <Moon size={12} /> : <Sun size={12} />}
        </motion.div>
      </motion.div>
    </button>
  );
}
