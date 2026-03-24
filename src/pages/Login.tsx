import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, db, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';

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
          role: 'client'
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-concrete p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-charcoal text-concrete p-8 md:p-12 border border-steel/30 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-steel/10 border border-bronze/30 flex items-center justify-center">
            <Lock size={24} className="text-bronze" />
          </div>
        </div>
        
        <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-center mb-2">
          Client Portal
        </h1>
        <p className="text-steel font-mono text-xs uppercase tracking-widest text-center mb-12">
          Secure Access
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-bronze text-white py-4 font-bold uppercase tracking-widest hover:bg-bronze/90 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
          {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
        </button>

        <p className="text-center text-steel text-xs mt-8">
          Access is restricted to active clients of Danuthia & Associates.
        </p>
      </motion.div>
    </div>
  );
}
