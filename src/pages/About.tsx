import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function About() {
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
          <span className="font-display font-bold text-[15rem] leading-none text-steel">ABOUT</span>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-4xl"
        >
          <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase">
            Rooted in context.<br/>
            <span className="text-bronze">Designing for tomorrow.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-concrete/80 max-w-2xl font-light leading-relaxed">
            Danuthia & Co. is a premier architectural and urban planning firm based in Nairobi, Kenya. We believe in designing spaces that respect the past while building for the future.
          </motion.p>
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
        >
          <motion.div variants={fadeInUp}>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-8">Our Philosophy</h2>
            <div className="space-y-6 text-lg text-charcoal/80 leading-relaxed">
              <p>
                We approach every project with a deep understanding of local context, environmental sustainability, and human-centric design. Our data-driven methodology ensures that our master plans and architectural designs are not just visually striking, but highly functional and resilient.
              </p>
              <p>
                The African urban landscape is evolving rapidly. To meet these challenges, we integrate advanced spatial analysis (GIS) with cutting-edge architectural drafting to deliver comprehensive solutions.
              </p>
              <p>
                From residential complexes to regional master plans, our work is defined by a commitment to quality, precision, and an unwavering belief that good design can elevate communities.
              </p>
            </div>
            
            <Link to="/#book" className="inline-flex items-center justify-between p-6 border border-charcoal hover:bg-charcoal hover:text-concrete transition-all duration-300 group mt-12 w-full md:w-auto">
              <span className="font-bold uppercase tracking-widest mr-8">Work With Us</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="bg-steel p-12 text-concrete flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-charcoal opacity-10 rounded-full blur-3xl group-hover:bg-bronze transition-colors duration-1000"></div>
            
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-12 relative z-10">Core Values</h3>
            <ul className="space-y-8 font-mono text-sm uppercase tracking-widest relative z-10">
              <li className="flex items-start gap-4 group/item">
                <span className="w-2 h-2 bg-bronze rounded-full mt-1.5 group-hover/item:scale-150 transition-transform"></span>
                <div>
                  <span className="block font-bold mb-1">Sustainable Development</span>
                  <span className="text-concrete/60 text-xs normal-case tracking-normal font-sans">Minimizing footprint, maximizing efficiency.</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group/item">
                <span className="w-2 h-2 bg-bronze rounded-full mt-1.5 group-hover/item:scale-150 transition-transform"></span>
                <div>
                  <span className="block font-bold mb-1">Data-Driven Planning</span>
                  <span className="text-concrete/60 text-xs normal-case tracking-normal font-sans">Evidence over intuition.</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group/item">
                <span className="w-2 h-2 bg-bronze rounded-full mt-1.5 group-hover/item:scale-150 transition-transform"></span>
                <div>
                  <span className="block font-bold mb-1">Cultural Context</span>
                  <span className="text-concrete/60 text-xs normal-case tracking-normal font-sans">Honoring local heritage and climate.</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group/item">
                <span className="w-2 h-2 bg-bronze rounded-full mt-1.5 group-hover/item:scale-150 transition-transform"></span>
                <div>
                  <span className="block font-bold mb-1">Architectural Excellence</span>
                  <span className="text-concrete/60 text-xs normal-case tracking-normal font-sans">Uncompromising quality in every detail.</span>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
