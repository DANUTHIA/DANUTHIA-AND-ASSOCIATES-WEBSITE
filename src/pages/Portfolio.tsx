import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ArrowRight, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';

const projects = [
  { 
    id: 1,
    title: "Nairobi Tech Hub", 
    category: "Commercial", 
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A 15-story sustainable commercial center designed to foster innovation. Features passive cooling, rainwater harvesting, and a brutalist concrete facade softened by indigenous vertical gardens.",
    sustainablePrinciples: [
      "Passive cooling & natural ventilation",
      "Rainwater harvesting systems",
      "Indigenous vertical gardens",
      "Low-carbon concrete"
    ],
    client: "TechVentures Africa",
    year: "2025"
  },
  { 
    id: 2,
    title: "Kisumu Waterfront", 
    category: "Master Plan", 
    img: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A comprehensive urban renewal project transforming the lakefront into a vibrant public space. Integrates flood mitigation infrastructure with pedestrian promenades and commercial zones.",
    sustainablePrinciples: [
      "Flood mitigation infrastructure",
      "Permeable paving for stormwater management",
      "Solar-powered public lighting",
      "Native riparian planting"
    ],
    client: "County Government",
    year: "2024"
  },
  { 
    id: 3,
    title: "Rift Valley Eco-Lodge", 
    category: "Hospitality", 
    img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A luxury retreat designed to blend seamlessly with the dramatic topography of the Great Rift Valley. Constructed using locally sourced stone and timber, minimizing environmental impact.",
    sustainablePrinciples: [
      "Locally sourced stone and timber",
      "Off-grid solar energy system",
      "Greywater recycling",
      "Minimal topographical disruption"
    ],
    client: "Private Developer",
    year: "2023"
  },
  { 
    id: 4,
    title: "Mombasa Transit Center", 
    category: "Infrastructure", 
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A modern, high-capacity transit hub designed to streamline regional mobility. The sweeping roof structure provides natural ventilation and shade for thousands of daily commuters.",
    sustainablePrinciples: [
      "Sweeping roof for natural shading",
      "Cross-ventilation optimization",
      "High-albedo roofing materials",
      "Energy-efficient LED lighting"
    ],
    client: "Ministry of Transport",
    year: "2024"
  },
  { 
    id: 5,
    title: "Konza City Phase 1", 
    category: "Construction Management", 
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888087525-cebf96516254?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "End-to-end construction management for the first phase of the Konza Technopolis. Ensuring strict adherence to architectural blueprints, budget control, and sustainable building practices.",
    sustainablePrinciples: [
      "Smart grid integration",
      "Zero-waste construction protocols",
      "Recycled steel framework",
      "Centralized cooling district"
    ],
    client: "Konza Technopolis Development Authority",
    year: "2025"
  }
];

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Portfolio() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const selectedProject = projects.find(p => p.id === selectedId);

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
          <span className="font-display font-bold text-[15rem] leading-none text-steel">PORTFOLIO</span>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 max-w-4xl"
        >
          <motion.h1 variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase">
            Built Environment.<br/>
            <span className="text-bronze">Realized Vision.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-concrete/80 max-w-2xl font-light leading-relaxed">
            A curated selection of our architectural and urban planning projects across East Africa. Click to explore the details.
          </motion.p>
        </motion.div>
      </section>

      {/* Grid Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {projects.map((project) => (
            <motion.div 
              variants={fadeInUp}
              key={project.id} 
              className="group cursor-pointer relative"
              onClick={() => { setSelectedId(project.id); setCurrentImageIndex(0); }}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-charcoal mb-4">
                <img 
                  src={project.img} 
                  alt={project.title} 
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity group-hover:mix-blend-normal"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none group-hover:border-bronze/50 transition-colors duration-500"></div>
                <div className="absolute bottom-4 right-4 bg-charcoal/90 p-3 text-concrete opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm border border-steel/30">
                  <Maximize2 size={20} />
                </div>
              </div>
              <h3 className="font-display font-bold text-2xl uppercase group-hover:text-bronze transition-colors flex items-center justify-between">
                {project.title}
                <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
              <p className="text-sm font-mono text-steel uppercase tracking-wider mt-1">{project.category}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedId && selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-charcoal/90 backdrop-blur-md"
            onClick={() => setSelectedId(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-concrete w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row border border-steel/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full md:w-3/5 h-[40vh] md:h-auto relative bg-charcoal group">
                <img 
                  src={selectedProject.images ? selectedProject.images[currentImageIndex] : selectedProject.img} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                {selectedProject.images && selectedProject.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images!.length - 1 : prev - 1)); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-concrete/80 hover:bg-concrete text-charcoal p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === selectedProject.images!.length - 1 ? 0 : prev + 1)); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-concrete/80 hover:bg-concrete text-charcoal p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedProject.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-bronze w-6' : 'bg-concrete/50 hover:bg-concrete'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="self-end text-steel hover:text-bronze transition-colors mb-8"
                >
                  <X size={32} />
                </button>
                
                <p className="text-sm font-mono text-bronze uppercase tracking-widest mb-2">{selectedProject.category}</p>
                <h2 className="font-display text-4xl font-bold uppercase tracking-tighter mb-8">{selectedProject.title}</h2>
                
                <p className="text-lg text-charcoal/80 leading-relaxed mb-8">
                  {selectedProject.description}
                </p>

                {selectedProject.sustainablePrinciples && (
                  <div className="mb-12 flex-grow">
                    <p className="text-xs font-mono text-steel uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Leaf size={14} className="text-bronze" /> Sustainable Principles
                    </p>
                    <ul className="space-y-2">
                      {selectedProject.sustainablePrinciples.map((principle, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-charcoal/80">
                          <span className="text-bronze mt-1">•</span>
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-8 border-t border-steel/30 pt-8 mt-auto">
                  <div>
                    <p className="text-xs font-mono text-steel uppercase tracking-widest mb-1">Client</p>
                    <p className="font-bold uppercase">{selectedProject.client}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-steel uppercase tracking-widest mb-1">Year</p>
                    <p className="font-bold uppercase">{selectedProject.year}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
