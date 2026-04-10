import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowRight } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'home', label: 'NAVIGATE: HOME', action: () => navigate('/') },
    { id: 'portfolio', label: 'NAVIGATE: PORTFOLIO', action: () => navigate('/portfolio') },
    { id: 'services', label: 'NAVIGATE: SERVICES', action: () => navigate('/services') },
    { id: 'about', label: 'NAVIGATE: ABOUT', action: () => navigate('/about') },
    { id: 'portal', label: 'ACCESS: CLIENT PORTAL', action: () => navigate('/portal') },
    { id: 'theme', label: 'SYSTEM: TOGGLE THEME', action: () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      }
    }}
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-charcoal/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[10000] p-4"
          >
            <div className="bg-[#111111] border border-bronze/50 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-bronze/20 bg-bronze/5">
                <Terminal size={20} className="text-bronze" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="ENTER COMMAND..." 
                  className="w-full bg-transparent border-none outline-none text-concrete font-mono uppercase tracking-widest placeholder:text-concrete/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="text-[10px] font-mono text-bronze border border-bronze/30 px-2 py-1">ESC</div>
              </div>
              <div className="max-h-[40vh] overflow-y-auto p-2">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      className="w-full text-left flex items-center justify-between p-4 hover:bg-bronze/10 text-concrete/70 hover:text-bronze font-mono text-sm uppercase tracking-widest transition-colors group"
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-concrete/30 group-hover:text-bronze/50">{(idx + 1).toString().padStart(2, '0')}</span>
                        {cmd.label}
                      </div>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-concrete/30 font-mono text-sm uppercase tracking-widest">
                    NO COMMANDS FOUND
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
