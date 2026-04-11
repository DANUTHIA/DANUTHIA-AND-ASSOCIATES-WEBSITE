import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Box, Map, Building2, Quote, ArrowRight, Calendar, ChevronRight, Maximize, CheckCircle, HardHat, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useLocation, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Magnetic from '../components/Magnetic';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

const HERO_VIDEO = "/input_file_0.mp4";

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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationState, setLocationState] = useState('');
  const [projectType, setProjectType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, 'testimonials'),
          where('approved', '==', true),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const tests: any[] = [];
        querySnapshot.forEach((doc) => {
          tests.push({ id: doc.id, ...doc.data() });
        });
        setTestimonials(tests);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (location.hash === '#book') {
      setTimeout(() => {
        const element = document.getElementById('book');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !locationState || !projectType || !preferredDate || !description) {
      setSubmitError('Please fill out all fields.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await addDoc(collection(db, 'bookingRequests'), {
        userId: 'anonymous',
        fullName,
        email,
        phone,
        location: locationState,
        projectType,
        preferredDate,
        description,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Trigger email notification
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, phone, location: locationState, projectType, preferredDate, description })
        });
        
        // Also send thank you to the user if they provided an email
        if (email.includes('@')) {
          await fetch('/api/send-thank-you', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: fullName })
          });
        }
      } catch (err) {
        console.error("Email notification failed, but booking was saved.", err);
      }

      setSubmitSuccess(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setLocationState('');
      setProjectType('');
      setPreferredDate('');
      setDescription('');
    } catch (error) {
      setSubmitError('Failed to submit request. Please try again.');
      handleFirestoreError(error, OperationType.CREATE, 'bookingRequests');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-concrete dark:bg-charcoal transition-colors duration-500 bg-blueprint-grid">
      {/* Section 1: Hero - Full Bleed Brutalist */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-charcoal">
        <motion.div style={{ y }} className="absolute inset-0 w-full h-[130%] -top-[15%]">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50 pointer-events-none"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl"
          >
            <motion.h1 variants={fadeInUp} className="font-display text-6xl md:text-8xl lg:text-[8rem] font-bold leading-[0.85] tracking-tighter mb-8 text-concrete uppercase">
              Danuthia <br/> & Co.
            </motion.h1>
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-concrete/20 pt-8">
              <p className="text-lg md:text-2xl text-concrete/80 font-light leading-relaxed max-w-xl">
                Agile, data-driven planning and architectural precision for the next generation of sustainable development.
              </p>
              <div className="flex items-center gap-6">
                <Link to="/portfolio" className="group flex items-center justify-center w-16 h-16 rounded-none border border-concrete/30 hover:border-bronze hover:bg-bronze transition-all duration-500">
                  <ArrowRight size={20} className="text-concrete group-hover:translate-x-1 transition-transform duration-500" />
                </Link>
                <span className="text-xs font-mono uppercase tracking-widest text-concrete/50">Explore Work</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Expertise - Brutalist Grid */}
      <motion.section 
        id="expertise" 
        className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-16 border-b border-charcoal dark:border-concrete pb-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete transition-colors duration-500">Core Capabilities</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-l border-t border-charcoal dark:border-concrete">
          {[
            { title: "Architectural Drafting", icon: Box, tags: ['ArchiCAD', 'Revit', 'AutoCAD'] },
            { title: "Urban & Regional Planning", icon: Building2, tags: ['Master Planning', 'Zoning'] },
            { title: "Spatial Analysis", icon: Map, tags: ['QGIS', 'Geodatabase Design'] },
            { title: "Construction Management", icon: HardHat, tags: ['Site Supervision', 'Cost Control'] },
            { title: "Project Management", icon: ClipboardList, tags: ['Agile', 'Scheduling', 'Quality Assurance'] }
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="group flex flex-col p-8 border-r border-b border-charcoal dark:border-concrete hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-colors duration-300">
              <div className="mb-8 text-bronze">
                <item.icon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-4">{item.title}</h3>
              <div className="flex flex-wrap gap-2 mt-auto">
                {item.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-mono uppercase tracking-widest border border-current px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 2.5: Blueprint to Reality */}
      <motion.section 
        className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto border-t border-charcoal dark:border-concrete transition-colors duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-16 max-w-3xl">
          <p className="text-bronze tracking-[0.2em] text-xs font-mono uppercase mb-4">The Process</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-6 transition-colors duration-500">
            We transform blueprints to reality
          </h2>
          <p className="text-charcoal/70 dark:text-concrete/70 font-mono text-sm leading-relaxed transition-colors duration-500">
            Experience our journey from raw architectural concepts to photorealistic finished environments. Drag the slider to reveal the transformation.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="overflow-hidden border border-charcoal dark:border-concrete">
          <BeforeAfterSlider 
            beforeImage="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2000&auto=format&fit=crop"
            afterImage="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2000&auto=format&fit=crop"
            beforeLabel="Raw Space"
            afterLabel="Finished Interior"
          />
        </motion.div>
      </motion.section>

      {/* Section 2.75: Global Impact Metrics */}
      <motion.section 
        className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto border-t border-charcoal dark:border-concrete transition-colors duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-16">
          <p className="text-bronze tracking-[0.2em] text-xs font-mono uppercase mb-4">Firm Impact</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-6 transition-colors duration-500">
            Global Scale & Metrics
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-l border-charcoal/20 dark:border-concrete/20">
          {[
            { label: "Total SQM Developed", value: "130,200", suffix: "+" },
            { label: "Active Sites", value: "04", suffix: "" },
            { label: "Sustainable Certifications", value: "12", suffix: "" },
            { label: "Years of Excellence", value: "3", suffix: "" }
          ].map((metric, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp} 
              className="border-r border-b border-charcoal/20 dark:border-concrete/20 p-8 flex flex-col justify-between min-h-[200px] hover:bg-charcoal/5 dark:hover:bg-concrete/5 transition-colors"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-charcoal/60 dark:text-concrete/60 mb-8">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-6xl font-bold text-charcoal dark:text-concrete tracking-tighter">{metric.value}</span>
                <span className="font-display text-3xl font-bold text-bronze">{metric.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 2.8: Project Stories (HOK Style) */}
      <motion.section 
        className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto border-t border-charcoal dark:border-concrete transition-colors duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div variants={fadeInUp} className="max-w-2xl">
            <p className="text-bronze tracking-[0.2em] text-xs font-mono uppercase mb-4">Narratives</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">Project<br/>Stories.</h2>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link to="/portfolio" className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-bronze hover:text-charcoal dark:hover:text-concrete transition-colors group">
              Explore All Stories <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            {
              title: "Designing for Resilience in Nairobi's Tech Sector",
              desc: "How the Nairobi Tech Hub is setting a new standard for sustainable commercial architecture in East Africa.",
              img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
              category: "Commercial"
            },
            {
              title: "The Future of Transit: Mombasa's Wave Terminals",
              desc: "Exploring the intersection of aerodynamic engineering and tropical urbanism in our latest infrastructure project.",
              img: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=1200&auto=format&fit=crop",
              category: "Infrastructure"
            }
          ].map((story, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden mb-6 relative">
                <img 
                  src={story.img} 
                  alt={story.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 bg-bronze text-charcoal px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-bold">
                  {story.category}
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete group-hover:text-bronze transition-colors mb-4">
                {story.title}
              </h3>
              <p className="text-charcoal/60 dark:text-concrete/60 font-mono text-xs leading-relaxed mb-6">
                {story.desc}
              </p>
              <div className="h-[1px] w-0 group-hover:w-full bg-bronze transition-all duration-700"></div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 3: Project Archive - Brutalist Grid */}
      <motion.section 
        id="research" 
        className="bg-charcoal dark:bg-charcoal text-concrete py-24 md:py-32 transition-colors duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-concrete/20 pb-8">
            <motion.div variants={fadeInUp} className="max-w-2xl">
              <p className="text-bronze tracking-[0.2em] text-xs font-mono uppercase mb-4">Selected Works</p>
              <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight">Project & Research Archive</h2>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link to="/portfolio" className="inline-flex items-center gap-4 text-xs font-mono uppercase tracking-widest hover:text-bronze transition-colors group border border-concrete px-6 py-3">
                View All Projects
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-concrete/20">
            {[
              { title: "Ahero Flood Mitigation", category: "Topographical drainage analysis", img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop" },
              { title: "Maseno Environmental", category: "Land-use mapping", img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop" },
              { title: "Public Parks Network", category: "GIS Feature class mapping", img: "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=800&auto=format&fit=crop" }
            ].map((project, idx) => (
              <Link to="/portfolio" key={idx} className="group cursor-pointer block border-r border-b border-concrete/20 p-8 hover:bg-concrete hover:text-charcoal transition-colors duration-300">
                <motion.div variants={fadeInUp} className="flex flex-col h-full">
                  <div className="aspect-[3/4] relative overflow-hidden mb-6 border border-current">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      src={project.img} 
                      alt={project.title} 
                      className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">{project.title}</h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest mt-auto pt-4 border-t border-current/20">{project.category}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 4: Vision & Philosophy - Stark Quote */}
      <motion.section 
        id="reviews" 
        className="py-24 md:py-32 px-4 md:px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center mb-20 max-w-4xl mx-auto border border-charcoal dark:border-concrete p-12 md:p-24">
          <Quote size={40} className="text-bronze mx-auto mb-12" />
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-12 text-balance text-charcoal dark:text-concrete transition-colors duration-500">
            "First life, then spaces, then buildings – the other way around never works."
          </h2>
          <div className="flex flex-col items-center border-t border-charcoal/20 dark:border-concrete/20 pt-8">
            <p className="text-sm font-bold uppercase tracking-widest text-charcoal dark:text-concrete transition-colors duration-500">Jan Gehl</p>
            <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mt-2 transition-colors duration-500">Urban Designer</p>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        {!loadingTestimonials && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-charcoal dark:border-concrete">
            {testimonials.map((test) => (
              <motion.div 
                key={test.id}
                variants={fadeInUp}
                className="bg-concrete dark:bg-charcoal p-8 border-r border-b border-charcoal dark:border-concrete relative group"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < test.rating ? 'text-bronze' : 'text-charcoal/20 dark:text-concrete/20'}>★</span>
                  ))}
                </div>
                <p className="text-charcoal dark:text-concrete font-mono text-sm mb-8 leading-relaxed uppercase">
                  "{test.comment}"
                </p>
                <div className="flex items-center justify-between border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                  <div>
                    <p className="text-sm font-bold uppercase text-charcoal dark:text-concrete">{test.clientName}</p>
                    <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mt-1">{test.projectType}</p>
                  </div>
                  <CheckCircle size={16} className="text-bronze" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Section 5: Booking & Contact - Brutalist Split Layout */}
      <motion.section 
        id="support" 
        className="border-t border-charcoal dark:border-concrete transition-colors duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Contact Info */}
          <motion.div variants={fadeInUp} className="p-12 md:p-24 bg-concrete dark:bg-charcoal flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-charcoal dark:border-concrete transition-colors duration-500">
            <h2 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-16 text-charcoal dark:text-concrete transition-colors duration-500">
              Partner With Us
            </h2>
            
            <div className="space-y-12">
              <div className="border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Headquarters</p>
                <p className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete transition-colors duration-500">Nairobi, Kenya</p>
              </div>
              
              <div className="border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Direct Line</p>
                <a href="tel:0715795589" className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete hover:text-bronze dark:hover:text-bronze transition-colors duration-500">0715 795 589</a>
              </div>
              
              <div className="border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Official Email</p>
                <a href="mailto:danuthiaandassociates@gmail.com" className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete hover:text-bronze dark:hover:text-bronze transition-colors duration-500 break-all">danuthiaandassociates@gmail.com</a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Booking Form */}
          <motion.div variants={fadeInUp} id="book" className="p-12 md:p-24 bg-charcoal dark:bg-charcoal text-concrete flex flex-col justify-center transition-colors duration-500">
            <div className="max-w-md w-full mx-auto">
              <h3 className="font-display text-4xl font-bold uppercase tracking-tight mb-12">
                Consultation Booking
              </h3>
              
              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 border border-concrete p-8"
                >
                  <CheckCircle size={48} className="text-bronze mx-auto mb-6" />
                  <h4 className="font-display text-3xl font-bold uppercase tracking-tight mb-4">Request Received</h4>
                  <p className="text-concrete/70 font-mono text-sm mb-12">
                    Thank you. We have received your consultation request and will be in touch shortly to confirm the details.
                  </p>
                  <Magnetic>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="text-[10px] font-mono uppercase tracking-widest text-bronze hover:text-concrete transition-colors pb-1 border-b border-bronze/30 hover:border-concrete"
                    >
                      Submit Another Request
                    </button>
                  </Magnetic>
                </motion.div>
              ) : (
                <form className="space-y-10" onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="text-bronze text-[10px] font-mono uppercase border border-bronze p-4">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Full Name"
                        id="fullName"
                        required
                      />
                      <label htmlFor="fullName" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-bronze">
                        Full Name
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Email Address"
                        id="email"
                        required
                      />
                      <label htmlFor="email" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-bronze">
                        Email Address
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Phone Number"
                        id="phone"
                        required
                      />
                      <label htmlFor="phone" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-bronze">
                        Phone Number
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="text" 
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Project Location"
                        id="location"
                        required
                      />
                      <label htmlFor="location" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-bronze">
                        Project Location
                      </label>
                    </div>

                    <div className="relative group md:col-span-2">
                      <select 
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg appearance-none cursor-pointer peer rounded-none"
                        required
                      >
                        <option value="" disabled className="text-charcoal bg-concrete">Select project type...</option>
                        <option value="new-build" className="text-charcoal bg-concrete">New Build</option>
                        <option value="renovation" className="text-charcoal bg-concrete">Renovation</option>
                        <option value="interior-design" className="text-charcoal bg-concrete">Interior Design</option>
                        <option value="master-planning" className="text-charcoal bg-concrete">Master Planning</option>
                      </select>
                      <label className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest peer-focus:text-bronze transition-colors">
                        Project Type
                      </label>
                    </div>

                    <div className="relative group md:col-span-2">
                      <input 
                        type="date" 
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full peer rounded-none"
                        required
                      />
                      <label className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest peer-focus:text-bronze transition-colors">
                        Preferred Date
                      </label>
                      <Calendar size={20} className="absolute right-0 top-3 text-concrete/30 pointer-events-none peer-focus:text-bronze transition-colors" />
                    </div>

                    <div className="relative group md:col-span-2">
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-bronze transition-colors text-lg peer placeholder-transparent rounded-none resize-none h-24 custom-scrollbar"
                        placeholder="Project Description"
                        id="description"
                        required
                      />
                      <label htmlFor="description" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-bronze">
                        Project Description & Vision
                      </label>
                    </div>
                  </div>

                  <Magnetic className="w-full">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full border border-bronze text-bronze py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-bronze hover:text-charcoal transition-all duration-500 mt-12 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                      {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
                    </button>
                  </Magnetic>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
