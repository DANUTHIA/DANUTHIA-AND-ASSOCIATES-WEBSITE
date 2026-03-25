import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
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

export default function About() {
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
          <span className="font-display font-bold text-[12vw] leading-none text-steel whitespace-nowrap">ABOUT US</span>
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
                Rooted in context.<br/>
                <span className="text-bronze font-light italic">Designing for tomorrow.</span>
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-bronze pl-6">
                Danuthia & Co. is a premier architectural and urban planning firm based in Nairobi, Kenya. We believe in designing spaces that respect the past while building for the future.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Image Break */}
      <section className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop" 
          alt="Architectural detail" 
          className="w-full h-full object-cover mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-charcoal/20 mix-blend-multiply"></div>
      </section>

      {/* Content Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          <motion.div variants={fadeInUp} className="lg:col-span-7">
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-12">Our Philosophy</h2>
            <div className="space-y-8 text-lg md:text-xl text-charcoal/80 leading-relaxed font-light">
              <p>
                We approach every project with a deep understanding of local context, environmental sustainability, and human-centric design. Our data-driven methodology ensures that our master plans and architectural designs are not just visually striking, but highly functional and resilient.
              </p>
              <p>
                The African urban landscape is evolving rapidly. To meet these challenges, we integrate advanced spatial analysis (GIS) with cutting-edge architectural drafting to deliver comprehensive solutions that stand the test of time.
              </p>
              <p>
                From residential complexes to regional master plans, our work is defined by a commitment to quality, precision, and an unwavering belief that good design can elevate communities and inspire generations.
              </p>
            </div>
            
            <Link to="/#book" className="inline-flex items-center justify-between p-6 border border-charcoal hover:bg-charcoal hover:text-concrete transition-all duration-500 group mt-16 w-full md:w-auto min-w-[300px]">
              <span className="font-bold uppercase tracking-widest mr-8 text-sm">Work With Us</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-5">
            <div className="bg-charcoal p-12 text-concrete flex flex-col justify-center relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-bronze opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-1000"></div>
              
              <h3 className="font-display text-3xl font-bold uppercase tracking-tight mb-12 relative z-10">Core Values</h3>
              <ul className="space-y-10 font-mono text-sm uppercase tracking-widest relative z-10">
                <li className="flex items-start gap-6 group/item">
                  <span className="text-bronze font-display text-2xl leading-none italic">01</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Sustainable Development</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Minimizing footprint, maximizing efficiency through intelligent material selection and passive design.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-bronze font-display text-2xl leading-none italic">02</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Data-Driven Planning</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Evidence over intuition. Utilizing advanced spatial analysis to inform every design decision.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-bronze font-display text-2xl leading-none italic">03</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Cultural Context</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Honoring local heritage and climate, creating spaces that resonate with their surroundings.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-bronze font-display text-2xl leading-none italic">04</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Architectural Excellence</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Uncompromising quality in every detail, from conceptual sketches to final construction.</span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
