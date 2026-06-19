import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType, MAX_FILE_SIZE, CHUNK_SIZE, uploadLargeFile } from '../lib/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowRight, Upload, CheckCircle2, MapPin, Phone, Briefcase, FileText, Check, Loader2 } from 'lucide-react';

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Welcome & Checklist
  const [checklist, setChecklist] = useState({
    videoWatched: false,
    readyToStart: false,
  });

  // Step 2: Discovery Questionnaire
  const [projectScope, setProjectScope] = useState({
    scale: 'residential',
    type: '',
    description: '',
    budget: '',
    timeline: ''
  });

  // Once step 3 is done, complete onboarding.
  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Update User Profile
      await updateDoc(doc(db, 'users', userId), {
        needsOnboarding: false,
        updatedAt: serverTimestamp()
      });

      // 2. Initialize Project Record
      await setDoc(doc(db, 'projects', userId), {
        clientId: userId,
        currentPhase: 'Discovery',
        nextActivity: 'Kick-off Call',
        dailySummary: 'Onboarding completed. Awaiting kick-off call.',
        budgetUtilized: 0,
        totalBudget: 0,
        costEstimation: projectScope.budget,
        daysRemaining: 0,
        updatedAt: serverTimestamp(),
        scope: projectScope,
        selectedMaterial: 'no material', 
        progress: 0
      });

      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const canProgressStep1 = checklist.videoWatched && checklist.readyToStart;
  const canProgressStep2 = projectScope.type && projectScope.description && projectScope.timeline;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[10000] bg-charcoal/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
    >
      <div className="bg-concrete dark:bg-charcoal p-8 md:p-12 max-w-4xl w-full text-charcoal dark:text-concrete border border-steel/20 shadow-2xl relative overflow-hidden my-auto">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-accent transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-4xl font-light mb-2">Welcome!</h2>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-10">01. Welcome Message & Walkthrough</h3>
              
              <div className="space-y-8 mb-10">
                <p className="font-light text-lg tracking-wide leading-relaxed">
                  We're thrilled to design your vision with you. You've been assigned your own portal to completely streamline your experience. This platform is designed to make your journey smooth, organized, and collaborative.
                </p>

                <div className="aspect-video bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 relative group">
                  <video 
                    className="w-full h-full object-cover"
                    src="/videos/hero.mp4"
                    controls
                    onEnded={() => setChecklist(prev => ({ ...prev, videoWatched: true }))}
                    onPlay={() => setChecklist(prev => ({ ...prev, videoWatched: true }))}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                    {!checklist.videoWatched && <div className="bg-accent/90 text-concrete px-6 py-3 font-mono text-[10px] uppercase tracking-widest">Play Walkthrough Video</div>}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-5 h-5 flex items-center justify-center border transition-all ${checklist.videoWatched ? 'bg-accent border-accent text-concrete' : 'border-steel/50 text-transparent'}`}>
                      <Check size={14} />
                    </div>
                    <input type="checkbox" checked={checklist.videoWatched} onChange={(e) => setChecklist({...checklist, videoWatched: e.target.checked})} className="hidden" />
                    <span className="font-mono text-xs text-steel group-hover:text-charcoal dark:group-hover:text-concrete transition-colors">I have watched the above portal walkthrough video.</span>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-5 h-5 flex items-center justify-center border transition-all ${checklist.readyToStart ? 'bg-accent border-accent text-concrete' : 'border-steel/50 text-transparent'}`}>
                      <Check size={14} />
                    </div>
                    <input type="checkbox" checked={checklist.readyToStart} onChange={(e) => setChecklist({...checklist, readyToStart: e.target.checked})} className="hidden" />
                    <span className="font-mono text-xs text-steel group-hover:text-charcoal dark:group-hover:text-concrete transition-colors">I am ready to confirm everything and begin this project.</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!canProgressStep1}
                className="group w-full max-w-xs bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-10 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-accent dark:hover:bg-accent transition-all disabled:opacity-20 flex items-center justify-center gap-4"
              >
                Next Step
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-4xl font-light mb-2">Discovery.</h2>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-10">03. In-Depth Questionnaire</h3>
              
              <div className="space-y-6 mb-10 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                  {['residential', 'commercial', 'institutional'].map(scale => (
                    <button
                      key={scale}
                      onClick={() => setProjectScope({...projectScope, scale})}
                      className={`py-4 border text-[10px] font-mono uppercase tracking-widest transition-all ${projectScope.scale === scale ? 'bg-accent border-accent text-concrete' : 'border-steel/20 text-steel hover:border-steel/50'}`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Project Typology</label>
                  <input 
                    type="text"
                    value={projectScope.type}
                    onChange={(e) => setProjectScope({...projectScope, type: e.target.value})}
                    placeholder="e.g., Sustainable Luxury Villa, Corporate Office HQ..."
                    className="w-full bg-transparent border-b border-steel/30 py-4 focus:outline-none focus:border-accent font-light text-lg transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Target Timeline & Constraints</label>
                  <input 
                    type="text"
                    value={projectScope.timeline}
                    onChange={(e) => setProjectScope({...projectScope, timeline: e.target.value})}
                    placeholder="e.g., Construction by Dec 2026, Pending Land Approvals..."
                    className="w-full bg-transparent border-b border-steel/30 py-4 focus:outline-none focus:border-accent font-light text-lg transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Detailed Vision & Goals</label>
                  <textarea 
                    value={projectScope.description}
                    onChange={(e) => setProjectScope({...projectScope, description: e.target.value})}
                    placeholder="Describe your goals, requirements, climate strategies, and any specific references..."
                    className="w-full h-32 bg-transparent border border-steel/20 p-4 focus:outline-none focus:border-accent font-light text-sm custom-scrollbar resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-10 py-5 border border-steel/20 uppercase tracking-[0.3em] text-[10px] font-mono hover:bg-steel/5 transition-all text-steel"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!canProgressStep2}
                  className="group flex-1 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-10 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-accent dark:hover:bg-accent transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                >
                  Next Step
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-4xl font-light mb-2">Kick-off Call.</h2>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-10">04. Book Immediate Consultation</h3>
              
              <div className="mb-10 w-full rounded-none overflow-hidden border border-steel/20 bg-white">
                <iframe 
                  src="https://calendly.com/machariag605" 
                  width="100%" 
                  height="600" 
                  frameBorder="0"
                  className="w-full bg-white"
                ></iframe>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-10 py-5 border border-steel/20 uppercase tracking-[0.3em] text-[10px] font-mono hover:bg-steel/5 transition-all text-steel"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleComplete} 
                  disabled={loading}
                  className="group flex-1 bg-accent text-concrete dark:text-charcoal px-10 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(184,134,11,0.2)]"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : (
                    <>
                      Confirm & Generate Project HQ
                      <Check size={14} className="group-hover:scale-110" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

