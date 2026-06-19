import React, { useState, useEffect } from 'react';
import { useCMS, DEFAULT_RESOURCES } from '../lib/cms';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Check, Upload, Loader2, Undo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_EMAILS = [
  "machariag605@gmail.com",
  "danuthiaandassociates@gmail.com"
];

export default function InlineEditorOverlay() {
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
  
  if (!isInsideIframe) {
    return null;
  }

  const { resources, allResources, setResources, updateResource } = useCMS();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string>('');
  const [originValue, setOriginValue] = useState<string>('');
  const [resourceMeta, setResourceMeta] = useState<{
    name: string;
    type: 'image' | 'video' | 'text' | 'link' | 'number';
    group: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Listen to Auth State to only permit editing if an authorized admin is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      // Check hardcoded email list first
      if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
        setIsAdmin(true);
        return;
      }

      // Fallback verification against users collection role field
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error verifying admin role:", err);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Intercept data-cms-key element clicks inside the preview ONLY if authorized admin
  useEffect(() => {
    if (!isAdmin) return;

    const handleCmsElementClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cms-key]');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const key = target.getAttribute('data-cms-key');
        if (key) {
          // Find resource in our meta list
          const existingRes = allResources.find(r => r.key === key) || DEFAULT_RESOURCES.find(r => r.key === key);
          const currentVal = resources[key] || '';
          
          setActiveKey(key);
          setDraftValue(currentVal);
          setOriginValue(currentVal);
          setSaveStatus('idle');
          
          if (existingRes) {
            setResourceMeta({
              name: existingRes.name,
              type: existingRes.type,
              group: existingRes.group
            });
          } else {
            setResourceMeta({
              name: key.replace(/_/g, ' ').toUpperCase(),
              type: 'text',
              group: 'Global'
            });
          }
          
          // Temporary highlight effect in DOM
          const originalOutline = (target as HTMLElement).style.outline;
          const originalOutlineOffset = (target as HTMLElement).style.outlineOffset;
          (target as HTMLElement).style.outline = '2px solid #8e9089';
          (target as HTMLElement).style.outlineOffset = '4px';
          setTimeout(() => {
            (target as HTMLElement).style.outline = originalOutline;
            (target as HTMLElement).style.outlineOffset = originalOutlineOffset;
          }, 800);

          // Tell the parent admin panel which element is being configured so lists are synced
          window.parent.postMessage({ type: 'CMS_EDIT_CLICK', key }, '*');
        }
      }
    };

    window.addEventListener('click', handleCmsElementClick, true);
    return () => window.removeEventListener('click', handleCmsElementClick, true);
  }, [isAdmin, allResources, resources]);

  // Sync draft typing value instantly to the live page preview
  const handleTypingChange = (newVal: string) => {
    setDraftValue(newVal);
    // Optimistic UI updates
    setResources(prev => ({
      ...prev,
      [activeKey!]: newVal
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!activeKey) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `cms/${activeKey}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      handleTypingChange(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Check security permissions.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!activeKey) return;
    setSaveStatus('saving');
    try {
      await updateResource(activeKey, draftValue, 'admin@danuthia.com', resourceMeta || undefined);
      setSaveStatus('saved');
      setTimeout(() => {
        setActiveKey(null);
        setResourceMeta(null);
      }, 1000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  const handleCancel = () => {
    if (!activeKey) return;
    // Revert optimistic changes
    setResources(prev => ({
      ...prev,
      [activeKey]: originValue
    }));
    setActiveKey(null);
    setResourceMeta(null);
  };

  return (
    <>
      {isAdmin && (
        <style>{`
          [data-cms-key] {
            cursor: pointer !important;
            transition: outline 0.2s ease-in-out;
          }
          [data-cms-key]:hover {
            outline: 2px dashed #8e9089 !important;
            outline-offset: 4px;
          }
        `}</style>
      )}
      <AnimatePresence>
        {isAdmin && activeKey && resourceMeta && (
        <div id="inline-cms-editor-popup" className="fixed inset-0 z-[9999] bg-charcoal/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-lg bg-white dark:bg-[#0d0d0f] border border-steel/20 dark:border-steel/40 shadow-2xl p-6 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-steel/10 pb-4 mb-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-charcoal text-white dark:bg-white dark:text-charcoal px-2.5 py-1 rounded-sm">
                  {resourceMeta.group} editor
                </span>
                <h3 className="font-display text-lg font-bold text-charcoal dark:text-concrete mt-2">
                  {resourceMeta.name}
                </h3>
              </div>
              <button 
                onClick={handleCancel}
                className="p-1 px-2 border border-steel/20 text-steel hover:text-charcoal dark:hover:text-concrete transition-colors font-mono text-[10px] uppercase tracking-wider rounded-sm"
              >
                Cancel
              </button>
            </div>

            {/* Input field */}
            <div className="space-y-4 mb-6">
              {(resourceMeta.type === 'text' || resourceMeta.type === 'number') ? (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-steel">Content Text:</label>
                  <textarea
                    rows={6}
                    value={draftValue}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 dark:border-steel/40 p-4 font-sans text-sm text-charcoal dark:text-concrete outline-none focus:border-accent resize-none rounded-none antialiased"
                  />
                </div>
              ) : resourceMeta.type === 'image' || resourceMeta.type === 'video' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-steel">Asset URL:</label>
                    <input
                      type="text"
                      value={draftValue}
                      onChange={(e) => handleTypingChange(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 dark:border-steel/40 p-3 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                    />
                  </div>

                  {/* Drag and drop upload box */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="border border-dashed border-steel/40 hover:border-accent p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center relative group"
                  >
                    <input 
                      type="file" 
                      accept={resourceMeta.type === 'image' ? 'image/*' : 'video/*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-accent" size={24} />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500 font-bold">Uploading file asset...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={20} className="text-steel group-hover:text-charcoal dark:group-hover:text-concrete" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-steel group-hover:text-charcoal dark:group-hover:text-concrete">
                          Drag file here or click to upload
                        </span>
                        <span className="font-sans text-[10px] text-steel/50">Supports JPG, PNG, WEBP, MP4 (Max 10MB)</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-steel">URL / Link Target:</label>
                  <input
                    type="text"
                    value={draftValue}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 dark:border-steel/40 p-3 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-steel/10 pt-4 gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 border border-steel/20 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-charcoal dark:text-concrete font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <Undo size={12} /> Discard Changes
              </button>

              <button
                onClick={handlePublish}
                disabled={saveStatus === 'saving' || draftValue === originValue}
                className={`flex-1 py-3 px-4 font-mono text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${saveStatus === 'saved' ? 'bg-emerald-600 text-white' : saveStatus === 'saving' ? 'bg-amber-600 text-white' : draftValue === originValue ? 'bg-charcoal/5 dark:bg-concrete/5 text-steel opacity-50 cursor-not-allowed border border-steel/10 shadow-none' : 'bg-charcoal text-white hover:bg-black dark:bg-white dark:text-charcoal'}`}
              >
                {saveStatus === 'saved' ? (
                  <><Check size={14} /> Published!</>
                ) : saveStatus === 'saving' ? (
                  <><Loader2 className="animate-spin" size={14} /> Broadcasting...</>
                ) : (
                  <><Check size={14} /> Save & Publish</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </>
  );
}
