import React from 'react';
import { motion } from 'motion/react';
import { Box, Building2, Map, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Services() {
  return (
    <main className="bg-concrete min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-charcoal text-concrete p-8 md:p-16 flex flex-col justify-center overflow-hidden min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="font-display font-bold text-[12vw] leading-none text-steel whitespace-nowrap">EXPERTISE</span>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <div>
              <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase">
                Comprehensive.<br/>
                <span className="text-bronze font-light italic">Precision-driven.</span>
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-bronze pl-6">
                Comprehensive architectural and urban planning services tailored for the modern African city. We bridge the gap between visionary design and practical execution.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Services List */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-col gap-16 md:gap-32"
        >
          {/* Service 1 */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center group">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-bronze font-display text-3xl italic">01</span>
                <div className="h-[1px] bg-steel/30 flex-grow"></div>
                <Box size={24} className="text-steel group-hover:text-bronze transition-colors" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">Architectural Design</h2>
              <p className="text-charcoal/70 mb-8 text-lg font-light leading-relaxed">
                Full-service architectural design from concept to construction documentation. We specialize in residential, commercial, and institutional buildings that respond to their environment.
              </p>
              <ul className="space-y-4 text-sm font-mono uppercase tracking-wider text-charcoal/80 mb-10">
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Concept Design</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> 3D Modeling & Rendering</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Construction Drawings</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Project Management</li>
              </ul>
              <Link to="/portfolio" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-charcoal hover:text-bronze transition-colors">
                View Related Projects <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 h-[40vh] lg:h-[60vh] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop" 
                alt="Architectural Design" 
                className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Service 2 */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center group">
            <div className="lg:col-span-7 h-[40vh] lg:h-[60vh] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1600&auto=format&fit=crop" 
                alt="Urban Planning" 
                className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none"></div>
            </div>
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-bronze font-display text-3xl italic">02</span>
                <div className="h-[1px] bg-steel/30 flex-grow"></div>
                <Building2 size={24} className="text-steel group-hover:text-bronze transition-colors" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">Urban Planning</h2>
              <p className="text-charcoal/70 mb-8 text-lg font-light leading-relaxed">
                Strategic planning for neighborhoods, cities, and regions. We focus on sustainable growth, mobility, and public space design to create vibrant, livable communities.
              </p>
              <ul className="space-y-4 text-sm font-mono uppercase tracking-wider text-charcoal/80 mb-10">
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Master Planning</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Zoning & Land Use</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Urban Design Guidelines</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Feasibility Studies</li>
              </ul>
              <Link to="/portfolio" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-charcoal hover:text-bronze transition-colors">
                View Related Projects <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Service 3 */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center group">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-bronze font-display text-3xl italic">03</span>
                <div className="h-[1px] bg-steel/30 flex-grow"></div>
                <Map size={24} className="text-steel group-hover:text-bronze transition-colors" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">Spatial Analysis</h2>
              <p className="text-charcoal/70 mb-8 text-lg font-light leading-relaxed">
                Advanced GIS mapping and spatial data analysis to inform design decisions and policy making. We turn complex geographical data into actionable insights.
              </p>
              <ul className="space-y-4 text-sm font-mono uppercase tracking-wider text-charcoal/80 mb-10">
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Topographical Analysis</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Environmental Mapping</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Demographic Studies</li>
                <li className="flex items-center gap-4 border-b border-steel/20 pb-2"><span className="w-1.5 h-1.5 bg-bronze rounded-full"></span> Infrastructure Planning</li>
              </ul>
              <Link to="/portfolio" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-charcoal hover:text-bronze transition-colors">
                View Related Projects <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2 h-[40vh] lg:h-[60vh] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop" 
                alt="Spatial Analysis" 
                className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none"></div>
            </div>
          </motion.div>

        </motion.div>
      </section>
    </main>
  );
}
