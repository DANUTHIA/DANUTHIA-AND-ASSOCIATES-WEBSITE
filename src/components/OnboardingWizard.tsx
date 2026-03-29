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
  const [goals, setGoals] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleComplete = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        needsOnboarding: false,
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
      className="fixed inset-0 z-[10000] bg-charcoal/90 flex items-center justify-center p-6"
    >
      <div className="bg-concrete dark:bg-[#111111] p-12 max-w-2xl w-full text-charcoal dark:text-concrete">
        <h2 className="font-display text-4xl font-light mb-8">Welcome to Danuthia & Co.</h2>
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-xl mb-6">Define your project goals</h3>
            <textarea 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., Sustainable residential design, Commercial office space..."
              className="w-full h-32 bg-transparent border border-steel/30 p-4 mb-8 focus:outline-none focus:border-bronze"
            />
            <button onClick={() => setStep(2)} className="bg-bronze text-concrete px-8 py-3 uppercase tracking-widest text-xs font-bold">Next</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-xl mb-6">Upload initial documents</h3>
            <div className="border-2 border-dashed border-steel/30 p-12 text-center mb-8">
              <Upload className="mx-auto mb-4 text-steel" />
              <p className="text-steel">Drag and drop documents here</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="border border-steel/30 px-8 py-3 uppercase tracking-widest text-xs font-bold">Back</button>
              <button onClick={handleComplete} className="bg-bronze text-concrete px-8 py-3 uppercase tracking-widest text-xs font-bold">Complete</button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
