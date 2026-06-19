import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, db, handleFirestoreError, OperationType, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../lib/firebase';
import { signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowRight, Activity, Shield } from 'lucide-react';
import Magnetic from '../components/Magnetic';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export default function Login() {
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
          role: 'pending',
          needsOnboarding: true,
          createdAt: serverTimestamp()
        });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            role: 'pending',
            needsOnboarding: true,
            createdAt: serverTimestamp()
          });
        }
      }
      navigate('/portal');
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
    
    let user;
    try {
      const result = await signInWithPopup(auth, provider);
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
      // Ensure user document exists in 'users' collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: 'pending',
          needsOnboarding: true,
          createdAt: serverTimestamp()
        });
      }

      navigate('/portal');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, 'users');
      setError('Database connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-concrete dark:bg-charcoal p-6 relative overflow-hidden transition-colors duration-500">
      {/* Decorative Interactive Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            x: mousePosition.x * 0.02, 
            y: mousePosition.y * 0.02,
            rotate: 360 
          }}
          transition={{ rotate: { duration: 100, repeat: Infinity, ease: "linear" }, x: { type: "spring", stiffness: 50 }, y: { type: "spring", stiffness: 50 } }}
          className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] border-[1px] border-steel/10 dark:border-concrete/10 rounded-full blur-3xl opacity-50 transition-colors duration-500"
        />
        <motion.div 
          animate={{ 
            x: -mousePosition.x * 0.03, 
            y: -mousePosition.y * 0.03 
          }}
          transition={{ type: "spring", stiffness: 40 }}
          className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] border-[1px] border-accent/10 rounded-full blur-3xl opacity-30"
        />
        
        {/* Subtle grid pattern moving slowly */}
        <motion.div 
          animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-charcoal dark:bg-charcoal text-concrete p-10 md:p-16 relative z-10 transition-colors duration-500 shadow-2xl"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-10 relative">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-16 h-16 rounded-none border border-concrete/30 flex items-center justify-center bg-charcoal dark:bg-charcoal shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-colors duration-500 z-10 relative cursor-pointer group"
          >
            <Lock size={20} className="text-concrete group-hover:scale-0 transition-transform duration-300 absolute" strokeWidth={1.5} />
            <Shield size={20} className="text-accent scale-0 group-hover:scale-100 transition-transform duration-300 absolute" strokeWidth={1.5} />
          </motion.div>
          {/* Pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 m-auto w-16 h-16 border border-concrete/20"
          />
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="font-display text-4xl font-light tracking-tight text-center mb-4 text-concrete">
          Client Portal
        </motion.h1>
        <motion.p variants={itemVariants} className="flex items-center justify-center gap-2 text-concrete/70 font-mono text-[10px] uppercase tracking-[0.15em] text-center mb-12 leading-relaxed">
          <Activity size={12} className="text-accent animate-pulse" /> Identify Yourself
        </motion.p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 text-xs font-mono mb-8 text-center uppercase tracking-widest overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <Magnetic className="w-full">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-transparent border border-concrete text-concrete py-4 font-bold uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-xs mb-6 relative overflow-hidden"
            >
              <span className="relative z-10">{isLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
              {!isLoading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-500" strokeWidth={1.5} />}
              <div className="absolute inset-0 bg-concrete transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out z-0"></div>
            </button>
          </Magnetic>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
          <div className="h-px bg-concrete/20 flex-1"></div>
          <span className="text-concrete/50 font-mono text-[10px] uppercase tracking-widest">Or via encrypted email</span>
          <div className="h-px bg-concrete/20 flex-1"></div>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-concrete/5 border border-concrete/20 px-4 py-3 text-sm text-concrete placeholder-concrete/50 focus:outline-none focus:border-accent transition-colors relative z-10 bg-transparent"
              required
            />
            <div className="absolute inset-0 bg-concrete/5 scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300 origin-bottom"></div>
          </div>
          <div className="relative group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-concrete/5 border border-concrete/20 px-4 py-3 text-sm text-concrete placeholder-concrete/50 focus:outline-none focus:border-accent transition-colors relative z-10 bg-transparent"
              required
            />
            <div className="absolute inset-0 bg-concrete/5 scale-y-0 group-focus-within:scale-y-100 transition-transform duration-300 origin-bottom"></div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full pt-2"
          >
            <Magnetic className="w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent border border-accent text-white py-4 font-bold uppercase tracking-widest hover:bg-accent/80 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs relative overflow-hidden group"
              >
                <span className="relative z-10">{isLoading ? 'Processing...' : (isSignUp ? 'Initialize Profile' : 'Gain Access')}</span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
              </button>
            </Magnetic>
          </motion.div>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-concrete/70 hover:text-accent text-[10px] font-mono tracking-widest uppercase transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-accent after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-right hover:after:origin-left"
          >
            {isSignUp ? "Already registered? Authenticate" : "Require credentials? Request access"}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-concrete/20 transition-colors duration-500 flex flex-col items-center gap-4 relative">
          <p className="text-center text-concrete/50 text-[9px] font-mono tracking-widest uppercase leading-relaxed">
            Strictly classified for active clientele of Danuthia Associates Construction LLc.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
