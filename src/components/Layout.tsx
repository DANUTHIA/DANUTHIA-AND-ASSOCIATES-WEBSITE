import React, { useState, useEffect } from 'react';
import { Menu, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import Logo from './Logo';
import Global3DBackground from './Global3DBackground';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
    <div className="min-h-screen bg-transparent text-charcoal selection:bg-bronze selection:text-white flex flex-col relative font-sans">
      <Global3DBackground />
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-concrete/95 backdrop-blur-xl border-b border-steel/20 py-2' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer z-50" onClick={closeMenu}>
            <Logo className="scale-90 origin-left" />
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em]">
            <NavLink to="/services" className={navLinkClass}>Services</NavLink>
            <NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/portal" className={navLinkClass}>Client Portal</NavLink>
            <Link to="/#book" className="px-6 py-3 border border-charcoal hover:bg-charcoal hover:text-concrete transition-all duration-500 ml-4">Book Consultation</Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-charcoal hover:text-bronze transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-full left-0 w-full h-screen bg-concrete/95 backdrop-blur-xl flex flex-col pt-12 px-8 uppercase tracking-[0.2em] text-sm font-bold"
            >
              <Link to="/services" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Services</Link>
              <Link to="/portfolio" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Portfolio</Link>
              <Link to="/about" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>About</Link>
              <Link to="/portal" className="py-6 border-b border-steel/20 hover:text-bronze transition-colors" onClick={closeMenu}>Client Portal</Link>
              <Link to="/#book" className="mt-12 py-4 bg-charcoal text-concrete text-center hover:bg-bronze transition-colors" onClick={closeMenu}>Book Consultation</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex-grow pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-charcoal text-concrete mt-auto border-t border-steel/20">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8">
            
            {/* Brand */}
            <div className="lg:col-span-4 flex flex-col">
              <Link to="/" className="mb-8 hover:opacity-80 transition-opacity cursor-pointer inline-block">
                <Logo className="scale-100 origin-left text-concrete" />
              </Link>
              <p className="text-steel font-light leading-relaxed max-w-sm">
                Shaping the future of the African urban landscape through sustainable, context-driven architectural design and master planning.
              </p>
            </div>

            {/* Links */}
            <div className="lg:col-span-2 lg:col-start-6">
              <p className="text-xs font-mono text-bronze uppercase tracking-widest mb-6">Explore</p>
              <nav className="flex flex-col gap-4 font-medium uppercase text-xs tracking-wider">
                <Link to="/services" className="hover:text-bronze transition-colors w-fit">Services</Link>
                <Link to="/portfolio" className="hover:text-bronze transition-colors w-fit">Portfolio</Link>
                <Link to="/about" className="hover:text-bronze transition-colors w-fit">About Us</Link>
                <Link to="/portal" className="hover:text-bronze transition-colors w-fit">Client Portal</Link>
                <Link to="/careers" className="hover:text-bronze transition-colors w-fit">Work With Us</Link>
                <Link to="/affiliate" className="hover:text-bronze transition-colors w-fit">Affiliate Program</Link>
              </nav>
            </div>

            {/* Social */}
            <div className="lg:col-span-2">
              <p className="text-xs font-mono text-bronze uppercase tracking-widest mb-6">Connect</p>
              <nav className="flex flex-col gap-4 font-medium uppercase text-xs tracking-wider">
                <a href="https://www.linkedin.com/in/danuthiaandassociates-344b353b7/" target="_blank" rel="noopener noreferrer" className="hover:text-bronze transition-colors w-fit">LinkedIn</a>
                <a href="https://www.instagram.com/danuthiaandassociates/" target="_blank" rel="noopener noreferrer" className="hover:text-bronze transition-colors w-fit">Instagram</a>
                <a href="https://x.com/DanuthiaandCo" target="_blank" rel="noopener noreferrer" className="hover:text-bronze transition-colors w-fit">Twitter / X</a>
              </nav>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <p className="text-xs font-mono text-bronze uppercase tracking-widest mb-6">Journal</p>
              <p className="text-steel font-light text-sm mb-6">Subscribe to our newsletter for insights on architecture and urbanism.</p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-bronze font-medium text-sm p-3 border border-bronze/30 bg-bronze/5">
                  <CheckCircle size={16} />
                  <span>Subscribed successfully.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex border-b border-steel/50 pb-2 group focus-within:border-bronze transition-colors">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address" 
                    className="bg-transparent w-full focus:outline-none text-sm font-light placeholder:text-steel/50"
                    required
                  />
                  <button type="submit" className="text-bronze hover:text-concrete transition-colors uppercase text-xs font-bold tracking-wider ml-4">
                    Subscribe
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-24 pt-8 border-t border-steel/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-steel uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Danuthia & Co. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/about" className="hover:text-concrete transition-colors">Privacy Policy</Link>
              <Link to="/about" className="hover:text-concrete transition-colors">Terms of Service</Link>
              <Link to="/admin" className="hover:text-concrete transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
