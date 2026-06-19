import React, { useState, useEffect } from 'react';
import { Settings, PenTool } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAILS = [
  "machariag605@gmail.com",
  "danuthiaandassociates@gmail.com"
];

export default function AdminFloatingDrawer() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!(user && user.email && ADMIN_EMAILS.includes(user.email)));
    });
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fadeIn">
      <button 
        onClick={() => {
          navigate('/admin?tab=cms');
          window.scrollTo(0, 0);
        }}
        className="group relative flex items-center gap-3 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-6 py-4 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden border border-white/20 dark:border-charcoal/20"
      >
        <div className="absolute inset-0 bg-accent/90 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
        <PenTool size={18} className="relative z-10 group-hover:text-white transition-colors" />
        <span className="font-mono text-xs uppercase tracking-widest relative z-10 font-bold group-hover:text-white transition-colors">CMS Editor</span>
      </button>
    </div>
  );
}
