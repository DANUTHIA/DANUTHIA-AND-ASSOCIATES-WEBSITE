import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [reviewForm, setReviewForm] = useState({
    clientName: '',
    projectType: '',
    comment: '',
    rating: 5,
    email: ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.clientName || !reviewForm.comment || !reviewForm.email) {
      setSubmitError('Please fill in required fields');
      return;
    }
    
    setReviewSubmitting(true);
    setSubmitError('');
    
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...reviewForm,
        approved: false,
        createdAt: serverTimestamp()
      });
      setReviewSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setReviewSubmitSuccess(false);
        setReviewForm({ clientName: '', projectType: '', comment: '', rating: 5, email: '' });
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials');
      setSubmitError('Failed to submit review. Try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 dark:bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-concrete dark:bg-charcoal border border-charcoal dark:border-concrete w-full max-w-lg relative p-8 md:p-12"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-charcoal/50 hover:text-charcoal dark:text-concrete/50 dark:hover:text-concrete transition-colors"
            >
              <X size={24} strokeWidth={1} />
            </button>

            <h2 className="font-display text-2xl font-light uppercase tracking-tight text-charcoal dark:text-concrete mb-2">Share Your Experience</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-charcoal/60 dark:text-concrete/60 mb-8 border-b border-charcoal/10 dark:border-concrete/10 pb-4">
              Internal Client Feedback Portal
            </p>

            {reviewSubmitSuccess ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-6 border border-green-200 dark:border-green-800/50 flex flex-col items-center justify-center space-y-4">
                <CheckCircle size={32} />
                <p className="font-mono text-sm uppercase tracking-widest text-center">Review Submitted</p>
                <p className="font-sans text-sm text-center">Thank you. Your feedback is under review by our team.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                {submitError && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 font-mono text-[10px] uppercase tracking-widest border border-red-200 dark:border-red-800/50">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-mono text-charcoal/60 dark:text-concrete/60 uppercase tracking-widest mb-2">Client Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={reviewForm.clientName}
                      onChange={(e) => setReviewForm(prev => ({...prev, clientName: e.target.value}))}
                      className="w-full bg-transparent border-b border-charcoal/30 dark:border-concrete/30 py-3 font-sans text-sm outline-none focus:border-charcoal dark:focus:border-concrete transition-colors text-charcoal dark:text-concrete"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-charcoal/60 dark:text-concrete/60 uppercase tracking-widest mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm(prev => ({...prev, email: e.target.value}))}
                      className="w-full bg-transparent border-b border-charcoal/30 dark:border-concrete/30 py-3 font-sans text-sm outline-none focus:border-charcoal dark:focus:border-concrete transition-colors text-charcoal dark:text-concrete"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-charcoal/60 dark:text-concrete/60 uppercase tracking-widest mb-2">Project Type (e.g. Master Plan)</label>
                  <input
                    type="text"
                    value={reviewForm.projectType}
                    onChange={(e) => setReviewForm(prev => ({...prev, projectType: e.target.value}))}
                    className="w-full bg-transparent border-b border-charcoal/30 dark:border-concrete/30 py-3 font-sans text-sm outline-none focus:border-charcoal dark:focus:border-concrete transition-colors text-charcoal dark:text-concrete"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-charcoal/60 dark:text-concrete/60 uppercase tracking-widest mb-4">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({...prev, rating: star}))}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={28} 
                          fill={star <= reviewForm.rating ? "currentColor" : "none"} 
                          className={star <= reviewForm.rating ? "text-accent" : "text-charcoal/20 dark:text-concrete/20"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-charcoal/60 dark:text-concrete/60 uppercase tracking-widest mb-2">Your Review <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({...prev, comment: e.target.value}))}
                    className="w-full bg-transparent border-b border-charcoal/30 dark:border-concrete/30 py-3 font-sans text-sm outline-none focus:border-charcoal dark:focus:border-concrete transition-colors resize-none text-charcoal dark:text-concrete custom-scrollbar"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Experience"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
