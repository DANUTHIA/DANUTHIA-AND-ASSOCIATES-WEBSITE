import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowRight, Upload, CheckCircle2 } from 'lucide-react';

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [officialName, setOfficialName] = useState('');
  const [goals, setGoals] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleComplete = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        needsOnboarding: false,
        officialName: officialName.trim(),
        goals: goals.split(',').map(g => g.trim()),
      });
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[10000] bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <div className="bg-concrete dark:bg-charcoal p-12 max-w-2xl w-full text-charcoal dark:text-concrete border border-steel/20 shadow-2xl">
        <h2 className="font-display text-4xl font-light mb-8">Welcome aboard.</h2>
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6">Step 1: Identity Verified</h3>
            <p className="text-xl mb-4 text-charcoal dark:text-concrete">What is the official name associated with this project?</p>
            <input 
              type="text"
              value={officialName}
              onChange={(e) => setOfficialName(e.target.value)}
              placeholder="e.g., Jennifer Ochieng"
              className="w-full bg-transparent border border-steel/30 p-4 mb-8 focus:outline-none focus:border-accent font-mono text-sm"
            />
            <button 
              onClick={() => setStep(2)} 
              disabled={!officialName.trim()}
              className="bg-accent text-concrete dark:text-charcoal px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-accent/90 transition-all disabled:opacity-30"
            >
              Next Phase
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6">Step 2: Project Vision</h3>
            <p className="text-xl mb-4 text-charcoal dark:text-concrete">Define your core project goals</p>
            <textarea 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., Sustainable residential design, Commercial health facility..."
              className="w-full h-32 bg-transparent border border-steel/30 p-4 mb-8 focus:outline-none focus:border-accent font-mono text-sm custom-scrollbar"
            />
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="border border-steel/30 px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-steel/10 transition-all">Back</button>
              <button onClick={() => setStep(3)} className="bg-charcoal text-white dark:bg-white dark:text-charcoal px-8 py-4 uppercase tracking-widest text-xs font-bold hover:opacity-90">Next Phase</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6">Step 3: Initial Asset Sync</h3>
            <p className="text-xl mb-4 text-charcoal dark:text-concrete">Sync initial documents for review</p>
            <div className="border-2 border-dashed border-steel/20 p-12 text-center mb-8 bg-charcoal/5 dark:bg-concrete/5">
              <Upload className="mx-auto mb-4 text-steel" />
              <p className="text-steel font-mono text-[10px] uppercase tracking-widest">Awaiting local asset secure selection</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="border border-steel/30 px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-steel/10 transition-all">Back</button>
              <button onClick={handleComplete} className="bg-accent text-concrete dark:text-charcoal px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-accent/90 transition-all">Establish Connection</button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
