import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Box, Map, Building2, Quote, ArrowRight, Calendar, ChevronRight, Maximize, CheckCircle, HardHat } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2000&auto=format&fit=crop"
];

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const location = useLocation();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [projectScale, setProjectScale] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.hash === '#book') {
      const element = document.getElementById('book');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !projectScale || !preferredDate) {
      setSubmitError('Please fill out all fields.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await addDoc(collection(db, 'bookingRequests'), {
        userId: 'anonymous',
        fullName,
        projectScale,
        preferredDate,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Trigger email notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, projectScale, preferredDate })
        });
      } catch (err) {
        console.error("Email notification failed, but booking was saved.", err);
      }

      setSubmitSuccess(true);
      setFullName('');
      setProjectScale('');
      setPreferredDate('');
    } catch (error) {
      setSubmitError('Failed to submit request. Please try again.');
      handleFirestoreError(error, OperationType.CREATE, 'bookingRequests');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-concrete">
      {/* Section 1: Hero - Luxury Editorial Style */}
      <section ref={heroRef} className="relative min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row border-b border-charcoal/20 overflow-hidden">
        
        {/* Left Content */}
        <div className="w-full lg:w-5/12 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative z-10 bg-concrete">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-xl"
          >
            <motion.p variants={fadeInUp} className="text-bronze tracking-[0.2em] text-xs font-bold uppercase mb-6">
              Danuthia & Associates
            </motion.p>
            <motion.h1 variants={fadeInUp} className="font-display text-6xl md:text-7xl lg:text-[5.5rem] font-light leading-[0.9] tracking-tight mb-8 text-charcoal text-balance">
              Designing the <span className="italic">Future</span> of African Urban Spaces.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-base md:text-lg text-charcoal/70 font-light leading-relaxed mb-16 max-w-md">
              Agile, data-driven planning and architectural precision for the next generation of sustainable development in Kenya and beyond.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex items-center gap-6">
              <Link to="/#book" className="group flex items-center justify-center w-16 h-16 rounded-full border border-charcoal/30 hover:border-bronze transition-colors duration-500">
                <ArrowDown size={20} className="text-charcoal group-hover:text-bronze group-hover:translate-y-1 transition-all duration-500" />
              </Link>
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal/50">Scroll to Explore</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Image Slider */}
        <div className="w-full lg:w-7/12 relative h-[60vh] lg:h-auto overflow-hidden">
          <motion.div style={{ y }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentImageIndex}
                src={HERO_IMAGES[currentImageIndex]}
                alt="Architectural Showcase"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          </motion.div>
          <div className="absolute inset-0 bg-charcoal/10 mix-blend-multiply pointer-events-none"></div>
          
          {/* Vertical Text Accent */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 vertical-text text-xs font-mono uppercase tracking-[0.3em] text-concrete/80 mix-blend-difference z-20 pointer-events-none">
            Est. 2024 — Nairobi, Kenya
          </div>
        </div>
      </section>

      {/* Section 2: Expertise - Elegant Grid */}
      <motion.section 
        id="expertise" 
        className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-20 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-light text-charcoal mb-4">Our <span className="italic">Expertise</span></h2>
          <div className="w-12 h-px bg-bronze mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {[
            { title: "Architectural Drafting", icon: Box, tags: ['ArchiCAD', 'Revit', 'AutoCAD'] },
            { title: "Urban & Regional Planning", icon: Building2, tags: ['Master Planning', 'Zoning'] },
            { title: "Spatial Analysis", icon: Map, tags: ['QGIS', 'Geodatabase Design'] },
            { title: "Construction Management", icon: HardHat, tags: ['Site Supervision', 'Cost Control'] }
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="group flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border border-charcoal/10 flex items-center justify-center mb-8 group-hover:border-bronze group-hover:bg-bronze/5 transition-all duration-500">
                <item.icon size={28} className="text-charcoal/50 group-hover:text-bronze transition-colors duration-500" />
              </div>
              <h3 className="font-display text-2xl font-medium mb-4 group-hover:text-bronze transition-colors duration-300">{item.title}</h3>
              <div className="flex flex-wrap justify-center gap-2 mt-auto">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono uppercase tracking-widest text-charcoal/50">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 3: Project Archive - Luxury Editorial */}
      <motion.section 
        id="research" 
        className="bg-charcoal text-concrete py-24 md:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <motion.div variants={fadeInUp} className="max-w-2xl">
              <p className="text-bronze tracking-[0.2em] text-xs font-bold uppercase mb-4">Selected Works</p>
              <h2 className="font-display text-5xl md:text-6xl font-light">Project & <span className="italic">Research</span> Archive</h2>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link to="/portfolio" className="inline-flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-bronze transition-colors group">
                View All Projects
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Ahero Flood Mitigation", category: "Topographical drainage analysis", img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop" },
              { title: "Maseno Environmental", category: "Land-use mapping", img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop" },
              { title: "Public Parks Network", category: "GIS Feature class mapping", img: "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=800&auto=format&fit=crop" }
            ].map((project, idx) => (
              <Link to="/portfolio" key={idx} className="group cursor-pointer block">
                <motion.div variants={fadeInUp} className="flex flex-col">
                  <div className="aspect-[3/4] relative overflow-hidden mb-6">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      src={project.img} 
                      alt={project.title} 
                      className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-display text-2xl font-medium mb-2 group-hover:text-bronze transition-colors">{project.title}</h3>
                  <p className="text-xs font-mono text-concrete/50 uppercase tracking-widest">{project.category}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 4: Vision & Philosophy - Minimalist Quote Slider */}
      <motion.section 
        id="reviews" 
        className="py-24 md:py-32 px-4 md:px-8 max-w-5xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Quote size={40} className="text-bronze/30 mx-auto mb-12" />
          <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-12 text-balance">
            "First life, then spaces, then buildings – the other way around never works."
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest text-charcoal">Jan Gehl</p>
          <p className="text-xs font-mono text-charcoal/50 uppercase tracking-widest mt-2">Urban Designer</p>
        </motion.div>
      </motion.section>

      {/* Section 5: Booking & Contact - Split Luxury Layout */}
      <motion.section 
        id="support" 
        className="border-t border-charcoal/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Contact Info */}
          <motion.div variants={fadeInUp} className="p-12 md:p-24 bg-concrete flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-charcoal/10">
            <h2 className="font-display text-5xl md:text-6xl font-light mb-16">
              Partner <span className="italic">With Us.</span>
            </h2>
            
            <div className="space-y-12">
              <div>
                <p className="text-xs font-mono text-charcoal/50 uppercase tracking-widest mb-3">Headquarters</p>
                <p className="font-display text-2xl">Nairobi, Kenya</p>
              </div>
              
              <div>
                <p className="text-xs font-mono text-charcoal/50 uppercase tracking-widest mb-3">Direct Line</p>
                <a href="tel:0715795589" className="font-display text-2xl hover:text-bronze transition-colors">0715 795 589</a>
              </div>
              
              <div>
                <p className="text-xs font-mono text-charcoal/50 uppercase tracking-widest mb-3">Official Email</p>
                <a href="mailto:danuthiaandassociates@gmail.com" className="font-display text-2xl hover:text-bronze transition-colors break-all">danuthiaandassociates@gmail.com</a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Booking Form */}
          <motion.div variants={fadeInUp} id="book" className="p-12 md:p-24 bg-charcoal text-concrete flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
              <h3 className="font-display text-4xl font-light mb-12">
                Consultation <span className="italic">Booking</span>
              </h3>
              
              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <CheckCircle size={48} className="text-bronze mx-auto mb-6" />
                  <h4 className="font-display text-3xl font-light mb-4">Request Received</h4>
                  <p className="text-concrete/70 font-light mb-12">
                    Thank you. We have received your consultation request and will be in touch shortly to confirm the details.
                  </p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs font-mono uppercase tracking-widest text-bronze hover:text-white transition-colors pb-1 border-b border-bronze/30 hover:border-white"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <form className="space-y-10" onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="text-red-400 text-sm font-mono">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg peer placeholder-transparent"
                      placeholder="Full Name"
                      id="fullName"
                      required
                    />
                    <label htmlFor="fullName" className="absolute left-0 -top-5 text-xs font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-bronze">
                      Full Name
                    </label>
                  </div>

                  <div className="relative group">
                    <select 
                      value={projectScale}
                      onChange={(e) => setProjectScale(e.target.value)}
                      className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg appearance-none cursor-pointer peer"
                      required
                    >
                      <option value="" disabled className="text-charcoal">Select scale...</option>
                      <option value="residential" className="text-charcoal">Residential</option>
                      <option value="commercial" className="text-charcoal">Commercial</option>
                      <option value="regional" className="text-charcoal">Regional / Master Plan</option>
                    </select>
                    <label className="absolute left-0 -top-5 text-xs font-mono text-concrete/50 uppercase tracking-widest peer-focus:text-bronze transition-colors">
                      Project Scale
                    </label>
                  </div>

                  <div className="relative group">
                    <input 
                      type="date" 
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full peer"
                      required
                    />
                    <label className="absolute left-0 -top-5 text-xs font-mono text-concrete/50 uppercase tracking-widest peer-focus:text-bronze transition-colors">
                      Preferred Date
                    </label>
                    <Calendar size={20} className="absolute right-0 top-3 text-concrete/30 pointer-events-none peer-focus:text-bronze transition-colors" />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full border border-bronze text-bronze py-4 font-mono text-xs uppercase tracking-widest hover:bg-bronze hover:text-charcoal transition-all duration-500 mt-12 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                    {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
