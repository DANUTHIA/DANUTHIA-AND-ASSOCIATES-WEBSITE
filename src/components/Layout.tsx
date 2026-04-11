import React, { useState, useEffect } from 'react';
import { Menu, X, CheckCircle, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import Logo from './Logo';
import Global3DBackground from './Global3DBackground';
import Magnetic from './Magnetic';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      return newMode;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, 'newsletter'), { email, createdAt: serverTimestamp() });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'newsletter');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "text-bronze transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-bronze" : "hover:text-bronze transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-bronze hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="min-h-screen bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete selection:bg-bronze selection:text-concrete flex flex-col relative font-sans transition-colors duration-500">
      <Global3DBackground />
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-concrete/95 dark:bg-charcoal/95 backdrop-blur-xl border-b border-steel/20 py-2' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Magnetic>
            <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer z-50 inline-block" onClick={closeMenu}>
              <Logo className="scale-90 origin-left" />
            </Link>
          </Magnetic>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em]">
            <Magnetic><NavLink to="/" className={navLinkClass}>Home</NavLink></Magnetic>
            <Magnetic><NavLink to="/services" className={navLinkClass}>Services</NavLink></Magnetic>
            <Magnetic><NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink></Magnetic>
            <Magnetic><NavLink to="/about" className={navLinkClass}>About</NavLink></Magnetic>
            <Magnetic><NavLink to="/logbook" className={navLinkClass}>Logbook</NavLink></Magnetic>
            <Magnetic>
              <NavLink to="/portal" className={({ isActive }) => `px-4 py-2 border border-bronze text-bronze hover:bg-bronze hover:text-concrete transition-colors duration-300 ${isActive ? 'bg-bronze text-concrete' : ''}`}>
                Client Portal
              </NavLink>
            </Magnetic>
            <Magnetic>
              <ThemeToggle isDarkMode={isDarkMode} toggle={toggleDarkMode} />
            </Magnetic>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4 z-50">
            <Magnetic>
              <ThemeToggle isDarkMode={isDarkMode} toggle={toggleDarkMode} />
            </Magnetic>
            <Magnetic>
              <button 
                className="p-2 text-charcoal dark:text-concrete hover:text-bronze transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 w-full h-screen bg-concrete/95 dark:bg-charcoal/95 backdrop-blur-xl flex flex-col pt-12 px-8 uppercase tracking-[0.2em] text-sm font-bold"
            >
              <Link to="/" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Home</Link>
              <Link to="/services" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Services</Link>
              <Link to="/portfolio" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Portfolio</Link>
              <Link to="/about" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>About</Link>
              <Link to="/logbook" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Logbook</Link>
              <Link to="/portal" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Client Portal</Link>
              <Link to="/#book" className="mt-12 py-4 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal text-center hover:bg-bronze dark:hover:bg-bronze transition-colors" onClick={closeMenu}>Book Consultation</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex-grow pt-24 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer - Blueprint Title Block Aesthetic */}
      <footer className="bg-charcoal dark:bg-charcoal text-concrete mt-auto border-t-4 border-bronze transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-steel/30 dark:border-concrete/20">
            
            {/* Block 1: Brand & Desc */}
            <div className="md:col-span-5 p-8 border-b md:border-b-0 md:border-r border-steel/30 dark:border-concrete/20 flex flex-col justify-between">
              <div>
                <Link to="/" className="mb-8 hover:opacity-80 transition-opacity cursor-pointer inline-block">
                  <Logo className="scale-100 origin-left text-concrete" />
                </Link>
                <p className="text-steel font-mono text-xs leading-relaxed max-w-sm uppercase tracking-widest">
                  Shaping the future of the African urban landscape through sustainable, context-driven architectural design and master planning.
                </p>
              </div>
              <div className="mt-12 text-[9px] font-mono text-bronze uppercase tracking-[0.2em]">
                DOC.REF: FT-2026-04 // REV.A
              </div>
            </div>

            {/* Block 2: Links */}
            <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-steel/30 dark:border-concrete/20">
              <p className="text-[10px] font-mono text-bronze uppercase tracking-widest mb-6 border-b border-bronze/30 pb-2">Index</p>
              <nav className="flex flex-col gap-3 font-mono uppercase text-[10px] tracking-widest">
                <Link to="/services" className="hover:text-bronze transition-colors w-fit">Services</Link>
                <Link to="/portfolio" className="hover:text-bronze transition-colors w-fit">Portfolio</Link>
                <Link to="/about" className="hover:text-bronze transition-colors w-fit">About Us</Link>
                <Link to="/logbook" className="hover:text-bronze transition-colors w-fit">Logbook</Link>
                <Link to="/portal" className="hover:text-bronze transition-colors w-fit">Client Portal</Link>
              </nav>
            </div>

            {/* Block 3: Connect */}
            <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-steel/30 dark:border-concrete/20">
              <p className="text-[10px] font-mono text-bronze uppercase tracking-widest mb-6 border-b border-bronze/30 pb-2">Network</p>
              <nav className="flex flex-col gap-3 font-mono uppercase text-[10px] tracking-widest">
                <a href="https://www.linkedin.com/in/danuthiaandassociates-344b353b7/" target="_blank" rel="noopener noreferrer" className="hover:text-bronze transition-colors w-fit">LinkedIn</a>
                <a href="https://www.instagram.com/danuthiaandassociates/" target="_blank" rel="noopener noreferrer" className="hover:text-bronze transition-colors w-fit">Instagram</a>
                <a href="https://x.com/DanuthiaandCo" target="_blank" rel="noopener noreferrer" className="hover:text-bronze transition-colors w-fit">Twitter / X</a>
              </nav>
            </div>

            {/* Block 4: Newsletter & Meta */}
            <div className="md:col-span-3 p-8 flex flex-col justify-between bg-charcoal/50 dark:bg-[#0a0a0a]">
              <div>
                <p className="text-[10px] font-mono text-bronze uppercase tracking-widest mb-6 border-b border-bronze/30 pb-2">Data Stream</p>
                {subscribed ? (
                  <div className="flex items-center gap-2 text-bronze font-mono text-[10px] uppercase tracking-widest p-3 border border-bronze/30 bg-bronze/5">
                    <CheckCircle size={14} />
                    <span>Connection Est.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER EMAIL..." 
                      className="bg-transparent w-full border-b border-steel/30 focus:border-bronze outline-none text-[10px] font-mono uppercase tracking-widest placeholder:text-steel/50 pb-2 transition-colors"
                      required
                    />
                    <Magnetic>
                      <button type="submit" className="text-charcoal bg-bronze hover:bg-concrete transition-colors uppercase text-[10px] font-bold tracking-widest py-2 px-4 w-full">
                        Initialize
                      </button>
                    </Magnetic>
                  </form>
                )}
              </div>
              <div className="mt-12 pt-4 border-t border-steel/30 flex flex-col gap-2 text-[9px] font-mono text-steel uppercase tracking-widest">
                <p>© {new Date().getFullYear()} Danuthia & Co.</p>
                <div className="flex gap-4">
                  <Link to="/terms" className="hover:text-bronze transition-colors">Privacy</Link>
                  <Link to="/terms" className="hover:text-bronze transition-colors">Terms</Link>
                  <Link to="/admin" className="hover:text-bronze transition-colors">Admin</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
