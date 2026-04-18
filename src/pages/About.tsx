import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
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
  const imageBreakRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageBreakRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500 bg-blueprint-grid">
      {/* Hero Section */}
      <section className="relative bg-charcoal dark:bg-charcoal text-concrete p-8 md:p-16 pt-32 md:pt-40 flex flex-col justify-center overflow-hidden min-h-[60vh] transition-colors duration-500">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          >
            <source src="https://i.imgur.com/okef0xf.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent"></div>
        </div>

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
                <span className="text-accent">Designing for tomorrow.</span>
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-accent pl-6">
                Danuthia & Associates. is a premier architectural and urban planning firm based in Nairobi, Kenya. We believe in designing spaces that respect the past while building for the future.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Image Break */}
      <section ref={imageBreakRef} className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 w-full h-[140%] -top-[20%]">
          <motion.img 
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1600&auto=format&fit=crop" 
            alt="Architectural detail" 
            className="w-full h-full object-cover "
            referrerPolicy="no-referrer"
          />
        </motion.div>
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
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-12 text-charcoal dark:text-concrete transition-colors duration-500">Our Philosophy</h2>
            <div className="space-y-8 text-lg md:text-xl text-charcoal/80 dark:text-concrete/80 leading-relaxed font-light transition-colors duration-500">
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
            
            <Link to="/careers" className="inline-flex items-center justify-between p-6 border border-charcoal dark:border-concrete hover:bg-charcoal hover:text-concrete dark:hover:bg-concrete dark:hover:text-charcoal text-charcoal dark:text-concrete transition-all duration-500 group mt-16 w-full md:w-auto min-w-[300px]">
              <span className="font-bold uppercase tracking-widest mr-8 text-sm">Work With Us</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="lg:col-span-5">
            <div className="bg-charcoal dark:bg-charcoal p-12 text-concrete flex flex-col justify-center relative overflow-hidden group h-full transition-colors duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-1000"></div>
              
              <h3 className="font-display text-3xl font-bold uppercase tracking-tight mb-12 relative z-10">Core Values</h3>
              <ul className="space-y-10 font-mono text-sm uppercase tracking-widest relative z-10">
                <li className="flex items-start gap-6 group/item">
                  <span className="text-accent font-display text-2xl leading-none font-bold">01</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Sustainable Development</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Minimizing footprint, maximizing efficiency through intelligent material selection and passive design.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-accent font-display text-2xl leading-none font-bold">02</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Data-Driven Planning</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Evidence over intuition. Utilizing advanced spatial analysis to inform every design decision.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-accent font-display text-2xl leading-none font-bold">03</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Cultural Context</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Honoring local heritage and climate, creating spaces that resonate with their surroundings.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-accent font-display text-2xl leading-none font-bold">04</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Architectural Excellence</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Uncompromising quality in every detail, from conceptual sketches to final construction.</span>
                  </div>
                </li>
                <li className="flex items-start gap-6 group/item">
                  <span className="text-accent font-display text-2xl leading-none font-bold">05</span>
                  <div>
                    <span className="block font-bold mb-2 text-concrete">Project Management</span>
                    <span className="text-steel text-xs normal-case tracking-normal font-sans leading-relaxed block">Precision-driven management ensuring every project milestone is met on time and within budget.</span>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </section>
      {/* Core Values Section */}
      <section className="bg-charcoal text-concrete py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="mb-16">
              <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4">Our Culture</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight">Core Values.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: "Innovation", desc: "We constantly push the boundaries of what's possible through R&D and computational design." },
                { title: "Integrity", desc: "Our commitment to ethical practice and structural honesty is unwavering." },
                { title: "Inclusion", desc: "We design for everyone, ensuring our spaces are accessible and equitable." }
              ].map((value, idx) => (
                <motion.div key={idx} variants={fadeInUp} className="border-l border-accent pl-8">
                  <h3 className="font-display text-2xl font-bold uppercase mb-4">{value.title}</h3>
                  <p className="text-concrete/60 font-light leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24 border-b border-charcoal/10 dark:border-concrete/10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
        >
          <motion.div variants={fadeInUp}>
            <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4">Our Reach</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-8">A Global Network of Expertise.</h2>
            <p className="text-charcoal/60 dark:text-concrete/60 mb-12 text-lg leading-relaxed">
              While rooted in Nairobi, our influence and collaborations span across three continents. We leverage a global network of specialists to bring world-class innovation to local challenges.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-display font-bold text-accent mb-2">03</div>
                <div className="text-xs font-mono uppercase tracking-widest text-charcoal/60 dark:text-concrete/60">Continents</div>
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-accent mb-2">15+</div>
                <div className="text-xs font-mono uppercase tracking-widest text-charcoal/60 dark:text-concrete/60">Global Partners</div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeInUp} className="relative aspect-video bg-charcoal overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop" 
              alt="Global Network" 
              className="w-full h-full object-cover opacity-50 "
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full border border-accent/20 m-8"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Founder Section */}

      <section className="bg-charcoal dark:bg-charcoal text-concrete py-24 px-8 md:px-16 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInUp} className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-accent/20 translate-x-4 translate-y-4"></div>
              <img 
                src="/joseph-macharia.png" 
                alt="Joseph Macharia - Founder" 
                className="relative z-10 w-full h-full object-cover  hover:-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex flex-col justify-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Joseph Macharia</h2>
              <p className="text-accent font-mono text-sm uppercase tracking-widest mb-8">Founder & Principal Planner</p>
              
              <div className="space-y-6 text-lg text-steel font-light leading-relaxed">
                <p>
                  "Architecture is more than just erecting buildings; it is about crafting the backdrop to people's lives. At Danuthia & Co., our vision has always been to bridge the gap between sustainable urban planning and innovative architectural design."
                </p>
                <p>
                  "We strive to create spaces that not only serve their functional purpose but also enrich the communities they inhabit. Every project is an opportunity to respect our heritage while boldly designing for tomorrow."
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Personnel Dossiers Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24 border-t border-charcoal/20 dark:border-concrete/20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-16">
            <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4">Network</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">
              Personnel Dossiers
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dossier 1 */}
            <motion.div variants={fadeInUp} className="group relative border border-charcoal/20 dark:border-concrete/20 bg-concrete dark:bg-charcoal overflow-hidden transition-colors duration-500">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop" 
                  alt="Dr. E. Vance" 
                  className="w-full h-full object-cover  opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 mix-blend-multiply dark:"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-accent/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 bg-charcoal text-concrete text-[9px] font-mono uppercase px-2 py-1 tracking-widest border border-concrete/20">
                  ACTIVE
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/20 dark:border-concrete/20">
                <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">ID: 001 // LEVEL 5</div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-1">Dr. E. Vance</h3>
                <p className="font-mono text-xs text-charcoal/60 dark:text-concrete/60 uppercase tracking-wider mb-4">Head of R&D</p>
                <div className="h-[1px] w-full bg-charcoal/10 dark:bg-concrete/10 mb-4"></div>
                <div className="space-y-2 font-mono text-[10px] text-charcoal/80 dark:text-concrete/80 uppercase tracking-widest">
                  <div className="flex justify-between"><span>Specialty:</span> <span className="text-right">Material Science</span></div>
                  <div className="flex justify-between"><span>Clearance:</span> <span className="text-right">Alpha</span></div>
                  <div className="flex justify-between"><span>Projects:</span> <span className="text-right">24</span></div>
                </div>
              </div>
            </motion.div>

            {/* Dossier 2 */}
            <motion.div variants={fadeInUp} className="group relative border border-charcoal/20 dark:border-concrete/20 bg-concrete dark:bg-charcoal overflow-hidden transition-colors duration-500">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1600&auto=format&fit=crop" 
                  alt="M. Rossi" 
                  className="w-full h-full object-cover  opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 mix-blend-multiply dark:"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-accent/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 bg-charcoal text-concrete text-[9px] font-mono uppercase px-2 py-1 tracking-widest border border-concrete/20">
                  ACTIVE
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/20 dark:border-concrete/20">
                <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">ID: 002 // LEVEL 4</div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-1">M. Rossi</h3>
                <p className="font-mono text-xs text-charcoal/60 dark:text-concrete/60 uppercase tracking-wider mb-4">Lead Urban Planner</p>
                <div className="h-[1px] w-full bg-charcoal/10 dark:bg-concrete/10 mb-4"></div>
                <div className="space-y-2 font-mono text-[10px] text-charcoal/80 dark:text-concrete/80 uppercase tracking-widest">
                  <div className="flex justify-between"><span>Specialty:</span> <span className="text-right">Parametric Zoning</span></div>
                  <div className="flex justify-between"><span>Clearance:</span> <span className="text-right">Beta</span></div>
                  <div className="flex justify-between"><span>Projects:</span> <span className="text-right">38</span></div>
                </div>
              </div>
            </motion.div>

            {/* Dossier 3 */}
            <motion.div variants={fadeInUp} className="group relative border border-charcoal/20 dark:border-concrete/20 bg-concrete dark:bg-charcoal overflow-hidden transition-colors duration-500">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1600&auto=format&fit=crop" 
                  alt="A. Chen" 
                  className="w-full h-full object-cover  opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 mix-blend-multiply dark:"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-accent/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 bg-charcoal text-concrete text-[9px] font-mono uppercase px-2 py-1 tracking-widest border border-concrete/20">
                  ACTIVE
                </div>
              </div>
              <div className="p-6 border-t border-charcoal/20 dark:border-concrete/20">
                <div className="font-mono text-[10px] text-accent uppercase tracking-widest mb-2">ID: 003 // LEVEL 4</div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-1">A. Chen</h3>
                <p className="font-mono text-xs text-charcoal/60 dark:text-concrete/60 uppercase tracking-wider mb-4">Senior Structural Eng.</p>
                <div className="h-[1px] w-full bg-charcoal/10 dark:bg-concrete/10 mb-4"></div>
                <div className="space-y-2 font-mono text-[10px] text-charcoal/80 dark:text-concrete/80 uppercase tracking-widest">
                  <div className="flex justify-between"><span>Specialty:</span> <span className="text-right">Adaptive Reuse</span></div>
                  <div className="flex justify-between"><span>Clearance:</span> <span className="text-right">Beta</span></div>
                  <div className="flex justify-between"><span>Projects:</span> <span className="text-right">19</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
