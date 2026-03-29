import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

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

export default function Careers() {
  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative bg-charcoal dark:bg-[#111111] text-concrete p-8 md:p-16 flex flex-col justify-center overflow-hidden min-h-[60vh] transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="font-display font-bold text-[12vw] leading-none text-steel whitespace-nowrap">CAREERS</span>
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
                Work With <span className="text-bronze font-light italic">Us.</span>
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-bronze pl-6">
                Join a team of visionary architects and urban planners shaping the future of the African landscape.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl mb-8 text-charcoal dark:text-concrete transition-colors duration-500">Open Positions</h2>
          <p className="text-charcoal/70 dark:text-concrete/70 mb-12 font-light leading-relaxed text-lg transition-colors duration-500">
            We are always looking for exceptional talent. While we currently do not have specific open roles, we welcome speculative applications from passionate architects, urban planners, and 3D visualization artists.
          </p>
          <a href="mailto:careers@danuthiaandassociates.com" className="inline-flex items-center justify-between p-6 border border-charcoal dark:border-concrete hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal text-charcoal dark:text-concrete transition-all duration-500 group w-full md:w-auto min-w-[300px]">
            <span className="font-bold uppercase tracking-widest mr-8 text-sm">Submit Portfolio</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </section>
    </main>
  );
}
