import React, { useState, useEffect } from 'react';
import { Menu, X, CheckCircle, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Logo from './Logo';
import Magnetic from './Magnetic';
import ThemeToggle from './ThemeToggle';
// Removed CustomCursor import

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
    isActive 
      ? "text-charcoal dark:text-concrete transition-colors font-bold border-l-2 border-accent pl-4" 
      : "text-charcoal/90 hover:text-accent dark:text-concrete/90 dark:hover:text-accent transition-all pl-4 hover:pl-6";

  return (
    <div className="min-h-screen bg-concrete dark:bg-charcoal text-charcoal dark:text-concrete selection:bg-accent selection:text-concrete flex flex-col relative font-sans transition-colors duration-500">
      
      {/* Navigation */}
      <header className={`fixed top-0 left-0 w-full md:w-72 md:h-screen z-50 transition-all duration-500 flex flex-col md:bg-transparent ${scrolled && !isMobileMenuOpen ? 'bg-concrete/95 dark:bg-charcoal/95 backdrop-blur-xl border-b border-steel/10 md:border-b-0 md:backdrop-blur-none py-4 md:py-16' : 'bg-transparent py-6 md:py-16'}`}>
        <div className="w-full px-6 md:px-12 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-8 md:gap-12 md:flex-1 md:min-h-0">
          <div className="w-full flex items-center justify-between md:flex-none">
            <Magnetic>
              <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer z-50 inline-block" onClick={closeMenu}>
                <Logo className="scale-90 md:scale-100 origin-left" />
              </Link>
            </Magnetic>

            {/* Top Controls: Mobile Theme Toggle and Mobile Menu */}
            <div className="flex flex-row items-center gap-4 z-50 md:hidden">
              <Magnetic>
                <ThemeToggle isDarkMode={isDarkMode} toggle={toggleDarkMode} />
              </Magnetic>
              <Magnetic>
                <button 
                  className="p-2 text-charcoal dark:text-concrete hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
                </button>
              </Magnetic>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-col items-start gap-4 lg:gap-5 text-[11px] font-sans uppercase tracking-[0.15em] pt-4 md:pt-8 w-full overflow-y-auto no-scrollbar md:flex-1 pb-4">
            <Magnetic><NavLink to="/" className={navLinkClass}>Home</NavLink></Magnetic>
            <Magnetic><NavLink to="/services" className={navLinkClass}>Services</NavLink></Magnetic>
            <Magnetic><NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink></Magnetic>
            <Magnetic><NavLink to="/book" className={navLinkClass}>Book Consultation</NavLink></Magnetic>
            <Magnetic><NavLink to="/sustainability" className={navLinkClass}>Sustainability</NavLink></Magnetic>
            <Magnetic><NavLink to="/about" className={navLinkClass}>About</NavLink></Magnetic>
            <Magnetic><NavLink to="/logbook" className={navLinkClass}>Logbook</NavLink></Magnetic>
            <Magnetic><NavLink to="/portal" className={navLinkClass}>Client Portal</NavLink></Magnetic>
            <Magnetic><NavLink to="/staff-login" className={navLinkClass}>Staff Portal</NavLink></Magnetic>
          </nav>
        </div>

        {/* Desktop Bottom Controls */}
        <div className="hidden md:flex flex-col gap-6 px-12 pb-12 mt-auto md:flex-none pt-4">
          <Magnetic>
            <ThemeToggle isDarkMode={isDarkMode} toggle={toggleDarkMode} />
          </Magnetic>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 w-full h-screen bg-concrete/95 dark:bg-charcoal/95 backdrop-blur-xl flex flex-col pt-12 px-8 uppercase tracking-[0.15em] text-xs font-sans font-medium"
            >
              <Link to="/" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Home</Link>
              <Link to="/services" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Services</Link>
              <Link to="/portfolio" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Portfolio</Link>
              <Link to="/sustainability" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Sustainability</Link>
              <Link to="/about" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>About</Link>
              <Link to="/logbook" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Logbook</Link>
              <Link to="/portal" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Client Portal</Link>
              <Link to="/staff-login" className="py-6 border-b border-steel/20 hover:text-accent transition-colors" onClick={closeMenu}>Staff Portal</Link>
              <Link to="/#book" className="mt-12 py-4 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal text-center hover:bg-accent dark:hover:bg-accent transition-colors" onClick={closeMenu}>Book Consultation</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Layout Wrapper */}
      <div className="flex flex-col flex-grow md:pl-72 min-h-screen">
        <div className="flex-grow pt-24 md:pt-0 overflow-x-hidden md:overflow-x-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-12 px-8 text-charcoal/50 dark:text-concrete/50 transition-colors duration-500">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 font-sans text-xs tracking-widest uppercase">
            <p>© {new Date().getFullYear()} Danuthia Associates Construction LLc</p>
            <div className="flex gap-8 flex-wrap justify-center md:justify-end">
              <Link to="/staff-login" className="hover:text-charcoal dark:hover:text-concrete transition-colors">Staff Portal</Link>
              <Link to="/admin" className="hover:text-charcoal dark:hover:text-concrete transition-colors">Admin Portal</Link>
              <Link to="/privacy-policy" className="hover:text-charcoal dark:hover:text-concrete transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-charcoal dark:hover:text-concrete transition-colors">Terms & Conditions</Link>
              <a href="mailto:contact@danuthia.com" className="hover:text-charcoal dark:hover:text-concrete transition-colors">contact@danuthia.com</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-charcoal dark:hover:text-concrete transition-colors">Instagram</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
