import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, db, handleFirestoreError, OperationType, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Shield, ArrowRight } from 'lucide-react';
import Magnetic from '../components/Magnetic';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          role: 'pending_staff'
        });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            role: 'pending_staff'
          });
        }
      }
      navigate('/staff-portal');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setError('Please enter a valid email format (e.g., name@company.com).');
      setIsLoading(false);
      return;
    }

    try {
      const customProvider = new GoogleAuthProvider();
      if (email) {
        customProvider.setCustomParameters({ login_hint: email });
      }
      
      const result = await signInWithPopup(auth, customProvider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: 'pending_staff'
        });
      }

      navigate('/staff-portal');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || (err instanceof Error && err.message.includes('popup-closed-by-user'))) {
        console.log('Authentication popup was closed by the user.');
      } else {
        handleFirestoreError(err, OperationType.GET, 'users');
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-concrete dark:bg-charcoal p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] border-[1px] border-steel/10 dark:border-concrete/10 rounded-full blur-3xl opacity-50 transition-colors duration-500"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] border-[1px] border-accent/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500"
      >
        <div className="flex justify-center mb-10">
          <div className="w-16 h-16 rounded-none border border-concrete/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-500">
            <Shield size={20} className="text-concrete" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="font-display text-4xl font-light tracking-tight text-center mb-4 text-concrete">
          Staff Portal
        </h1>
        <p className="text-concrete/70 font-mono text-[10px] uppercase tracking-[0.15em] text-center mb-12 leading-relaxed">
          Authorized internal staff login.
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 text-xs font-mono mb-8 text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-concrete/70 text-[10px] font-mono uppercase tracking-widest mb-2">
              Staff Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. employee@danuthiaandassociates.com"
              className="w-full bg-transparent border border-concrete/30 focus:border-concrete text-concrete px-4 py-3 text-sm font-mono outline-none transition-colors placeholder:text-concrete/30 mb-4"
              required
            />
            
            <label htmlFor="password" className="block text-concrete/70 text-[10px] font-mono uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent border border-concrete/30 focus:border-concrete text-concrete px-4 py-3 text-sm font-mono outline-none transition-colors placeholder:text-concrete/30"
              required
            />
          </div>
          
          <Magnetic className="w-full pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent border border-accent text-white py-4 font-bold uppercase tracking-widest hover:bg-accent/80 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <span>{isLoading ? 'Processing...' : (isSignUp ? 'Create Staff Account' : 'Sign In with Email')}</span>
            </button>
          </Magnetic>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-concrete/70 hover:text-concrete text-xs font-mono tracking-widest uppercase transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-concrete/20 flex-1"></div>
          <span className="text-concrete/50 font-mono text-[10px] uppercase tracking-widest">Or authenticate securely</span>
          <div className="h-px bg-concrete/20 flex-1"></div>
        </div>

        <Magnetic className="w-full">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />}
          </button>
        </Magnetic>

        <div className="mt-12 pt-8 border-t border-concrete/20 transition-colors duration-500 flex flex-col items-center gap-4">
          <p className="text-center text-concrete/70 text-xs font-light leading-relaxed">
            Access is strictly restricted to employees of Danuthia & Associates.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
