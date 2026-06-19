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
      className={`relative flex items-center w-14 h-7 rounded-full p-1 transition-colors duration-500 border ${
        isDarkMode ? 'bg-concrete/10 border-concrete/20' : 'bg-charcoal/10 border-charcoal/20 shadow-inner'
      }`}
      aria-label="Toggle Theme"
    >
      {/* Background Icons */}
      <div className="absolute inset-0 w-full flex items-center justify-between px-2 pointer-events-none">
        <Moon size={12} className={isDarkMode ? 'text-concrete/40' : 'text-charcoal/40'} />
        <Sun size={12} className={isDarkMode ? 'text-concrete/40' : 'text-charcoal/40'} />
      </div>
      
      {/* Animated Handle */}
      <motion.div
        className={`relative z-10 flex items-center justify-center w-5 h-5 rounded-full shadow-md ${
          isDarkMode ? 'bg-concrete text-charcoal' : 'bg-charcoal text-concrete'
        }`}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        animate={{
          x: isDarkMode ? 28 : 0,
        }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDarkMode ? -360 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {isDarkMode ? <Moon size={10} strokeWidth={2.5} /> : <Sun size={10} strokeWidth={2.5} />}
        </motion.div>
      </motion.div>
    </button>
  );
}
