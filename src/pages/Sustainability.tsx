import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Wind, Droplets, Sun, Zap, Recycle, Trees, Globe, ShieldCheck, BarChart3 } from 'lucide-react';

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

export default function Sustainability() {
  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500 bg-blueprint-grid">
      {/* Hero Section */}
      <section className="relative bg-charcoal text-concrete p-8 md:p-16 pt-32 md:pt-40 flex flex-col justify-center overflow-hidden min-h-[70vh]">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          >
            <source src="https://i.imgur.com/DKkCVme.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="font-display font-bold text-[12vw] leading-none text-steel whitespace-nowrap uppercase">Impact</span>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-5xl mx-auto w-full"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="text-accent font-mono text-xs uppercase tracking-[0.3em]">Our Commitment</span>
          </motion.div>
          <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-8xl font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
            Design for a<br/>
            <span className="text-accent">Better World.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-concrete/70 font-light max-w-2xl leading-relaxed border-l border-accent pl-8">
            At Danuthia & Associates., sustainability isn't a feature—it's the foundation. We engineer environments that harmonize human ambition with ecological resilience.
          </motion.p>
        </motion.div>
      </section>

      {/* Pillars Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-32">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-16"
        >
          <motion.div variants={fadeInUp} className="group">
            <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mb-8 border border-accent/20 group-hover:bg-accent transition-colors duration-500">
              <Zap size={32} className="text-accent group-hover:text-concrete dark:group-hover:text-charcoal transition-colors" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-4 text-charcoal dark:text-concrete">Net Zero Carbon</h3>
            <p className="text-charcoal/60 dark:text-concrete/60 leading-relaxed">
              We are committed to designing carbon-neutral buildings by 2030, utilizing advanced energy modeling and renewable integration.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="group">
            <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mb-8 border border-accent/20 group-hover:bg-accent transition-colors duration-500">
              <Droplets size={32} className="text-accent group-hover:text-concrete dark:group-hover:text-charcoal transition-colors" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-4 text-charcoal dark:text-concrete">Water Resilience</h3>
            <p className="text-charcoal/60 dark:text-concrete/60 leading-relaxed">
              In water-scarce regions, our designs prioritize circular water systems, rainwater harvesting, and drought-resistant landscapes.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="group">
            <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mb-8 border border-accent/20 group-hover:bg-accent transition-colors duration-500">
              <Recycle size={32} className="text-accent group-hover:text-concrete dark:group-hover:text-charcoal transition-colors" />
            </div>
            <h3 className="font-display text-2xl font-bold uppercase mb-4 text-charcoal dark:text-concrete">Circular Economy</h3>
            <p className="text-charcoal/60 dark:text-concrete/60 leading-relaxed">
              We specify low-embodied carbon materials and design for disassembly, ensuring our buildings contribute to a circular future.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Technical Excellence Section */}
      <section className="bg-charcoal text-concrete py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="font-display text-4xl md:text-6xl font-bold uppercase mb-12 leading-tight">
                Evidence-Based<br/><span className="text-accent">Performance.</span>
              </h2>
              <div className="space-y-12">
                <div className="flex gap-8">
                  <div className="flex-shrink-0 pt-2">
                    <BarChart3 size={24} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold uppercase mb-2">Energy Modeling</h4>
                    <p className="text-concrete/60 font-light">We use parametric simulation to optimize building orientation, glazing ratios, and thermal mass before a single brick is laid.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="flex-shrink-0 pt-2">
                    <ShieldCheck size={24} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold uppercase mb-2">Certification Leadership</h4>
                    <p className="text-concrete/60 font-light">Our team leads the industry in LEED, WELL, and EDGE certifications, ensuring third-party verified excellence.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="flex-shrink-0 pt-2">
                    <Globe size={24} className="text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-bold uppercase mb-2">Regional Adaptation</h4>
                    <p className="text-concrete/60 font-light">We specialize in tropical and arid climate strategies, moving beyond Western standards to local ecological truths.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 border border-accent/30 m-8 z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop" 
                alt="Sustainable Urbanism" 
                className="w-full h-full object-cover  opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent"></div>
              <div className="absolute bottom-16 left-16 z-20">
                <div className="text-8xl font-display font-bold text-accent mb-2">40%</div>
                <div className="text-xs font-mono uppercase tracking-widest text-concrete/60">Average energy reduction across portfolio</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="p-8 md:p-16 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold uppercase mb-8 text-charcoal dark:text-concrete">Ready to build for the future?</h2>
          <p className="text-charcoal/60 dark:text-concrete/60 mb-12 text-lg">Download our 2026 Sustainability Report to see how we're transforming the built environment.</p>
          <a 
            href="/danuthia_2026_sustainability_report.pdf" 
            download
            className="inline-block bg-accent text-concrete dark:text-charcoal px-12 py-5 font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-transparent hover:text-accent border border-accent transition-all duration-500"
          >
            Download Report
          </a>
        </motion.div>
      </section>
    </main>
  );
}
