import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ArrowRight, ChevronLeft, ChevronRight, Leaf, Wind, Droplets, Sun, Zap, Recycle, Trees, Check, Grid, Map as MapIcon, Clock, Layers } from 'lucide-react';
import Magnetic from '../components/Magnetic';
import TechnicalOverlay from '../components/TechnicalOverlay';
import MaterialityGrid from '../components/MaterialityGrid';

const projects = [
  { 
    id: 1,
    title: "Nairobi Tech Hub", 
    category: "Commercial", 
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-68a6daefba28?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A 15-story sustainable commercial center designed to foster innovation in Nairobi's growing tech sector. The design utilizes a high-performance post-tensioned concrete frame to maximize open floor plans while integrating advanced passive cooling systems and a signature brutalist facade.",
    sustainablePrinciples: [
      "Passive cooling & natural ventilation",
      "Rainwater harvesting systems",
      "Indigenous vertical gardens",
      "Low-carbon concrete"
    ],
    materials: [
      { name: "Raw Concrete", description: "Exposed structural finish", textureUrl: "https://images.unsplash.com/photo-1590069261209-48e3b9737d12?q=80&w=1600&auto=format&fit=crop" },
      { name: "Structural Steel", description: "High-tensile framework", textureUrl: "https://images.unsplash.com/photo-1504917595217-d4f5ebe612b0?q=80&w=1600&auto=format&fit=crop" }
    ],
    processGallery: [
      { type: "concept", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop", caption: "Initial Massing Sketches" },
      { type: "plan", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop", caption: "Ground Floor Public Integration" }
    ],
    client: "TechVentures Africa",
    year: "2025",
    area: "45,000 sqm",
    location: "Nairobi, Kenya",
    status: "Under Construction",
    lifecyclePhase: 5,
    siteData: { wind: "NE 14km/h", solar: "High Exposure", rainfall: "850mm/yr" },
    collaborators: "Arup, Buro Happold"
  },
  { 
    id: 2,
    title: "Karen Luxury Villa", 
    category: "Residential", 
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613545325278-f24b0c68c463?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "This residential masterpiece redefines luxury through architectural precision and site-specific design. The villa features a complex cantilevered roof structure and seamless glass-to-glass corners, blending modern minimalism with the natural topography of the Karen suburbs.",
    sustainablePrinciples: [
      "Solar power integration",
      "Natural stone cladding",
      "Smart home automation",
      "Drought-resistant landscaping"
    ],
    client: "Private Client",
    year: "2024",
    area: "1,200 sqm",
    location: "Karen, Nairobi",
    status: "Completed",
    lifecyclePhase: 5,
    siteData: { wind: "E 10km/h", solar: "Moderate", rainfall: "1050mm/yr" },
    collaborators: "Studio Studio, L&D Landscapes"
  },
  { 
    id: 3,
    title: "The Loft Office", 
    category: "Interior Design", 
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-68a6daefba28?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215410103-6cb4a4130090?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "An interior transformation that optimizes workflow through spatial engineering and biophilic design. The project features exposed structural elements, custom acoustic baffles, and a flexible modular layout designed for the modern creative workforce.",
    sustainablePrinciples: [
      "Recycled timber furniture",
      "Energy-efficient lighting",
      "Low-VOC paints",
      "Biophilic design elements"
    ],
    client: "Creative Pulse",
    year: "2023",
    area: "800 sqm",
    location: "Westlands, Nairobi",
    status: "Completed",
    lifecyclePhase: 5,
    siteData: { wind: "N/A (Interior)", solar: "Optimized West", rainfall: "N/A" },
    collaborators: "Herman Miller, Philips Lighting"
  },
  { 
    id: 4,
    title: "Mombasa Transit Terminal", 
    category: "Aviation & Transportation", 
    img: "https://images.unsplash.com/photo-1413844053676-e137b7ca57fa?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1413844053676-e137b7ca57fa?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545622780-6bc53716a495?q=80&w=1600&auto=format&fit=crop",
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
    year: "2024",
    area: "12,000 sqm",
    location: "Mombasa, Kenya",
    status: "Completed",
    lifecyclePhase: 5,
    siteData: { wind: "SE 22km/h", solar: "Extreme", rainfall: "1200mm/yr" },
    collaborators: "Mott MacDonald, KURA"
  },
  { 
    id: 5,
    title: "Kisumu Medical Center", 
    category: "Healthcare", 
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A state-of-the-art regional hospital focused on patient-centered care and operational efficiency. The design integrates healing gardens and maximizes natural light to improve patient outcomes and staff well-being.",
    sustainablePrinciples: [
      "Healing gardens & biophilia",
      "High-efficiency HVAC systems",
      "Medical waste management",
      "Solar thermal water heating"
    ],
    client: "County Government of Kisumu",
    year: "2025",
    area: "25,000 sqm",
    location: "Kisumu, Kenya",
    status: "Under Construction",
    lifecyclePhase: 4,
    siteData: { wind: "W 12km/h", solar: "High", rainfall: "1100mm/yr" },
    collaborators: "GE Healthcare, Perkins&Will"
  },
  { 
    id: 6,
    title: "Nairobi Science & Tech Park", 
    category: "Science & Technology", 
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1600&auto=format&fit=crop"
    ],
    description: "A collaborative research environment designed to accelerate innovation in biotechnology and renewable energy. The facility features flexible lab spaces, advanced filtration systems, and a high-performance envelope.",
    sustainablePrinciples: [
      "Advanced air filtration",
      "Flexible modular labs",
      "Smart energy monitoring",
      "Water reclamation"
    ],
    client: "Konza Technopolis",
    year: "2026",
    area: "35,000 sqm",
    location: "Machakos, Kenya",
    status: "Design Phase",
    lifecyclePhase: 2,
    siteData: { wind: "NE 15km/h", solar: "High", rainfall: "800mm/yr" },
    collaborators: "Arup, HDR"
  },
  { 
    id: 7,
    title: "Tana River Bridge", 
    category: "Infrastructure", 
    img: "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=1600&auto=format&fit=crop",
    diagram: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522333323-32663f1010a6?q=80&w=1600&auto=format&fit=crop"
    ],
    processGallery: [
      { type: "concept", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop", caption: "Initial Suspension Sketch" },
      { type: "elevation", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop", caption: "Longitudinal Elevation" },
      { type: "render", url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=1600&auto=format&fit=crop", caption: "Final Structural Rendering" },
    ],
    description: "A pinnacle of structural engineering spanning the Tana River. This cable-stayed bridge spans 400 meters, utilizing high-tensile steel and high-performance concrete with integrated structural health monitoring sensors.",
    sustainablePrinciples: [
      "High-performance materials",
      "Advanced seismic design",
      "Minimal environmental footprint",
      "Solar-powered lighting"
    ],
    client: "National Highways Authority",
    year: "2024",
    area: "400m span",
    location: "Tana River County",
    status: "Completed",
    lifecyclePhase: 5,
    siteData: { wind: "E 18km/h", solar: "High Exposure", rainfall: "400mm/yr" },
    collaborators: "COWI, KeNHA"
  }
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1600&auto=format&fit=crop"
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
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'photo' | 'diagram' | 'process'>('photo');
  const [showTechnicalSpecs, setShowTechnicalSpecs] = useState(false);
  const [hoveredIndexImage, setHoveredIndexImage] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'index' | 'timeline' | 'map'>('grid');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500 bg-blueprint-grid">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-charcoal">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={heroImageIndex}
            src={HERO_IMAGES[heroImageIndex]}
            alt="Portfolio Showcase"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent pointer-events-none"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl"
          >
            <motion.h1 variants={fadeInUp} className="font-display text-6xl md:text-8xl font-bold leading-[0.85] tracking-tighter mb-8 text-concrete uppercase">
              Selected <br/> Works
            </motion.h1>
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-t border-concrete/20 pt-8">
              <p className="text-lg md:text-2xl text-concrete/80 font-light leading-relaxed max-w-xl">
                A curated selection of our architectural and urban planning projects across East Africa.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16"
        >
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {categories.map((cat) => (
              <Magnetic key={cat}>
                <button
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 rounded-none text-[10px] font-mono uppercase tracking-widest transition-all duration-300 ${
                    filter === cat 
                      ? 'bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal' 
                      : 'bg-transparent border border-charcoal/20 dark:border-concrete/20 text-charcoal dark:text-concrete hover:border-charcoal dark:hover:border-concrete'
                  }`}
                >
                  {cat}
                </button>
              </Magnetic>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex border border-charcoal/20 dark:border-concrete/20 p-1">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-2 transition-colors ${displayMode === 'grid' ? 'bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal' : 'text-charcoal/50 dark:text-concrete/50 hover:text-charcoal dark:hover:text-concrete'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setDisplayMode('map')}
              className={`p-2 transition-colors ${displayMode === 'map' ? 'bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal' : 'text-charcoal/50 dark:text-concrete/50 hover:text-charcoal dark:hover:text-concrete'}`}
            >
              <MapIcon size={16} />
            </button>
            <button
              onClick={() => setDisplayMode('timeline')}
              className={`p-2 transition-colors ${displayMode === 'timeline' ? 'bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal' : 'text-charcoal/50 dark:text-concrete/50 hover:text-charcoal dark:hover:text-concrete'}`}
            >
              <Clock size={16} />
            </button>
          </div>
        </motion.div>

        {displayMode === 'grid' && (
          <motion.div 
            layout
            className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  key={project.id} 
                  className="group relative cursor-pointer break-inside-avoid"
                  onClick={() => { setSelectedId(project.id); setCurrentImageIndex(0); }}
                >
                  <div className="overflow-hidden bg-charcoal/5">
                    <img 
                      src={project.img} 
                      alt={project.title} 
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="mt-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div>
                      <h3 className="font-display text-xl font-medium tracking-tight text-charcoal dark:text-concrete">
                        {project.title}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-charcoal/50 dark:text-concrete/50 mt-1">
                        {project.category}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {displayMode === 'index' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col md:flex-row gap-8 border-t border-charcoal/20 dark:border-concrete/20 pt-8"
          >
            <div className="w-full md:w-2/3 flex flex-col">
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-charcoal/40 dark:border-concrete/40 text-[10px] font-mono uppercase tracking-widest text-charcoal/50 dark:text-concrete/50">
                <div className="col-span-1">ID</div>
                <div className="col-span-4">Project</div>
                <div className="col-span-3">Typology</div>
                <div className="col-span-2">Area</div>
                <div className="col-span-2 text-right">Year</div>
              </div>
              {filteredProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="grid grid-cols-12 gap-4 py-4 border-b border-charcoal/10 dark:border-concrete/10 hover:bg-charcoal/5 dark:hover:bg-concrete/5 cursor-pointer transition-colors items-center group"
                  onClick={() => { setSelectedId(project.id); setCurrentImageIndex(0); }}
                  onMouseEnter={() => setHoveredIndexImage(project.img)}
                  onMouseLeave={() => setHoveredIndexImage(null)}
                >
                  <div className="col-span-1 font-mono text-xs text-charcoal/50 dark:text-concrete/50">{(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="col-span-4 font-display font-bold uppercase group-hover:text-accent transition-colors">{project.title}</div>
                  <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-charcoal/70 dark:text-concrete/70">{project.category}</div>
                  <div className="col-span-2 font-mono text-xs text-charcoal/70 dark:text-concrete/70">{project.area}</div>
                  <div className="col-span-2 font-mono text-xs text-right text-charcoal/70 dark:text-concrete/70">{project.year}</div>
                </div>
              ))}
            </div>
            <div className="hidden md:block w-full md:w-1/3 relative min-h-[400px] bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/10 dark:border-concrete/10 overflow-hidden">
              <AnimatePresence>
                {hoveredIndexImage ? (
                  <motion.img
                    key={hoveredIndexImage}
                    src={hoveredIndexImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full object-cover  "
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-charcoal/30 dark:text-concrete/30 uppercase tracking-widest"
                  >
                    Hover to preview
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {displayMode === 'map' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-[60vh] bg-charcoal relative border border-accent/30 overflow-hidden flex items-center justify-center mt-8"
          >
            {/* GIS Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
              backgroundImage: `
                linear-gradient(to right, #b8860b 1px, transparent 1px),
                linear-gradient(to bottom, #b8860b 1px, transparent 1px)
              `, 
              backgroundSize: '40px 40px' 
            }}></div>
            
            {/* Crosshairs */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-full h-[1px] bg-accent absolute top-1/2 -translate-y-1/2"></div>
              <div className="h-full w-[1px] bg-accent absolute left-1/2 -translate-x-1/2"></div>
              <div className="w-32 h-32 border border-accent rounded-full absolute"></div>
              <div className="w-64 h-64 border border-accent rounded-full absolute opacity-50"></div>
              <div className="w-96 h-96 border border-accent rounded-full absolute opacity-20"></div>
            </div>

            {/* Simulated Project Coordinates */}
            {filteredProjects.map((project, idx) => {
              // Generate pseudo-random but consistent coordinates based on ID
              const idNum = typeof project.id === 'string' ? parseInt(project.id, 10) : project.id;
              const x = 50 + Math.sin(idNum * 123) * 35;
              const y = 50 + Math.cos(idNum * 321) * 35;
              
              return (
                <div 
                  key={project.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => { setSelectedId(project.id); setCurrentImageIndex(0); }}
                >
                  <div className="w-3 h-3 bg-accent relative z-10 shadow-[0_0_10px_rgba(184,134,11,0.8)] animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-accent rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-4 left-4 bg-charcoal/90 backdrop-blur-sm border border-accent/50 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-20">
                    <p className="text-[9px] font-mono text-accent uppercase tracking-widest mb-1">LOC: {x.toFixed(2)}°N, {y.toFixed(2)}°E</p>
                    <h4 className="font-display text-sm font-bold text-concrete uppercase truncate">{project.title}</h4>
                    <p className="text-[10px] font-mono text-concrete/60 uppercase">{project.location}</p>
                  </div>
                </div>
              );
            })}

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-accent uppercase tracking-widest bg-charcoal/80 p-2 border border-accent/30">
              SYS.GIS_PLOTTER // ACTIVE
            </div>
          </motion.div>
        )}

        {displayMode === 'timeline' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-0 border-l border-charcoal/20 dark:border-concrete/20 ml-4 md:ml-8"
          >
            {filteredProjects.sort((a, b) => parseInt(b.year) - parseInt(a.year)).map((project, index) => (
              <div key={project.id} className="relative pl-8 md:pl-16 py-12 border-b border-charcoal/10 dark:border-concrete/10 group cursor-pointer" onClick={() => { setSelectedId(project.id); setCurrentImageIndex(0); }}>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-charcoal dark:bg-concrete group-hover:bg-accent transition-colors duration-300"></div>
                <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                  <div className="w-full md:w-1/3">
                    <div className="aspect-video relative overflow-hidden  group-hover:-0 transition-all duration-500 border border-charcoal/20 dark:border-concrete/20">
                      <img src={project.img} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col">
                    <span className="font-display text-4xl font-bold text-accent mb-2">{project.year}</span>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-4">{project.title}</h3>
                    <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest text-charcoal/60 dark:text-concrete/60">
                      <span>{project.category}</span>
                      <span>•</span>
                      <span>{project.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedId && selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-charcoal/95 backdrop-blur-xl"
            onClick={() => { setSelectedId(null); setShowTechnicalSpecs(false); }}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-concrete dark:bg-charcoal w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row border border-steel/30 dark:border-concrete/20 transition-colors duration-500"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full md:w-3/5 h-[50vh] md:h-auto relative bg-charcoal dark:bg-charcoal group transition-colors duration-500 overflow-hidden">
                {viewMode === 'process' && selectedProject.processGallery ? (
                  <div className="absolute inset-0 overflow-y-auto no-scrollbar snap-y snap-mandatory bg-concrete dark:bg-charcoal">
                    {selectedProject.processGallery.map((process, idx) => (
                      <div key={idx} className="h-full w-full relative snap-start flex flex-col justify-center items-center p-8 md:p-16">
                        <span className="absolute top-8 left-8 text-[10px] font-mono text-charcoal/50 dark:text-concrete/50 uppercase tracking-[0.2em]">0{idx + 1} // {process.type}</span>
                        <div className="w-full h-[70%] relative overflow-hidden border border-steel/10 bg-black/5 dark:bg-black/20">
                          <img src={process.url} className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal" alt={process.caption} referrerPolicy="no-referrer" />
                        </div>
                        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete">{process.caption}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <img 
                    src={viewMode === 'photo' ? (selectedProject.images ? selectedProject.images[currentImageIndex] : selectedProject.img) : (selectedProject.diagram || selectedProject.img)} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                <TechnicalOverlay active={showTechnicalSpecs} />
                
                {/* View Toggle */}
                <div className="absolute top-6 left-6 flex bg-charcoal/50 backdrop-blur-md rounded-none p-1 border border-steel/20 z-30">
                  <button 
                    onClick={() => setViewMode('photo')}
                    className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'photo' ? 'bg-accent text-concrete dark:text-charcoal' : 'text-concrete hover:text-accent dark:hover:text-concrete'}`}
                  >
                    Photo
                  </button>
                  <button 
                    onClick={() => setViewMode('diagram')}
                    className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'diagram' ? 'bg-accent text-concrete dark:text-charcoal' : 'text-concrete hover:text-accent dark:hover:text-concrete'}`}
                  >
                    Diagram
                  </button>
                  <button 
                    onClick={() => setViewMode('process')}
                    className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'process' ? 'bg-accent text-concrete dark:text-charcoal' : 'text-concrete hover:text-accent dark:hover:text-concrete'}`}
                  >
                    Process
                  </button>
                  <button 
                    onClick={() => setShowTechnicalSpecs(!showTechnicalSpecs)}
                    className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all ${showTechnicalSpecs ? 'bg-accent text-concrete dark:text-charcoal' : 'text-concrete hover:text-accent dark:hover:text-concrete'}`}
                  >
                    <Layers size={16} />
                  </button>
                </div>

                {selectedProject.images && selectedProject.images.length > 1 && viewMode === 'photo' && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images!.length - 1 : prev - 1)); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-concrete/80 dark:bg-charcoal/80 hover:bg-concrete dark:hover:bg-charcoal text-charcoal dark:text-concrete p-3 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === selectedProject.images!.length - 1 ? 0 : prev + 1)); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-concrete/80 dark:bg-charcoal/80 hover:bg-concrete dark:hover:bg-charcoal text-charcoal dark:text-concrete p-3 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      {selectedProject.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={`h-1.5 rounded-none transition-all ${idx === currentImageIndex ? 'bg-accent w-8' : 'bg-concrete/50 dark:bg-charcoal/50 hover:bg-concrete dark:hover:bg-charcoal w-2'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-2/5 p-8 md:p-16 flex flex-col bg-concrete dark:bg-charcoal transition-colors duration-500">
                <button 
                  onClick={() => { setSelectedId(null); setShowTechnicalSpecs(false); }}
                  className="self-end text-steel dark:text-concrete/50 hover:text-accent dark:hover:text-accent transition-colors mb-8 bg-steel/10 dark:bg-concrete/10 p-2 rounded-none"
                >
                  <X size={24} />
                </button>
                
                <p className="text-sm font-mono text-accent uppercase tracking-widest mb-4">{selectedProject.category}</p>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-8 leading-none text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.title}</h2>
                
                <p className="text-lg text-charcoal/80 dark:text-concrete/80 leading-relaxed mb-10 font-light transition-colors duration-500">
                  {selectedProject.description}
                </p>

                {selectedProject.materials && (
                  <div className="mb-12">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-500 mb-6">
                      <span className="w-8 h-px bg-accent/50"></span>
                      Materiality
                    </p>
                    <MaterialityGrid materials={selectedProject.materials} />
                  </div>
                )}

                {selectedProject.sustainablePrinciples && (
                  <div className="mb-12 flex-grow">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-500">
                          <span className="w-8 h-px bg-accent/50"></span>
                          Sustainable Principles
                        </p>
                        <h4 className="font-display text-2xl font-medium mt-1 text-charcoal dark:text-concrete">Eco-Impact Strategy</h4>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 rounded-none bg-accent/10 border border-accent/30 text-[10px] font-mono text-accent uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent rounded-none animate-pulse"></div>
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
                          className="flex items-center gap-4 p-5 rounded-none bg-concrete dark:bg-charcoal border border-steel/10 dark:border-concrete/10 hover:border-accent/40 hover:bg-accent/5 transition-all duration-500 group/item shadow-sm hover:shadow-md"
                        >
                          <div className="w-12 h-12 rounded-none bg-accent/10 flex items-center justify-center text-accent group-hover/item:bg-accent group-hover/item:text-concrete dark:group-hover/item:text-charcoal transition-all duration-500 flex-shrink-0 shadow-inner">
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
                    <div className="mt-10 p-8 rounded-none bg-accent/5 border border-accent/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <Leaf className="text-accent/10 w-16 h-16 -rotate-12" />
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">Sustainability Score</span>
                          <span className="text-xs text-steel/70 mt-1">Environmental Performance Index</span>
                        </div>
                        <span className="text-3xl font-display font-bold text-accent">94/100</span>
                      </div>
                      <div className="w-full h-2 bg-accent/10 rounded-none overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '94%' }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                          className="h-full bg-accent"
                        />
                      </div>
                      <p className="text-xs text-steel/70 mt-6 leading-relaxed uppercase font-mono">
                        This project exceeds regional sustainability benchmarks through integrated passive design and high-efficiency structural systems.
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedProject.siteData && (
                  <div className="mb-12">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-500 mb-6">
                      <span className="w-8 h-px bg-accent/50"></span>
                      Climatic & Site Analysis
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-charcoal/5 dark:bg-concrete/5 p-4 border border-steel/10 dark:border-concrete/10">
                        <Wind className="text-accent mb-2" size={16} />
                        <p className="text-[9px] font-mono uppercase tracking-widest text-steel dark:text-concrete/50 mb-1">Prevailing Wind</p>
                        <p className="font-bold text-xs text-charcoal dark:text-concrete">{selectedProject.siteData.wind}</p>
                      </div>
                      <div className="bg-charcoal/5 dark:bg-concrete/5 p-4 border border-steel/10 dark:border-concrete/10">
                        <Sun className="text-accent mb-2" size={16} />
                        <p className="text-[9px] font-mono uppercase tracking-widest text-steel dark:text-concrete/50 mb-1">Solar Orientation</p>
                        <p className="font-bold text-xs text-charcoal dark:text-concrete">{selectedProject.siteData.solar}</p>
                      </div>
                      <div className="bg-charcoal/5 dark:bg-concrete/5 p-4 border border-steel/10 dark:border-concrete/10">
                        <Droplets className="text-accent mb-2" size={16} />
                        <p className="text-[9px] font-mono uppercase tracking-widest text-steel dark:text-concrete/50 mb-1">Annual Rainfall</p>
                        <p className="font-bold text-xs text-charcoal dark:text-concrete">{selectedProject.siteData.rainfall}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedProject.lifecyclePhase && (
                  <div className="mb-12">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-500 mb-6">
                      <span className="w-8 h-px bg-accent/50"></span>
                      Architectural Lifecycle
                    </p>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-xs text-charcoal dark:text-concrete uppercase">{selectedProject.status}</span>
                      <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Phase {selectedProject.lifecyclePhase}/5</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      {[1, 2, 3, 4, 5].map((phase) => (
                        <div 
                          key={phase} 
                          className={`flex-1 ${phase <= selectedProject.lifecyclePhase! ? 'bg-accent' : 'bg-steel/20 dark:bg-concrete/20'}`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[8px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest">
                      <span>Concept</span>
                      <span>SD</span>
                      <span>DD</span>
                      <span>CD</span>
                      <span>Built</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-steel/30 dark:border-concrete/20 pt-8 mt-auto transition-colors duration-500">
                  <div className="flex flex-col border-b border-steel/10 pb-4">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Client</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.client}</p>
                  </div>
                  <div className="flex flex-col border-b border-steel/10 pb-4">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Location</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.location}</p>
                  </div>
                  <div className="flex flex-col border-b border-steel/10 pb-4">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Area</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.area}</p>
                  </div>
                  <div className="flex flex-col border-b border-steel/10 pb-4">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Typology</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.category}</p>
                  </div>
                  <div className="flex flex-col border-b border-steel/10 pb-4">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Collaborators</p>
                    <p className="font-bold uppercase text-sm text-charcoal dark:text-concrete transition-colors duration-500">{selectedProject.collaborators}</p>
                  </div>
                  <div className="flex flex-col border-b border-steel/10 pb-4">
                    <p className="text-[10px] font-mono text-steel dark:text-concrete/50 uppercase tracking-widest mb-1 transition-colors duration-500">Year</p>
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
