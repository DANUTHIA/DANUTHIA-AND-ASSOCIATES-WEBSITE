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
      <section className="relative bg-charcoal text-concrete p-8 md:p-16 flex flex-col justify-center overflow-hidden border-b border-steel/30 min-h-[50vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="font-display font-bold text-[15rem] leading-none text-steel">SERVICES</span>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-4xl"
        >
          <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase">
            Comprehensive.<br/>
            <span className="text-bronze">Precision-driven.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-concrete/80 max-w-2xl font-light leading-relaxed">
            Comprehensive architectural and urban planning services tailored for the modern African city.
          </motion.p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeInUp} className="bg-concrete border border-steel/30 p-8 hover:border-bronze transition-colors group flex flex-col">
            <Box size={40} className="text-steel mb-8 group-hover:text-bronze transition-colors" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Architectural Design</h2>
            <p className="text-charcoal/70 mb-8 flex-grow">
              Full-service architectural design from concept to construction documentation. We specialize in residential, commercial, and institutional buildings.
            </p>
            <ul className="space-y-3 text-sm font-mono uppercase tracking-wider text-steel mb-8">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Concept Design</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> 3D Modeling & Rendering</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Construction Drawings</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Project Management</li>
            </ul>
            <Link to="/portfolio" className="text-xs font-bold uppercase tracking-widest text-charcoal group-hover:text-bronze flex items-center gap-2 transition-colors mt-auto">
              View Projects <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-concrete border border-steel/30 p-8 hover:border-bronze transition-colors group flex flex-col">
            <Building2 size={40} className="text-steel mb-8 group-hover:text-bronze transition-colors" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Urban Planning</h2>
            <p className="text-charcoal/70 mb-8 flex-grow">
              Strategic planning for neighborhoods, cities, and regions. We focus on sustainable growth, mobility, and public space design.
            </p>
            <ul className="space-y-3 text-sm font-mono uppercase tracking-wider text-steel mb-8">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Master Planning</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Zoning & Land Use</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Urban Design Guidelines</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Feasibility Studies</li>
            </ul>
            <Link to="/portfolio" className="text-xs font-bold uppercase tracking-widest text-charcoal group-hover:text-bronze flex items-center gap-2 transition-colors mt-auto">
              View Projects <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-concrete border border-steel/30 p-8 hover:border-bronze transition-colors group flex flex-col">
            <Map size={40} className="text-steel mb-8 group-hover:text-bronze transition-colors" />
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Spatial Analysis</h2>
            <p className="text-charcoal/70 mb-8 flex-grow">
              Advanced GIS mapping and spatial data analysis to inform design decisions and policy making.
            </p>
            <ul className="space-y-3 text-sm font-mono uppercase tracking-wider text-steel mb-8">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Topographical Analysis</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Environmental Mapping</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Demographic Studies</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-bronze rounded-full"></span> Infrastructure Planning</li>
            </ul>
            <Link to="/portfolio" className="text-xs font-bold uppercase tracking-widest text-charcoal group-hover:text-bronze flex items-center gap-2 transition-colors mt-auto">
              View Projects <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
