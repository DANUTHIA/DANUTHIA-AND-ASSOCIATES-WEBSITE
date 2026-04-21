import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType, MAX_FILE_SIZE, CHUNK_SIZE, uploadLargeFile } from '../firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowRight, Upload, CheckCircle2, MapPin, Phone, Briefcase, FileText, Check, Loader2 } from 'lucide-react';

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Profile State
  const [profile, setProfile] = useState({
    officialName: '',
    phone: '',
    location: ''
  });

  // Step 2: Project Scope State
  const [projectScope, setProjectScope] = useState({
    scale: 'residential',
    type: '',
    description: ''
  });

  // Step 3: Documents State
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, data: string, type: string}[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is too large. Max size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. Update User Profile
      await updateDoc(doc(db, 'users', userId), {
        needsOnboarding: false,
        officialName: profile.officialName.trim(),
        phone: profile.phone.trim(),
        location: profile.location.trim(),
        updatedAt: serverTimestamp()
      });

      // 2. Initialize Project Record
      await setDoc(doc(db, 'projects', userId), {
        clientId: userId,
        currentPhase: 'Discovery',
        nextActivity: 'Initial Consultation',
        dailySummary: 'Onboarding completed. Initial scope defined.',
        budgetUtilized: 0,
        totalBudget: 0,
        costEstimation: '',
        daysRemaining: 0,
        updatedAt: serverTimestamp(),
        scope: projectScope,
        selectedMaterial: 'no material', // Default material state
        progress: 0 // Explicit zero progress
      });

      // 3. Upload Documents with Chunking
      for (const file of uploadedFiles) {
        await uploadLargeFile('documents', {
          clientId: userId,
          fileName: file.name,
          fileType: file.type,
          uploadedBy: userId,
        }, file.data);
      }

      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const canProgressStep1 = profile.officialName && profile.phone && profile.location;
  const canProgressStep2 = projectScope.type && projectScope.description;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[10000] bg-charcoal/95 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="bg-concrete dark:bg-charcoal p-8 md:p-12 max-w-2xl w-full text-charcoal dark:text-concrete border border-steel/20 shadow-2xl relative overflow-hidden">
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
              <h2 className="font-display text-4xl font-light mb-2">Establishing Identity.</h2>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-10">Phase 01: Profile Architecture</h3>
              
              <div className="space-y-6 mb-10">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Official Full Name</label>
                  <input 
                    type="text"
                    value={profile.officialName}
                    onChange={(e) => setProfile({...profile, officialName: e.target.value})}
                    placeholder="e.g., Jennifer Ochieng"
                    className="w-full bg-transparent border-b border-steel/30 py-4 focus:outline-none focus:border-accent font-light text-lg transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Primary Phone</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-steel" />
                      <input 
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="+254 700 000 000"
                        className="w-full bg-transparent border-b border-steel/30 py-4 pl-6 focus:outline-none focus:border-accent font-light transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Project Location</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-steel" />
                      <input 
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        placeholder="Nairobi, Kenya"
                        className="w-full bg-transparent border-b border-steel/30 py-4 pl-6 focus:outline-none focus:border-accent font-light transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!canProgressStep1}
                className="group bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-10 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-accent dark:hover:bg-accent transition-all disabled:opacity-20 flex items-center gap-4"
              >
                Proceed to Scale
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
              <h2 className="font-display text-4xl font-light mb-2">Defining Scope.</h2>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-10">Phase 02: Structural Intent</h3>
              
              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-3 gap-4">
                  {['residential', 'commercial', 'regional'].map(scale => (
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
                    placeholder="e.g., Luxury Villa, Health Center, Urban Park..."
                    className="w-full bg-transparent border-b border-steel/30 py-4 focus:outline-none focus:border-accent font-light text-lg transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-steel mb-3">Detailed Vision</label>
                  <textarea 
                    value={projectScope.description}
                    onChange={(e) => setProjectScope({...projectScope, description: e.target.value})}
                    placeholder="Describe your goals, requirements, and any specific architectural references..."
                    className="w-full h-32 bg-transparent border border-steel/20 p-4 focus:outline-none focus:border-accent font-light text-sm custom-scrollbar resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-10 py-5 border border-steel/20 uppercase tracking-[0.3em] text-[10px] font-mono hover:bg-steel/5 transition-all text-steel"
                >
                  Regulate
                </button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!canProgressStep2}
                  className="group flex-1 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal px-10 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-accent dark:hover:bg-accent transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                >
                  Next Phase
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
              <h2 className="font-display text-4xl font-light mb-2">Asset Integration.</h2>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-steel mb-10">Phase 03: Data Synchronization</h3>
              
              <div className="mb-10">
                <label className="block border-2 border-dashed border-steel/20 p-12 text-center cursor-pointer hover:bg-steel/5 transition-all group relative">
                  <input type="file" multiple onChange={handleFileSelect} className="hidden" />
                  <Upload className="mx-auto mb-4 text-steel group-hover:text-accent transition-colors" />
                  <p className="font-display text-lg font-light mb-2">Upload Site Photos & Blueprints</p>
                  <p className="text-steel font-mono text-[10px] uppercase tracking-widest">Supports PDF, JPG, PNG (Max 10MB/file)</p>
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="mt-8 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-steel/5 border border-steel/10">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-accent" />
                          <span className="text-xs font-mono text-steel truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-steel hover:text-red-500 transition-colors"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)} 
                  className="px-10 py-5 border border-steel/20 uppercase tracking-[0.3em] text-[10px] font-mono hover:bg-steel/5 transition-all text-steel"
                >
                  Recalibrate
                </button>
                <button 
                  onClick={handleComplete} 
                  disabled={loading}
                  className="group flex-1 bg-accent text-concrete dark:text-charcoal px-10 py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(184,134,11,0.2)]"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : (
                    <>
                      Establish Protocol
                      <Check size={14} />
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

