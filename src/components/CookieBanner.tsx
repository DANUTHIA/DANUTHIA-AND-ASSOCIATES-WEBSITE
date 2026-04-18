import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch (e) {
        // Handle old string format
      }
    }
  }, []);

  const handleConsent = (type: 'all' | 'decline' | 'custom') => {
    let finalPrefs = { ...preferences, essential: true };
    if (type === 'all') {
      finalPrefs = { essential: true, analytics: true, marketing: true };
    } else if (type === 'decline') {
      finalPrefs = { essential: true, analytics: false, marketing: false };
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(finalPrefs));
    setIsVisible(false);
    setShowSettings(false);
    
    // Simulate CMP script execution
    if (finalPrefs.analytics) console.log("Analytics Scripts Triggered");
    if (finalPrefs.marketing) console.log("Marketing Scripts Triggered");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 w-full bg-charcoal text-concrete z-[9999] border-t border-concrete/20 shadow-2xl"
        >
          {showSettings ? (
            <div className="max-w-4xl mx-auto p-6 md:p-10">
              <div className="flex justify-between items-center mb-8 border-b border-concrete/20 pb-4">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Cookie Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:text-accent transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6 mb-10 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                <div className="flex items-start justify-between gap-4 p-4 border border-concrete/20">
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-xs mb-2">Strictly Necessary (Essential)</h3>
                    <p className="font-mono text-[10px] text-concrete/70 leading-relaxed">Required for the website to function properly, including security, network management, and accessibility. Cannot be disabled.</p>
                  </div>
                  <div className="text-accent text-[10px] font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1"><Check size={14} /> Always Active</div>
                </div>
                <div className="flex items-start justify-between gap-4 p-4 border border-concrete/20">
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-xs mb-2">Analytics & Performance</h3>
                    <p className="font-mono text-[10px] text-concrete/70 leading-relaxed">Allows us to analyze site usage and measure performance to improve our digital experience.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={preferences.analytics} onChange={(e) => setPreferences(p => ({...p, analytics: e.target.checked}))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-concrete/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                <div className="flex items-start justify-between gap-4 p-4 border border-concrete/20">
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-xs mb-2">Personalization & Ads</h3>
                    <p className="font-mono text-[10px] text-concrete/70 leading-relaxed">Used to deliver targeted advertising and personalized content based on your professional interests.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={preferences.marketing} onChange={(e) => setPreferences(p => ({...p, marketing: e.target.checked}))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-concrete/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                <button onClick={() => handleConsent('decline')} className="w-full sm:w-auto bg-transparent border border-concrete/30 text-concrete px-8 py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-concrete/10 transition-colors">
                  Decline Non-Essential
                </button>
                <button onClick={() => handleConsent('custom')} className="w-full sm:w-auto bg-accent text-charcoal px-10 py-4 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-6 md:p-10">
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-3">Your Privacy Choices</h3>
                <p className="font-mono text-xs leading-relaxed opacity-80 max-w-4xl">
                  Danuthia & Associates uses essential cookies to ensure our platform functions securely, and analytical cookies to improve your digital experience. By clicking 'Accept All', you consent to our use of these technologies. You can manage your preferences by clicking 'Cookie Settings'.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto bg-transparent border border-concrete/30 text-concrete px-6 py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-concrete/10 transition-colors whitespace-nowrap"
                >
                  Cookie Settings
                </button>
                <button 
                  onClick={() => handleConsent('decline')}
                  className="w-full sm:w-auto bg-transparent border border-concrete/30 text-concrete px-6 py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-concrete/10 transition-colors whitespace-nowrap"
                >
                  Decline Non-Essential
                </button>
                <button 
                  onClick={() => handleConsent('all')}
                  className="w-full sm:w-auto bg-accent text-charcoal px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-colors border border-accent hover:border-concrete whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
