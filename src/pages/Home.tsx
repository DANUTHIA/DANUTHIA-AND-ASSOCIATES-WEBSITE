import React, { useState, useEffect } from 'react';
import { ArrowDown, Box, Map, Building2, Quote, ArrowRight, Calendar, ChevronRight, Maximize, CheckCircle, HardHat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
];

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
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
    }, 5000);
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
    <main>
      {/* Section 1: Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)] border-b border-steel/30">
        {/* Left Column */}
        <div className="relative bg-charcoal text-concrete p-8 md:p-16 flex flex-col justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-steel/30">
          {/* Watermark Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.05, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          >
            <Logo className="scale-[3] md:scale-[5] opacity-50 grayscale mix-blend-overlay" />
          </motion.div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 max-w-2xl"
          >
            <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase">
              Designing the Future of African Urban Spaces.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-concrete/80 max-w-md font-light leading-relaxed mb-16">
              Agile, data-driven planning and architectural precision for the next generation of sustainable development in Kenya and beyond.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex items-center gap-4 text-bronze font-medium tracking-widest uppercase text-sm mt-auto">
              <ArrowDown size={20} className="animate-bounce" />
              <span>Scroll to Explore</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column: Cinematic Image Slider */}
        <div className="bg-charcoal p-4 md:p-8 flex items-center justify-center min-h-[50vh] lg:min-h-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full h-full min-h-[400px] border border-bronze/30 shadow-[0_0_40px_rgba(157,138,94,0.15)] flex items-center justify-center relative overflow-hidden group rounded-sm"
          >
            {/* Image Crossfade */}
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentImageIndex}
                src={HERO_IMAGES[currentImageIndex]}
                alt="Architectural Showcase"
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-80"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/30 pointer-events-none"></div>
            
            {/* Simulated Grid Background Overlay */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>

            {/* Floating UI Elements */}
            <div className="absolute top-4 left-4 bg-charcoal/90 backdrop-blur-sm border border-steel/30 p-3 text-xs font-mono text-concrete uppercase tracking-widest flex items-center gap-3 z-10 pointer-events-none">
              <div className="flex gap-1">
                {HERO_IMAGES.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 transition-all duration-500 ${idx === currentImageIndex ? 'w-4 bg-bronze' : 'w-1 bg-steel'}`}
                  />
                ))}
              </div>
              Featured Projects
            </div>

            <div className="absolute bottom-4 right-4 bg-charcoal/90 backdrop-blur-sm border border-steel/30 p-2 text-steel hover:text-bronze transition-colors z-10 cursor-pointer">
              <Maximize size={16} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Expertise & Software Capabilities */}
      <motion.section 
        id="expertise" 
        className="border-b border-steel/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-steel/30 border-y border-steel/30">
          {/* Card 1 */}
          <motion.div variants={fadeInUp} className="bg-steel text-concrete p-8 md:p-12 relative group hover:bg-charcoal transition-colors duration-500 overflow-hidden">
            <div className="absolute top-8 right-8 text-concrete/30 group-hover:text-bronze group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Box size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-16 pr-8 relative z-10 group-hover:translate-x-2 transition-transform duration-300">
              Architectural Drafting
            </h2>
            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              {['ArchiCAD', 'Revit', 'AutoCAD'].map(tag => (
                <span key={tag} className="px-3 py-1 border border-concrete/20 text-xs uppercase tracking-wider group-hover:border-bronze/50 group-hover:text-bronze transition-colors duration-300">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={fadeInUp} className="bg-steel text-concrete p-8 md:p-12 relative group hover:bg-charcoal transition-colors duration-500 overflow-hidden">
            <div className="absolute top-8 right-8 text-concrete/30 group-hover:text-bronze group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
              <Building2 size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-16 pr-8 relative z-10 group-hover:translate-x-2 transition-transform duration-300">
              Urban & Regional Planning
            </h2>
            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              {['Master Planning', 'Zoning'].map(tag => (
                <span key={tag} className="px-3 py-1 border border-concrete/20 text-xs uppercase tracking-wider group-hover:border-bronze/50 group-hover:text-bronze transition-colors duration-300">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={fadeInUp} className="bg-steel text-concrete p-8 md:p-12 relative group hover:bg-charcoal transition-colors duration-500 overflow-hidden">
            <div className="absolute top-8 right-8 text-concrete/30 group-hover:text-bronze group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Map size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-16 pr-8 relative z-10 group-hover:translate-x-2 transition-transform duration-300">
              Spatial Analysis
            </h2>
            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              {['QGIS', 'Geodatabase Design'].map(tag => (
                <span key={tag} className="px-3 py-1 border border-concrete/20 text-xs uppercase tracking-wider group-hover:border-bronze/50 group-hover:text-bronze transition-colors duration-300">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={fadeInUp} className="bg-steel text-concrete p-8 md:p-12 relative group hover:bg-charcoal transition-colors duration-500 overflow-hidden">
            <div className="absolute top-8 right-8 text-concrete/30 group-hover:text-bronze group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
              <HardHat size={24} />
            </div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-16 pr-8 relative z-10 group-hover:translate-x-2 transition-transform duration-300">
              Construction Management
            </h2>
            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
              {['Site Supervision', 'Cost Control'].map(tag => (
                <span key={tag} className="px-3 py-1 border border-concrete/20 text-xs uppercase tracking-wider group-hover:border-bronze/50 group-hover:text-bronze transition-colors duration-300">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 3: Project & Research Archive */}
      <motion.section 
        id="research" 
        className="border-b border-steel/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-steel/30">
          <motion.div variants={fadeInUp} className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-steel/30 col-span-1 md:col-span-2 lg:col-span-1 flex items-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter">
              Project & Research Archive
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="p-8 md:p-12 col-span-1 md:col-span-2 lg:col-span-2 flex items-center">
            <p className="text-lg text-charcoal/70 max-w-2xl">
              Evidence-based design. Exploring the intersection of topography, conservation, and public infrastructure through rigorous spatial data.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-steel/30">
          {/* Project 1 */}
          <Link to="/portfolio" className="group cursor-pointer block">
            <motion.div variants={fadeInUp} className="h-full flex flex-col">
              <div className="aspect-square relative overflow-hidden bg-charcoal">
                <motion.img 
                  whileHover={{ scale: 1.15, filter: 'brightness(1.1) contrast(1.1)' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" 
                  alt="Ahero Flood Mitigation" 
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none group-hover:border-bronze/50 transition-colors duration-500"></div>
              </div>
              <div className="p-6 border-t border-steel/30 bg-concrete group-hover:bg-charcoal group-hover:text-concrete transition-colors duration-300 flex-grow">
                <h3 className="font-display font-bold text-xl uppercase mb-2 group-hover:text-bronze transition-colors">Ahero Flood Mitigation</h3>
                <p className="text-sm font-mono text-steel group-hover:text-concrete/70 uppercase tracking-wider transition-colors">Topographical drainage analysis</p>
              </div>
            </motion.div>
          </Link>

          {/* Project 2 */}
          <Link to="/portfolio" className="group cursor-pointer block">
            <motion.div variants={fadeInUp} className="h-full flex flex-col">
              <div className="aspect-square relative overflow-hidden bg-charcoal">
                <motion.img 
                  whileHover={{ scale: 1.15, filter: 'brightness(1.1) contrast(1.1)' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=800&auto=format&fit=crop" 
                  alt="Maseno Environmental Conservation" 
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none group-hover:border-bronze/50 transition-colors duration-500"></div>
              </div>
              <div className="p-6 border-t border-steel/30 bg-concrete group-hover:bg-charcoal group-hover:text-concrete transition-colors duration-300 flex-grow">
                <h3 className="font-display font-bold text-xl uppercase mb-2 group-hover:text-bronze transition-colors">Maseno Environmental Conservation</h3>
                <p className="text-sm font-mono text-steel group-hover:text-concrete/70 uppercase tracking-wider transition-colors">Land-use mapping</p>
              </div>
            </motion.div>
          </Link>

          {/* Project 3 */}
          <Link to="/portfolio" className="group cursor-pointer block">
            <motion.div variants={fadeInUp} className="h-full flex flex-col">
              <div className="aspect-square relative overflow-hidden bg-charcoal">
                <motion.img 
                  whileHover={{ scale: 1.15, filter: 'brightness(1.1) contrast(1.1)' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop" 
                  alt="Public Parks Construction Management" 
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none group-hover:border-bronze/50 transition-colors duration-500"></div>
              </div>
              <div className="p-6 border-t border-steel/30 bg-concrete group-hover:bg-charcoal group-hover:text-concrete transition-colors duration-300 flex-grow">
                <h3 className="font-display font-bold text-xl uppercase mb-2 group-hover:text-bronze transition-colors">Public Parks Network</h3>
                <p className="text-sm font-mono text-steel group-hover:text-concrete/70 uppercase tracking-wider transition-colors">GIS Feature class mapping</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Section 4: Vision & Philosophy */}
      <motion.section 
        id="reviews" 
        className="border-b border-steel/30 bg-concrete overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="p-8 md:p-12 border-b border-steel/30">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tighter">Vision & Philosophy</h2>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory divide-x divide-steel/30">
          {[
            {
              text: "First life, then spaces, then buildings – the other way around never works.",
              author: "Jan Gehl",
              org: "Urban Designer"
            },
            {
              text: "Cities have the capability of providing something for everybody, only because, and only when, they are created by everybody.",
              author: "Jane Jacobs",
              org: "Urbanist & Activist"
            },
            {
              text: "Architecture should speak of its time and place, but yearn for timelessness.",
              author: "Frank Gehry",
              org: "Architect"
            }
          ].map((review, idx) => (
            <div key={idx} className="min-w-[85vw] md:min-w-[50vw] lg:min-w-[33.333vw] p-8 md:p-16 snap-start flex flex-col justify-between group hover:bg-steel/5 transition-colors duration-300">
              <div>
                <Quote size={48} className="text-bronze mb-8 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                <p className="font-display text-2xl md:text-3xl leading-tight mb-12">
                  "{review.text}"
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-sm">{review.author}</p>
                <p className="text-steel font-mono text-xs uppercase mt-1">{review.org}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* Section 5: Booking, Contact & Support */}
      <motion.section 
        id="support" 
        className="grid grid-cols-1 lg:grid-cols-2 border-b border-steel/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Left Column: Contact */}
        <motion.div variants={fadeInUp} className="p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-steel/30 bg-concrete flex flex-col">
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-12">
            Partner<br/>With Us.
          </h2>
          
          <div className="space-y-8 mb-16 flex-grow">
            <div className="group">
              <p className="text-xs font-mono text-steel uppercase tracking-widest mb-2 group-hover:text-bronze transition-colors">Headquarters</p>
              <p className="text-xl font-medium">Nairobi, Kenya</p>
            </div>
            
            <div className="group">
              <p className="text-xs font-mono text-steel uppercase tracking-widest mb-2 group-hover:text-bronze transition-colors">Direct Line</p>
              <a href="tel:0715795589" className="text-xl font-medium hover:text-bronze transition-colors inline-block hover:translate-x-2">0715 795 589</a>
            </div>
            
            <div className="group">
              <p className="text-xs font-mono text-steel uppercase tracking-widest mb-2 group-hover:text-bronze transition-colors">Official Email</p>
              <a href="mailto:danuthiaandassociates@gmail.com" className="text-xl font-medium hover:text-bronze transition-colors break-all inline-block hover:translate-x-2">danuthiaandassociates@gmail.com</a>
            </div>
          </div>

          {/* Removed Client Portal link to avoid dead ends, replaced with a link to Portfolio */}
          <Link to="/portfolio" className="inline-flex items-center justify-between p-6 border border-charcoal hover:bg-charcoal hover:text-concrete transition-all duration-300 group">
            <span className="font-bold uppercase tracking-widest">View Our Work</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {/* Right Column: Booking */}
        <motion.div variants={fadeInUp} id="book" className="p-8 md:p-16 bg-charcoal text-concrete flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-3xl font-bold uppercase tracking-tight">
                Consultation Booking
              </h3>
            </div>
            
            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-steel/10 border border-bronze/30 p-8 text-center"
              >
                <CheckCircle size={48} className="text-bronze mx-auto mb-6" />
                <h4 className="font-display text-2xl font-bold uppercase mb-4">Request Received</h4>
                <p className="text-concrete/80 font-light mb-8">
                  Thank you. We have received your consultation request and will be in touch shortly to confirm the details.
                </p>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="text-bronze hover:text-white uppercase tracking-widest font-bold text-sm transition-colors border-b border-bronze pb-1"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 text-sm">
                    {submitError}
                  </div>
                )}
                
                <div className="space-y-2 group">
                  <label className="text-xs font-mono text-steel uppercase tracking-widest group-focus-within:text-bronze transition-colors">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent border-b border-steel/50 py-3 focus:outline-none focus:border-bronze transition-colors text-lg"
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-mono text-steel uppercase tracking-widest group-focus-within:text-bronze transition-colors">Project Scale</label>
                  <select 
                    value={projectScale}
                    onChange={(e) => setProjectScale(e.target.value)}
                    className="w-full bg-transparent border-b border-steel/50 py-3 focus:outline-none focus:border-bronze transition-colors text-lg appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled className="text-charcoal">Select scale...</option>
                    <option value="residential" className="text-charcoal">Residential</option>
                    <option value="commercial" className="text-charcoal">Commercial</option>
                    <option value="regional" className="text-charcoal">Regional / Master Plan</option>
                  </select>
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-mono text-steel uppercase tracking-widest group-focus-within:text-bronze transition-colors">Preferred Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-transparent border-b border-steel/50 py-3 focus:outline-none focus:border-bronze transition-colors text-lg appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                      required
                    />
                    <Calendar size={20} className="absolute right-0 top-1/2 -translate-y-1/2 text-steel pointer-events-none group-focus-within:text-bronze transition-colors" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-bronze text-white py-4 font-bold uppercase tracking-widest hover:bg-bronze/90 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mt-8 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                  {!isSubmitting && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}
