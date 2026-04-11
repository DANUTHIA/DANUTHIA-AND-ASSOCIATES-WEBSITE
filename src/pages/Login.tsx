import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';
import Magnetic from '../components/Magnetic';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Ensure user document exists in 'users' collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: 'pending'
        });
      }

      navigate('/portal');
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('popup')) {
        console.error("Popup closed by user", err);
      } else {
        handleFirestoreError(err, OperationType.GET, 'users');
      }
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-concrete dark:bg-charcoal p-6 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] border-[1px] border-steel/10 dark:border-concrete/10 rounded-full blur-3xl opacity-50 transition-colors duration-500"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] border-[1px] border-bronze/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500"
      >
        <div className="flex justify-center mb-10">
          <div className="w-16 h-16 rounded-none border border-bronze/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(184,134,11,0.1)] transition-colors duration-500">
            <Lock size={20} className="text-bronze" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="font-display text-4xl font-light tracking-tight text-center mb-4">
          Client Portal
        </h1>
        <p className="text-steel font-mono text-[10px] uppercase tracking-[0.15em] text-center mb-12 leading-relaxed">
          Are you a client? Sign in to get updated on your project.
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 text-xs font-mono mb-8 text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <Magnetic className="w-full">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-transparent border border-bronze text-bronze py-4 font-bold uppercase tracking-widest hover:bg-bronze hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />}
          </button>
        </Magnetic>

        <div className="mt-12 pt-8 border-t border-steel/20 dark:border-concrete/20 transition-colors duration-500 flex flex-col items-center gap-4">
          <p className="text-center text-steel text-xs font-light leading-relaxed">
            Access is restricted to active clients of Danuthia & Co.
          </p>
          <button
            onClick={() => {
              navigate('/#book');
            }}
            className="text-bronze text-[10px] font-bold uppercase tracking-widest hover:text-concrete transition-colors duration-300 border-b border-bronze/30 hover:border-bronze pb-1"
          >
            Not a client yet? Register with us today.
          </button>
        </div>
      </motion.div>
    </div>
  );
}
