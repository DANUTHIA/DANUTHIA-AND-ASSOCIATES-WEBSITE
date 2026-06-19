import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, User, Mail, Briefcase, MapPin } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Book() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    projectScale: 'Residential',
    location: '',
    preferredDate: '',
    preferredTime: 'Morning (9AM - 12PM)',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Save to Firestore Leads (Admin Dashboard)
      await addDoc(collection(db, 'leads'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });

      // 2. Send Email Notification to Admin & Confirmation to Client
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      await fetch('/api/send-thank-you', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      setIsSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-32 pb-24 px-6 lg:px-16 max-w-7xl mx-auto min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tighter mb-6 text-charcoal dark:text-concrete">
            Book a Consultation
          </h1>
          <p className="text-steel font-light text-lg">
            Schedule an initial discovery meeting with our principal architects to map out the vision, viability, and scope of your next project.
          </p>
        </motion.div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-accent/10 border border-accent/20 p-12 text-center"
          >
            <CalendarIcon className="w-16 h-16 text-accent mx-auto mb-6" />
            <h2 className="font-display text-3xl text-charcoal dark:text-concrete mb-4">Request Received</h2>
            <p className="text-steel font-light mb-8">
              Thank you, {formData.fullName.split(' ')[0]}. We have successfully received your consultation request. Our admin team will review your project details and contact you shortly to confirm the appointment.
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-[10px] font-mono text-accent uppercase tracking-widest hover:text-charcoal dark:hover:text-concrete transition-colors"
            >
              Book Another Session
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
                <label className="text-[10px] items-center gap-2 font-mono text-steel uppercase tracking-widest flex mb-2">
                  <User size={12} /> Full Name
                </label>
                <input 
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
                <label className="text-[10px] items-center gap-2 font-mono text-steel uppercase tracking-widest flex mb-2">
                  <Mail size={12} /> Email Address
                </label>
                <input 
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
                <label className="text-[10px] items-center gap-2 font-mono text-steel uppercase tracking-widest flex mb-2">
                  <Briefcase size={12} /> Project Scale
                </label>
                <select 
                  name="projectScale"
                  value={formData.projectScale}
                  onChange={handleChange}
                  className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light appearance-none cursor-pointer"
                >
                  <option className="text-charcoal bg-concrete">Residential</option>
                  <option className="text-charcoal bg-concrete">Commercial / Corporate</option>
                  <option className="text-charcoal bg-concrete">Public / Masterplan</option>
                  <option className="text-charcoal bg-concrete">Interior Styling</option>
                </select>
              </div>
              <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
                <label className="text-[10px] items-center gap-2 font-mono text-steel uppercase tracking-widest flex mb-2">
                  <MapPin size={12} /> Project Location
                </label>
                <input 
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
                <label className="text-[10px] items-center gap-2 font-mono text-steel uppercase tracking-widest flex mb-2">
                  <CalendarIcon size={12} /> Target Date
                </label>
                <input 
                  required
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light"
                />
              </div>
              <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
                <label className="text-[10px] items-center gap-2 font-mono text-steel uppercase tracking-widest flex mb-2">
                  <Clock size={12} /> Preferred Time
                </label>
                <select 
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light appearance-none cursor-pointer"
                >
                  <option className="text-charcoal bg-concrete">Morning (9AM - 12PM)</option>
                  <option className="text-charcoal bg-concrete">Afternoon (12PM - 4PM)</option>
                  <option className="text-charcoal bg-concrete">Late (4PM - 6PM)</option>
                </select>
              </div>
            </div>

            <div className="border-b border-steel/20 dark:border-concrete/20 pb-2">
              <label className="text-[10px] font-mono text-steel uppercase tracking-widest block mb-4">
                Brief Description of Vision
              </label>
              <textarea 
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full bg-transparent text-charcoal dark:text-concrete outline-none font-light resize-none"
                placeholder="What are you hoping to achieve with this project...?"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 text-xs font-mono uppercase tracking-[0.2em] bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal hover:bg-accent dark:hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Requesting Appointment...' : 'Submit Booking Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
