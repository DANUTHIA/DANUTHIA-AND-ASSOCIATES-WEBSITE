import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ArrowRight, ChevronLeft, ChevronRight, Leaf, Wind, Droplets, Sun, Zap, Recycle, Trees, Check } from 'lucide-react';
import Magnetic from '../components/Magnetic';

const projects = [
  { 
    id: 1,
    title: "Nairobi Tech Hub", 
    category: "Commercial", 
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387762-592dee58ef4e?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A 15-story sustainable commercial center designed to foster innovation in Nairobi's growing tech sector. The design utilizes a high-performance post-tensioned concrete frame to maximize open floor plans while integrating advanced passive cooling systems and a signature brutalist facade.",
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
    title: "Karen Luxury Villa", 
    category: "Residential", 
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "This residential masterpiece redefines luxury through architectural precision and site-specific design. The villa features a complex cantilevered roof structure and seamless glass-to-glass corners, blending modern minimalism with the natural topography of the Karen suburbs.",
    sustainablePrinciples: [
      "Solar power integration",
      "Natural stone cladding",
      "Smart home automation",
      "Drought-resistant landscaping"
    ],
    client: "Private Client",
    year: "2024"
  },
  { 
    id: 3,
    title: "The Loft Office", 
    category: "Interior Design", 
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "An interior transformation that optimizes workflow through spatial engineering and biophilic design. The project features exposed structural elements, custom acoustic baffles, and a flexible modular layout designed for the modern creative workforce.",
    sustainablePrinciples: [
      "Recycled timber furniture",
      "Energy-efficient lighting",
      "Low-VOC paints",
      "Biophilic design elements"
    ],
    client: "Creative Pulse",
    year: "2023"
  },
  { 
    id: 4,
    title: "Mombasa Transit Center", 
    category: "Commercial", 
    img: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473163928189-3f4b2c7e33e6?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A large-scale infrastructure project designed for extreme coastal conditions and high commuter volume. The center features a revolutionary aerodynamic roof structure that facilitates massive natural airflow, reducing the need for active cooling in Mombasa's humid climate.",
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
    title: "Serene Heights Apartments", 
    category: "Residential", 
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503387837-b154ad5074bc?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A high-density residential development that prioritizes structural longevity and community wellbeing. The project integrates pre-cast concrete technology for rapid, high-quality construction and features extensive greywater recycling systems.",
    sustainablePrinciples: [
      "Community rooftop gardens",
      "Greywater recycling",
      "Passive solar heating",
      "Permeable paving"
    ],
    client: "Skyline Developers",
    year: "2025"
  },
  { 
    id: 6,
    title: "Great Rift Valley Masterplan", 
    category: "Urban Planning", 
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A visionary regional planning initiative balancing industrial growth with ecological preservation. This project involves the strategic zoning of 50,000 hectares through advanced GIS mapping and sustainable land-use policies.",
    sustainablePrinciples: [
      "Wildlife corridor protection",
      "Renewable energy zoning",
      "Eco-tourism infrastructure",
      "Sustainable land management"
    ],
    client: "Regional Development Authority",
    year: "2026"
  },
  { 
    id: 7,
    title: "Tana River Bridge", 
    category: "Infrastructure", 
    img: "https://images.unsplash.com/photo-1545143333-11bb321d5b88?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1545143333-11bb321d5b88?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522333323-32663f1010a6?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A pinnacle of structural engineering spanning the Tana River. This cable-stayed bridge spans 400 meters, utilizing high-tensile steel and high-performance concrete with integrated structural health monitoring sensors.",
    sustainablePrinciples: [
      "High-performance materials",
      "Advanced seismic design",
      "Minimal environmental footprint",
      "Solar-powered lighting"
    ],
    client: "National Highways Authority",
    year: "2024"
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
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const selectedProject = projects.find(p => p.id === selectedId);

  const getPrincipleIcon = (principle: string) => {
    const p = principle.toLowerCase();
    if (p.includes('cooling') || p.includes('ventilation')) return <Wind size={14} />;
    if (p.includes('water')) return <Droplets size={14} />;
    if (p.includes('solar') || p.includes('energy') || p.includes('power') || p.includes('lighting')) return <Zap size={14} />;
    if (p.includes('garden') || p.includes('landscaping') || p.includes('biophilic') || p.includes('trees')) return <Trees size={14} />;
    if (p.includes('recycled') || p.includes('timber')) return <Recycle size={14} />;
    return <Leaf size={14} />;
  };

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
          <span className="font-display font-bold text-[12vw] leading-none text-steel whitespace-nowrap">PORTFOLIO</span>
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
                Built Environment.<br/>
                <span className="text-bronze font-light italic">Realized Vision.</span>
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-bronze pl-6">
                A curated selection of our architectural and urban planning projects across East Africa. Click to explore the details.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Grid Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        {/* Filter Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 mb-16 justify-center md:justify-start"
        >
          {categories.map((cat) => (
            <Magnetic key={cat}>
              <button
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal' 
                    : 'bg-transparent border border-charcoal/20 dark:border-concrete/20 text-charcoal dark:text-concrete hover:border-charcoal dark:hover:border-concrete'
                }`}
              >
                {cat}
              </button>
            </Magnetic>
          ))}
        </motion.div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-y-24 gap-x-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                key={project.id} 
                className={`group cursor-pointer relative ${index % 2 !== 0 ? 'md:mt-24' : ''} p-4 rounded-xl border border-transparent hover:border-bronze/30 hover:bg-bronze/5 transition-all duration-500 hover:-translate-y-2`}
                onClick={() => { setSelectedId(project.id); setCurrentImageIndex(0); }}
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-charcoal mb-6 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-500">
                  <img 
                    src={project.img} 
                    alt={project.title} 
                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 mix-blend-luminosity group-hover:mix-blend-normal"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border border-steel/20 m-4 pointer-events-none group-hover:border-bronze/50 transition-colors duration-700"></div>
                  <div className="absolute bottom-6 right-6 bg-charcoal/90 p-4 text-concrete opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm border border-steel/30 rounded-full">
                    <Maximize2 size={20} />
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-3xl uppercase text-charcoal dark:text-concrete group-hover:text-bronze dark:group-hover:text-bronze transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm font-mono text-charcoal/60 dark:text-concrete/60 uppercase tracking-widest transition-colors duration-500">{project.category}</p>
                  </div>
                  <span className="font-display text-xl italic text-steel dark:text-concrete/50 group-hover:text-bronze dark:group-hover:text-bronze transition-colors">
                    {project.year}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedId && selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-charcoal/95 backdrop-blur-xl"
            onClick={() => setSelectedId(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-concrete dark:bg-charcoal w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row border border-steel/30 dark:border-concrete/20 transition-colors duration-500"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full md:w-3/5 h-[50vh] md:h-auto relative bg-charcoal dark:bg-[#111111] group transition-colors duration-500">
                <img 
                  src={selectedProject.images ? selectedProject.images[currentImageIndex] : selectedProject.img} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                {selectedProject.images && selectedProject.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images!.length - 1 : prev - 1)); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-concrete/80 dark:bg-charcoal/80 hover:bg-concrete dark:hover:bg-charcoal text-charcoal dark:text-concrete p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === selectedProject.images!.length - 1 ? 0 : prev + 1)); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-concrete/80 dark:bg-charcoal/80 hover:bg-concrete dark:hover:bg-charcoal text-charcoal dark:text-concrete p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      {selectedProject.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-bronze w-8' : 'bg-concrete/50 dark:bg-charcoal/50 hover:bg-concrete dark:hover:bg-charcoal w-2'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-2/5 p-8 md:p-16 flex flex-col bg-concrete dark:bg-charcoal transition-colors duration-500">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="self-end text-steel dark:text-concrete/50 hover:text-bronze dark:hover:text-bronze transition-colors mb-8 bg-steel/10 dark:bg-concrete/10 p-2 rounded-full"
                >
                  <X size={24} />
                </button>
                
                <p className="text-sm font-mono text-bronze uppercase tracking-widest mb-4">{selectedProject.category}</p>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-8 leading-none text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.title}</h2>
                
                <p className="text-lg text-charcoal/80 dark:text-concrete/80 leading-relaxed mb-10 font-light transition-colors duration-500">
                  {selectedProject.description}
                </p>

                {selectedProject.sustainablePrinciples && (
                  <div className="mb-12 flex-grow">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-500">
                          <span className="w-8 h-px bg-bronze/50"></span>
                          Sustainable Principles
                        </p>
                        <h4 className="font-display text-2xl font-medium mt-1 text-charcoal dark:text-concrete">Eco-Impact Strategy</h4>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 rounded-full bg-bronze/10 border border-bronze/30 text-[10px] font-mono text-bronze uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-bronze rounded-full animate-pulse"></div>
                          Eco-Certified
                        </div>
                        <span className="text-[9px] font-mono text-steel mt-1 uppercase tracking-tighter">LEED Gold Equivalent</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProject.sustainablePrinciples.map((principle, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#111111] border border-steel/10 dark:border-concrete/10 hover:border-bronze/40 hover:bg-bronze/5 transition-all duration-500 group/item shadow-sm hover:shadow-md"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-bronze/10 flex items-center justify-center text-bronze group-hover/item:bg-bronze group-hover/item:text-white transition-all duration-500 flex-shrink-0 shadow-inner">
                            {getPrincipleIcon(principle)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-charcoal/90 dark:text-concrete/90 transition-colors duration-500 leading-tight">
                              {principle}
                            </span>
                            <span className="text-[10px] font-mono text-steel/60 uppercase tracking-tighter mt-1">Verified Strategy</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Sustainability Meter */}
                    <div className="mt-10 p-8 rounded-3xl bg-bronze/5 border border-bronze/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <Leaf className="text-bronze/10 w-16 h-16 -rotate-12" />
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-bronze font-bold">Sustainability Score</span>
                          <span className="text-xs text-steel/70 mt-1">Environmental Performance Index</span>
                        </div>
                        <span className="text-3xl font-display italic text-bronze">94/100</span>
                      </div>
                      <div className="w-full h-2 bg-bronze/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '94%' }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-bronze/50 to-bronze"
                        />
                      </div>
                      <p className="text-xs text-steel/70 mt-6 leading-relaxed italic">
                        This project exceeds regional sustainability benchmarks through integrated passive design and high-efficiency structural systems.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-8 border-t border-steel/30 dark:border-concrete/20 pt-8 mt-auto transition-colors duration-500">
                  <div>
                    <p className="text-xs font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-2 transition-colors duration-500">Client</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.client}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-2 transition-colors duration-500">Year</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.year}</p>
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
