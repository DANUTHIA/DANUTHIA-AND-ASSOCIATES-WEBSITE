import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, db, handleFirestoreError, OperationType, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight, Server, Lock } from 'lucide-react';
import Magnetic from '../components/Magnetic';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Password should be at least 6 characters.');
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
      console.error(err);
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';
      
      if (errorCode === 'auth/wrong-password' || errorMessage.includes('auth/wrong-password')) {
        setError('Wrong password.');
      } else if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('auth/email-already-in-use')) {
        setError('Email already in use. Try logging in.');
      } else if (errorCode === 'auth/user-not-found' || errorMessage.includes('auth/user-not-found')) {
        setError('Invalid, check email and try again.');
      } else if (errorCode === 'auth/invalid-credential' || errorMessage.includes('auth/invalid-credential')) {
        setError('Invalid email or password.');
      } else {
        setError(errorMessage || 'Authentication failed. Please check your credentials.');
      }
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

    let user;
    try {
      const customProvider = new GoogleAuthProvider();
      if (email) {
        customProvider.setCustomParameters({ login_hint: email });
      }
      
      const result = await signInWithPopup(auth, customProvider);
      user = result.user;
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' || 
        err?.code === 'auth/cancelled-popup-request' ||
        (err instanceof Error && (err.message.includes('popup-closed-by-user') || err.message.includes('cancelled-popup-request')))
      ) {
        console.log('Authentication popup was closed by the user.');
      } else {
        console.error('Auth error:', err);
        setError(err.message || 'Authentication failed. Please try again or open this app in a new tab.');
      }
      setIsLoading(false);
      return;
    }

    try {
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
      handleFirestoreError(err, OperationType.GET, 'users');
      setError('Database connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-charcoal dark:bg-charcoal p-6 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Interactive Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden mix-blend-screen">
        <motion.div 
          animate={{ 
            x: -mousePosition.x * 0.05, 
            y: mousePosition.y * 0.05,
            scale: [1, 1.1, 1]
          }}
          transition={{ scale: { duration: 15, repeat: Infinity, ease: "easeInOut" }, x: { type: "spring", stiffness: 30 }, y: { type: "spring", stiffness: 30 } }}
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] border-[2px] border-accent/20 rounded-full blur-[80px] opacity-40 transition-colors duration-500"
        />
        <motion.div 
          animate={{ 
            x: mousePosition.x * 0.04, 
            y: -mousePosition.y * 0.04 
          }}
          transition={{ type: "spring", stiffness: 40 }}
          className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-charcoal/20 border-t border-r border-steel/10 blur-3xl opacity-60"
        />
        
        {/* Abstract Technical Data pattern */}
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/50 to-transparent flex items-end">
          <div className="w-full flex justify-around opacity-10 pb-4 font-mono text-[8px] text-white">
            <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>SYS01_OK</motion.span>
            <motion.span animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>NET_LINKED</motion.span>
            <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>AUTH_STANDBY</motion.span>
            <motion.span animate={{ y: [0, -12, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }}>NODE_SECURE</motion.span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500 shadow-2xl border border-steel/20"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-10 relative">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-16 h-16 rounded-sm border border-accent/50 flex flex-col items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_20px_rgba(184,134,11,0.2)] transition-colors duration-500 relative overflow-hidden group cursor-pointer z-10"
          >
            <Shield size={20} className="text-accent group-hover:-translate-y-10 transition-transform duration-300 absolute" strokeWidth={1.5} />
            <Server size={20} className="text-white translate-y-10 group-hover:translate-y-0 transition-transform duration-300 absolute" strokeWidth={1.5} />
            {/* Scanning line effect */}
            <motion.div 
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-accent/50 shadow-[0_0_5px_rgba(184,134,11,1)]"
            />
          </motion.div>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-display text-4xl font-light tracking-tight text-center mb-4 text-white">
          Staff Portal
        </motion.h1>
        <motion.p variants={itemVariants} className="text-concrete/60 font-mono text-[9px] uppercase tracking-[0.2em] text-center mb-10 leading-relaxed flex items-center justify-center gap-2">
           <Lock size={10} className="text-accent" /> Intranet Authentication Gateway
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.9 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 text-[10px] font-mono mb-8 text-center uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form variants={itemVariants} onSubmit={handleEmailAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="block text-concrete/70 text-[9px] font-mono uppercase tracking-[0.2em] mb-2 font-bold flex items-center justify-between">
                <span>Staff Identifier</span>
                <span className="text-accent opacity-50">.usr</span>
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. operative@danuthiaandassociates.com"
                  className="w-full bg-white/5 border border-steel/20 focus:border-accent text-white px-4 py-3 text-xs font-mono outline-none transition-colors placeholder:text-concrete/30 relative z-10"
                  required
                />
                <div className="absolute inset-0 bg-accent/5 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-concrete/70 text-[9px] font-mono uppercase tracking-[0.2em] mb-2 font-bold flex items-center justify-between">
                <span>Security Key</span>
                <span className="text-accent opacity-50">.key</span>
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-steel/20 focus:border-accent text-white px-4 py-3 text-xs font-mono outline-none transition-colors placeholder:text-concrete/30 tracking-[0.3em] relative z-10"
                  required
                />
                <div className="absolute inset-0 bg-accent/5 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </div>
          </div>
          
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-charcoal border border-steel/30 text-white font-mono py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent hover:border-accent transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden flex items-center justify-center gap-3"
            >
              <span className="relative z-10">{isLoading ? 'Verifying Protocol...' : (isSignUp ? 'Generate Credentials' : 'Commence Login')}</span>
              {!isLoading && <ArrowRight size={14} className="relative z-10 translate-x-0 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={2} />}
              <div className="absolute inset-0 bg-accent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            </button>
          </motion.div>
        </motion.form>



        <motion.div variants={itemVariants} className="flex items-center gap-4 my-6 opacity-60">
          <div className="h-px bg-steel/30 flex-1"></div>
          <span className="text-steel font-mono text-[8px] uppercase tracking-[0.2em]">Or Sign In With</span>
          <div className="h-px bg-steel/30 flex-1"></div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-transparent border border-steel/30 text-steel py-3 font-mono font-bold uppercase tracking-[0.1em] hover:border-concrete hover:text-concrete transition-all duration-500 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-[10px] relative overflow-hidden"
          >
            <span className="relative z-10 line-clamp-1 truncate max-w-[80%]">{email ? `Connect via ${email}` : 'Sign in with Google Account'}</span>
            <div className="absolute inset-0 bg-white/5 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 border-t border-steel/20 pt-6 flex flex-col items-center gap-2">
          <p className="text-center text-steel/60 text-[8px] font-mono tracking-[0.2em] uppercase leading-relaxed">
            Unauthorized access prohibited.<br/>All protocols strictly monitored by Danuthia Associates Construction LLc.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
