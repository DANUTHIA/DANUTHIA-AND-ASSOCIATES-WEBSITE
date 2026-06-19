import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Box, Map, Building2, Quote, ArrowRight, Calendar, ChevronRight, Maximize, CheckCircle, HardHat, ClipboardList, Star } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useLocation, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Magnetic from '../components/Magnetic';
import ReviewModal from '../components/ReviewModal';
import { useCMS } from '../lib/cms';
import { Testimonial } from '../types';

const teamPhotoImg = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const } }
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
  const { resources } = useCMS();
  const location = useLocation();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationState, setLocationState] = useState('');
  const [projectType, setProjectType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

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
      await addDoc(collection(db, 'leads'), {
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
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-concrete dark:bg-charcoal transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-charcoal">
          <img 
            src="https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?q=80&w=2940&auto=format&fit=crop"
            alt="Construction Site"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            data-cms-key="hero_title"
            className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-concrete uppercase tracking-tighter mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {resources.hero_title || 'Danuthia Associates Construction LLc'}
          </motion.h1>
          <motion.p 
            data-cms-key="hero_subtitle"
            className="text-lg md:text-xl text-concrete/80 font-sans font-light max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {resources.hero_subtitle || 'Elevating the human experience through visionary architectural design and strategic structural planning.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Magnetic>
              <Link to="/portfolio" className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-charcoal font-mono text-xs uppercase tracking-widest hover:bg-concrete transition-colors duration-500">
                Explore Projects <ArrowRight size={16} />
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      {/* Company Intro / About Highlights */}
      <section className="py-24 px-8 max-w-7xl mx-auto border-b border-charcoal/10 dark:border-concrete/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 data-cms-key="about_title" className="text-3xl md:text-4xl lg:text-5xl font-display text-charcoal dark:text-concrete uppercase tracking-tight mb-8">
              {resources.about_title || 'Crafting Spaces That Endure.'}
            </h2>
            <p data-cms-key="about_desc_1" className="text-charcoal/70 dark:text-concrete/70 font-sans font-light text-lg leading-relaxed mb-6">
              {resources.about_desc_1 || 'We are a premier architectural and planning firm committed to shaping environments that inspire, function, and stand the test of time. Our holistic approach integrates innovative design with meticulous technical precision.'}
            </p>
            <p data-cms-key="about_desc_2" className="text-charcoal/70 dark:text-concrete/70 font-sans font-light text-lg leading-relaxed mb-10">
              {resources.about_desc_2 || 'From conceptual masterplanning to intricate interior detailing, we collaborate closely with our clients to transform ambitious visions into tangible realities, setting new standards for quality and sustainability.'}
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-charcoal/10 dark:border-concrete/10 pt-8">
              <div>
                <p className="text-3xl lg:text-4xl font-display text-charcoal dark:text-concrete mb-2">15+</p>
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-[0.2em]">Years of Excellence</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-display text-charcoal dark:text-concrete mb-2">120+</p>
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-[0.2em]">Completed Projects</p>
              </div>
            </div>
            <div className="mt-10">
              <Magnetic>
                <Link to="/about" className="inline-flex items-center gap-3 text-[10px] font-mono text-charcoal dark:text-concrete uppercase tracking-[0.2em] hover:text-accent border-b border-charcoal/20 dark:border-concrete/20 pb-1 transition-colors">
                  Read Our Full Story <ArrowRight size={14} />
                </Link>
              </Magnetic>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="relative aspect-[4/5] bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/10 dark:border-concrete/10 p-2 md:p-3 overflow-hidden group"
          >
            <img 
              data-cms-key="about_image_1"
              src={resources.about_image_1 || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"}
              alt="Architectural details"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </motion.div>
        </div>
      </section>

      {/* Dynamic Project Showcase */}
      <section className="py-24 bg-charcoal text-concrete overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="max-w-7xl mx-auto px-8 relative z-10 lg:flex items-center gap-16">
          <div className="lg:w-1/3 mb-12 lg:mb-0">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display uppercase tracking-tight mb-6"
            >
              Selected Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-mono text-xs uppercase tracking-widest text-concrete/50 mb-10 leading-relaxed"
            >
              A curated selection of our most impactful architectural and urban planning projects across the region.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Magnetic>
                <Link to="/portfolio" className="inline-flex items-center gap-4 bg-accent text-charcoal px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors group">
                  Full Portfolio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Magnetic>
            </motion.div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Nairobi Financial Centre", type: "Commercial", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" },
              { title: "Kigali Eco-District", type: "Masterplan", image: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=800&auto=format&fit=crop" },
              { title: "Mombasa Terminal", type: "Infrastructure", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" },
              { title: "Urban Residence", type: "Residential", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop" }
            ].map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group relative aspect-[4/5] overflow-hidden bg-charcoal"
              >
                <Link to="/portfolio">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-x-8 bottom-8">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2 pb-2 border-b border-white/20 inline-block overflow-hidden relative">
                      <span className="block transform translate-y-0 group-hover:-translate-y-full transition-transform duration-500">{p.type}</span>
                      <span className="block absolute top-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 text-white">View Details</span>
                    </p>
                    <h3 className="font-display text-2xl uppercase tracking-tight text-white group-hover:-translate-y-1 transition-transform duration-500">{p.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2.5: Team */}
      <motion.section 
        id="team" 
        className="py-24 md:py-32 px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="flex flex-col gap-12 md:gap-24">
          {/* Team Photo & Intro */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-8 md:gap-12">
            <div className="max-w-3xl">
              <h2 data-cms-key="team_title" className="font-display text-4xl md:text-5xl font-medium tracking-tight text-charcoal dark:text-concrete mb-6 transition-colors duration-500">
                {resources.team_title || 'Our Team'}
              </h2>
              <p data-cms-key="team_desc" className="text-charcoal/60 dark:text-concrete/60 font-sans font-light text-lg leading-relaxed transition-colors duration-500">
                {resources.team_desc || 'Our team of architects, urban planners, and spatial analysts share a common vision: to design spaces that elevate the human experience. With diverse backgrounds and a unified purpose, we bring technical rigor and creative intuition to every project.'}
              </p>
            </div>
            
            <div className="relative aspect-[16/9] lg:aspect-[21/9] bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/20 dark:border-concrete/20 p-2 md:p-3">
              <img data-cms-key="team_image" 
                src={resources.team_image || teamPhotoImg} 
                alt="Danuthia Associates Construction LLc Team" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <p className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-[10px] md:text-xs font-mono text-white/90 bg-charcoal/80 px-2 py-1 md:px-3 md:py-1.5 uppercase mix-blend-difference">The Collective</p>
            </div>
          </motion.div>

          {/* Leadership Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <motion.div variants={fadeInUp} className="md:col-span-5 lg:col-span-4 relative aspect-[3/4] bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/20 dark:border-concrete/20 p-2 md:p-3">
              <img data-cms-key="leadership_member_1_image" 
                src={resources.leadership_member_1_image || "/joseph-macharia.png"} 
                alt={resources.leadership_member_1_name || "Joseph Macharia - CEO"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <p data-cms-key="leadership_member_1_name" className="absolute bottom-4 left-4 md:bottom-5 md:left-5 text-[10px] font-mono text-white/90 bg-charcoal/80 px-2 py-1 md:px-2.5 md:py-1 uppercase mix-blend-difference">{resources.leadership_member_1_name || 'Joseph Macharia'}</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="md:col-span-7 lg:col-span-8 flex flex-col gap-6 md:pl-8">
              <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-charcoal dark:text-concrete mb-2">Leadership</h3>
              <p className="text-charcoal/60 dark:text-concrete/60 font-sans font-light text-base leading-relaxed mb-4 max-w-2xl">
                Guided by visionary leadership, our studio continually pushes the boundaries of spatial design, marrying environmental responsiveness with striking architectural form.
              </p>
              <div className="flex flex-col gap-5">
                <div className="border-l-2 border-accent pl-5 py-1">
                  <h4 data-cms-key="leadership_member_1_name" className="font-sans text-lg md:text-xl font-medium uppercase tracking-widest text-charcoal dark:text-concrete">{resources.leadership_member_1_name || 'Joseph Macharia'}</h4>
                  <p data-cms-key="leadership_member_1_role" className="font-mono text-[10px] md:text-xs text-charcoal/50 dark:text-concrete/50 tracking-wider uppercase mt-1">{resources.leadership_member_1_role || 'Principal Architect & CEO'}</p>
                </div>
                <div className="border-l-2 border-charcoal/20 dark:border-concrete/20 pl-5 py-1">
                  <h4 data-cms-key="leadership_member_2_name" className="font-sans text-lg md:text-xl font-medium uppercase tracking-widest text-charcoal dark:text-concrete">{resources.leadership_member_2_name || 'Elena Rostova'}</h4>
                  <p data-cms-key="leadership_member_2_role" className="font-mono text-[10px] md:text-xs text-charcoal/50 dark:text-concrete/50 tracking-wider uppercase mt-1">{resources.leadership_member_2_role || 'Head of Urban Planning'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Expertise - Minimalist Grid */}
      <motion.section 
        id="expertise" 
        className="py-24 md:py-32 px-8 max-w-7xl mx-auto border-t border-charcoal/10 dark:border-concrete/10 transition-colors duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-20">
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-charcoal dark:text-concrete transition-colors duration-500">Core Capabilities</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {[
            { title: "Architectural Drafting", icon: Box, tags: ['ArchiCAD', 'Revit', 'AutoCAD'] },
            { title: "Urban & Regional Planning", icon: Building2, tags: ['Master Planning', 'Zoning'] },
            { title: "Spatial Analysis", icon: Map, tags: ['QGIS', 'Geodatabase Design'] },
            { title: "Construction Management", icon: HardHat, tags: ['Site Supervision', 'Cost Control'] },
            { title: "Project Management", icon: ClipboardList, tags: ['Agile', 'Scheduling', 'Quality Assurance'] }
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeInUp} className="group flex flex-col transition-all duration-300">
              <div className="mb-8 text-charcoal/40 dark:text-concrete/40 group-hover:text-charcoal dark:group-hover:text-concrete transition-colors">
                <item.icon size={24} strokeWidth={1} />
              </div>
              <h3 className="font-sans text-sm font-medium uppercase tracking-widest mb-6">{item.title}</h3>
              <div className="flex flex-col gap-3 mt-auto">
                {item.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-charcoal/60 dark:text-concrete/60 mix-blend-multiply">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
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
          <Quote size={40} className="text-accent mx-auto mb-12" />
          <h2 data-cms-key="home_quote_text" className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-12 text-balance text-charcoal dark:text-concrete transition-colors duration-500">
            "{resources.home_quote_text || 'First life, then spaces, then buildings – the other way around never works.'}"
          </h2>
          <div className="flex flex-col items-center border-t border-charcoal/20 dark:border-concrete/20 pt-8">
            <p data-cms-key="home_quote_author" className="text-sm font-bold uppercase tracking-widest text-charcoal dark:text-concrete transition-colors duration-500">{resources.home_quote_author || 'Jan Gehl'}</p>
            <p data-cms-key="home_quote_role" className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mt-2 transition-colors duration-500">{resources.home_quote_role || 'Urban Designer'}</p>
          </div>
        </motion.div>

        {/* Live Ratings & Review Summary Widget */}
        <motion.div variants={fadeInUp} className="mb-16 border-t border-charcoal/20 dark:border-concrete/20 pt-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal p-4 min-w-[120px]">
              <span data-cms-key="review_overall_rating" className="font-display text-4xl font-bold">{resources['review_overall_rating'] || '4.9'}</span>
              <div className="flex items-center gap-1 mt-1 text-accent">
                {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill="currentColor" />))}
              </div>
            </div>
            <div>
              <h3 data-cms-key="review_platform_name" className="font-mono text-sm tracking-widest uppercase text-charcoal dark:text-concrete">
                {resources['review_platform_name'] || 'Google'} Verified Reviews
              </h3>
              <p data-cms-key="review_total_count" className="font-mono text-[10px] text-charcoal/60 dark:text-concrete/60 tracking-wider mt-1 uppercase">
                Based on {resources['review_total_count'] || '142'} client experiences
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {resources['review_platform_link'] && (
              <a 
                href={resources['review_platform_link']}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-concrete px-6 py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-charcoal dark:hover:bg-concrete dark:hover:text-charcoal transition-colors border-none text-center"
              >
                Read Live Reviews
              </a>
            )}
            <button 
              onClick={() => setShowReviewModal(true)}
              className="border border-charcoal dark:border-concrete text-charcoal dark:text-concrete px-6 py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal transition-colors text-center"
            >
              Share Your Experience
            </button>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-charcoal dark:border-concrete">
          {(testimonials.length > 0 ? testimonials : [
            { id: '1', rating: 5, comment: "Danuthia Associates Construction LLc delivered a masterclass in urban resilience for our commercial expansion. Precise, visionary, and exactingly executed.", clientName: "Marcus T.", projectType: "Commercial Planning" },
            { id: '2', rating: 5, comment: "Their architectural approach redefined our spatial constraints. They balance highly technical execution with an unyielding aesthetic standard.", clientName: "Sarah K.", projectType: "Residential Architecture" },
            { id: '3', rating: 5, comment: "The GIS analysis and topographical mapping provided the exact clarity our stakeholder committee needed. Truly an indispensable partner.", clientName: "James L.", projectType: "Spatial Analysis" }
          ]).map((test) => (
            <motion.div 
              key={test.id}
              variants={fadeInUp}
              className="bg-concrete dark:bg-charcoal p-8 border-r border-b border-charcoal dark:border-concrete relative group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < test.rating ? 'text-accent' : 'text-charcoal/20 dark:text-concrete/20'}>★</span>
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
                <CheckCircle size={16} className="text-accent" />
              </div>
            </motion.div>
          ))}
        </div>
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
            <h2 data-cms-key="home_contact_title" className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-16 text-charcoal dark:text-concrete transition-colors duration-500">
              {resources.home_contact_title || 'Partner With Us'}
            </h2>
            
            <div className="space-y-12">
              <div className="border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Headquarters</p>
                <p data-cms-key="home_contact_address" className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete transition-colors duration-500">{resources.home_contact_address || 'Nairobi, Kenya'}</p>
              </div>
              
              <div className="border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Direct Line</p>
                <a data-cms-key="global_contact_phone" href={`tel:${resources.global_contact_phone || '0715795589'}`} className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete hover:text-accent dark:hover:text-accent transition-colors duration-500">{resources.global_contact_phone || '0715 795 589'}</a>
              </div>
              
              <div className="border-t border-charcoal/20 dark:border-concrete/20 pt-4">
                <p className="text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Official Email</p>
                <a data-cms-key="global_contact_email" href={`mailto:${resources.global_contact_email || 'danuthiaandassociates@gmail.com'}`} className="font-display text-2xl font-bold uppercase text-charcoal dark:text-concrete hover:text-accent dark:hover:text-accent transition-colors duration-500 break-all">{resources.global_contact_email || 'danuthiaandassociates@gmail.com'}</a>
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
                  <CheckCircle size={48} className="text-accent mx-auto mb-6" />
                  <h4 className="font-display text-3xl font-bold uppercase tracking-tight mb-4">Request Received</h4>
                  <p className="text-concrete/70 font-mono text-sm mb-12">
                    Thank you. We have received your consultation request and will be in touch shortly to confirm the details.
                  </p>
                  <Magnetic>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="text-[10px] font-mono uppercase tracking-widest text-concrete hover:text-white transition-colors pb-1 border-b border-concrete/30 hover:border-concrete"
                    >
                      Submit Another Request
                    </button>
                  </Magnetic>
                </motion.div>
              ) : (
                <form className="space-y-10" onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="text-red-400 text-[10px] font-mono uppercase border border-red-400 p-4">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Full Name"
                        id="fullName"
                        required
                      />
                      <label htmlFor="fullName" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-concrete">
                        Full Name
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Email Address"
                        id="email"
                        required
                      />
                      <label htmlFor="email" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-concrete">
                        Email Address
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Phone Number"
                        id="phone"
                        required
                      />
                      <label htmlFor="phone" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-concrete">
                        Phone Number
                      </label>
                    </div>

                    <div className="relative group">
                      <input 
                        type="text" 
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg peer placeholder-transparent rounded-none"
                        placeholder="Project Location"
                        id="location"
                        required
                      />
                      <label htmlFor="location" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-concrete">
                        Project Location
                      </label>
                    </div>

                    <div className="relative group md:col-span-2">
                      <select 
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg appearance-none cursor-pointer peer rounded-none"
                        required
                      >
                        <option value="" disabled className="text-charcoal bg-concrete">Select project type...</option>
                        <option value="new-build" className="text-charcoal bg-concrete">New Build</option>
                        <option value="renovation" className="text-charcoal bg-concrete">Renovation</option>
                        <option value="interior-design" className="text-charcoal bg-concrete">Interior Design</option>
                        <option value="master-planning" className="text-charcoal bg-concrete">Master Planning</option>
                      </select>
                      <label className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest peer-focus:text-concrete transition-colors">
                        Project Type
                      </label>
                    </div>

                    <div className="relative group md:col-span-2">
                      <input 
                        type="date" 
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full peer rounded-none"
                        required
                      />
                      <label className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest peer-focus:text-concrete transition-colors">
                        Preferred Date
                      </label>
                      <Calendar size={20} className="absolute right-0 top-3 text-concrete/30 pointer-events-none peer-focus:text-concrete transition-colors" />
                    </div>

                    <div className="relative group md:col-span-2">
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-transparent border-b border-concrete/30 py-3 focus:outline-none focus:border-concrete transition-colors text-lg peer placeholder-transparent rounded-none resize-none h-24 custom-scrollbar"
                        placeholder="Project Description"
                        id="description"
                        required
                      />
                      <label htmlFor="description" className="absolute left-0 -top-5 text-[10px] font-mono text-concrete/50 uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-concrete">
                        Project Description & Vision
                      </label>
                    </div>

                    <div className="flex items-start gap-4 md:col-span-2 pt-4">
                      <input 
                        type="checkbox" 
                        id="consent-checkbox-home"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 shrink-0 accent-concrete"
                      />
                      <label htmlFor="consent-checkbox-home" className="text-xs font-mono text-concrete/70 leading-relaxed cursor-pointer">
                        I consent to the collection of my data as outlined in the <Link to="/privacy-policy" className="text-white underline font-bold">Privacy Policy</Link> and acknowledge the <Link to="/terms-and-conditions" className="text-white underline font-bold">Terms and Conditions</Link>.
                      </label>
                    </div>
                  </div>

                  <Magnetic className="w-full">
                    <button 
                      type="submit"
                      disabled={isSubmitting || !consent}
                      className="w-full border border-concrete text-concrete py-4 font-mono text-[10px] uppercase tracking-widest hover:bg-concrete hover:text-charcoal transition-all duration-500 mt-12 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
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

      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </main>
  );
}
