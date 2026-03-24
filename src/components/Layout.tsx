import React, { useState } from 'react';
import { Menu, X, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import Logo from './Logo';
import Global3DBackground from './Global3DBackground';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const location = useLocation();

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
    isActive ? "text-bronze transition-colors" : "hover:text-bronze transition-colors";

  return (
    <div className="min-h-screen bg-transparent text-charcoal selection:bg-bronze selection:text-white flex flex-col relative">
      <Global3DBackground />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-concrete/90 backdrop-blur-md border-b border-steel/30">
        <div className="w-full px-4 md:px-8 flex items-center justify-between h-16">
          <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer" onClick={closeMenu}>
            <Logo className="scale-75 origin-left" />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
            <NavLink to="/services" className={navLinkClass}>Services</NavLink>
            <NavLink to="/portfolio" className={navLinkClass}>Portfolio</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/portal" className={navLinkClass}>Client Portal</NavLink>
            <Link to="/#book" className="px-4 py-2 bg-charcoal text-concrete hover:bg-bronze hover:scale-105 transition-all duration-300">Book</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-charcoal hover:text-bronze transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-steel/30 bg-concrete flex flex-col uppercase tracking-widest text-sm font-medium overflow-hidden"
          >
            <Link to="/services" className="p-4 border-b border-steel/10 hover:bg-steel/5" onClick={closeMenu}>Services</Link>
            <Link to="/portfolio" className="p-4 border-b border-steel/10 hover:bg-steel/5" onClick={closeMenu}>Portfolio</Link>
            <Link to="/about" className="p-4 border-b border-steel/10 hover:bg-steel/5" onClick={closeMenu}>About</Link>
            <Link to="/portal" className="p-4 border-b border-steel/10 hover:bg-steel/5" onClick={closeMenu}>Client Portal</Link>
            <Link to="/#book" className="p-4 bg-charcoal text-concrete hover:bg-bronze transition-colors" onClick={closeMenu}>Book</Link>
          </motion.div>
        )}
      </nav>

      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="bg-concrete border-b-8 border-charcoal mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-steel/30 border-b border-steel/30">
          
          {/* Logo Area */}
          <div className="p-8 flex items-center justify-center md:justify-start">
            <Link to="/" className="hover:opacity-80 transition-opacity cursor-pointer">
              <Logo className="scale-90 origin-left" />
            </Link>
          </div>

          {/* Social Links */}
          <div className="p-8 flex flex-col justify-center">
            <p className="text-xs font-mono text-steel uppercase tracking-widest mb-4">Social</p>
            <div className="flex flex-col gap-2 font-medium uppercase text-sm">
              <a href="https://www.linkedin.com/in/danuthiaandassociates-344b353b7/" target="_blank" rel="noopener noreferrer" className="hover:text-bronze hover:translate-x-1 transition-all w-fit">LinkedIn</a>
              <a href="https://www.instagram.com/danuthiaandassociates/" target="_blank" rel="noopener noreferrer" className="hover:text-bronze hover:translate-x-1 transition-all w-fit">Instagram</a>
              <a href="https://x.com/DanuthiaandCo" target="_blank" rel="noopener noreferrer" className="hover:text-bronze hover:translate-x-1 transition-all w-fit">Twitter / X</a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="p-8 flex flex-col justify-center">
            <p className="text-xs font-mono text-steel uppercase tracking-widest mb-4">Newsletter</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-bronze font-medium text-sm">
                <CheckCircle size={16} />
                <span>Subscribed successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border-b border-charcoal pb-2 group focus-within:border-bronze transition-colors">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  className="bg-transparent w-full focus:outline-none text-sm"
                  required
                />
                <button type="submit" className="text-bronze hover:text-charcoal transition-colors uppercase text-xs font-bold tracking-wider">
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Legal */}
          <div className="p-8 flex flex-col justify-center">
            <p className="text-xs font-mono text-steel uppercase tracking-widest mb-4">Legal</p>
            <div className="flex flex-col gap-2 font-medium uppercase text-sm text-charcoal/70">
              <Link to="/about" className="hover:text-charcoal transition-colors w-fit">Privacy Policy</Link>
              <Link to="/about" className="hover:text-charcoal transition-colors w-fit">Terms of Service</Link>
              <Link to="/admin" className="hover:text-charcoal transition-colors w-fit">Admin Dashboard</Link>
              <span className="mt-4 text-xs">© {new Date().getFullYear()} Danuthia & Co.</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
