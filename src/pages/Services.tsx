import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Box, Building2, Map, ArrowRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroVideo from '../components/HeroVideo';
import { useCMS } from '../lib/cms';

const archDesignImg = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop";
const urbanPlanningImg = "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1600&auto=format&fit=crop";
const spatialAnalysisImg = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop";
const projectMgmtImg = "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1600&auto=format&fit=crop";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Services() {
  const [activeService, setActiveService] = useState(0);
  const { resources } = useCMS();

  const servicesData = [
    {
      id: '01',
      title: 'Architectural Design',
      icon: Box,
      descKey: 'service_desc_architectural',
      imgKey: 'service_img_1',
      desc: resources.service_desc_architectural || 'Full-service architectural design from concept to construction documentation. We specialize in residential, commercial, and institutional buildings that respond to their environment.',
      bullets: ['Concept Design', '3D Modeling & Rendering', 'Construction Drawings', 'Project Management'],
      img: resources.service_img_1 || archDesignImg
    },
    {
      id: '02',
      title: 'Urban Planning',
      icon: Building2,
      desc: 'Strategic planning for neighborhoods, cities, and regions. We focus on sustainable growth, mobility, and public space design to create vibrant, livable communities.',
      bullets: ['Master Planning', 'Zoning & Land Use', 'Urban Design Guidelines', 'Feasibility Studies'],
      img: resources.service_img_2 || urbanPlanningImg,
      imgKey: 'service_img_2'
    },
    {
      id: '03',
      title: 'Spatial Analysis',
      icon: Map,
      desc: 'Advanced GIS mapping and spatial data analysis to inform design decisions and policy making. We turn complex geographical data into actionable insights.',
      bullets: ['Topographical Analysis', 'Environmental Mapping', 'Demographic Studies', 'Infrastructure Planning'],
      img: spatialAnalysisImg
    },
    {
      id: '04',
      title: 'Project Management',
      icon: ClipboardList,
      descKey: 'service_desc_pm',
      desc: resources.service_desc_pm || 'End-to-end management of complex architectural and planning projects. We ensure that every milestone is met with precision, on time, and within budget.',
      bullets: ['Agile Project Delivery', 'Stakeholder Coordination', 'Quality Assurance', 'Risk Mitigation'],
      img: projectMgmtImg
    }
  ];

  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500 bg-blueprint-grid">
      {/* Hero Section */}
      <section className="relative bg-charcoal dark:bg-charcoal text-concrete p-8 md:p-16 pt-32 md:pt-40 flex flex-col justify-center overflow-hidden min-h-[60vh] transition-colors duration-500">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <HeroVideo 
            src="/videos/services.mp4"
            poster="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop"
            opacity={70}
          />
        </div>

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
              <motion.h1 data-cms-key="service_hero_title" variants={fadeInUp} className="font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase whitespace-pre-wrap">
                {resources.service_hero_title || 'Comprehensive.\nPrecision-driven.'}
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-accent pl-6">
                Comprehensive architectural and urban planning services tailored for the modern African city. We bridge the gap between visionary design and practical execution.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Services Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column: Interactive List */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {servicesData.map((service, idx) => {
              const isActive = activeService === idx;
              const Icon = service.icon;
              return (
                <div 
                  key={service.id}
                  onClick={() => setActiveService(idx)}
                  className={`cursor-pointer group flex flex-col border-b border-steel/20 dark:border-concrete/20 pb-8 transition-colors duration-500`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`font-display text-2xl font-bold transition-colors duration-300 ${isActive ? 'text-accent' : 'text-steel'}`}>
                      {service.id}
                    </span>
                    <Icon size={24} className={`transition-colors duration-300 ${isActive ? 'text-accent' : 'text-steel group-hover:text-charcoal dark:group-hover:text-concrete'}`} />
                  </div>
                  <h2 className={`font-display text-3xl font-bold uppercase tracking-tight transition-colors duration-300 ${isActive ? 'text-charcoal dark:text-concrete' : 'text-charcoal/50 dark:text-concrete/50 group-hover:text-charcoal dark:group-hover:text-concrete'}`}>
                    {service.title}
                  </h2>
                  
                  {/* Expanded Content */}
                  <motion.div 
                    initial={false}
                    animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6">
                      <p data-cms-key={service.descKey} className="text-charcoal/70 dark:text-concrete/70 mb-8 text-base font-light leading-relaxed transition-colors duration-500">
                        {service.desc}
                      </p>
                      <ul className="space-y-4 text-sm font-mono uppercase tracking-wider text-charcoal/80 dark:text-concrete/80 mb-8 transition-colors duration-500">
                        {service.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-center gap-4 border-b border-steel/10 dark:border-concrete/10 pb-2 transition-colors duration-500">
                            <span className="w-1.5 h-1.5 bg-accent rounded-none"></span> {bullet}
                          </li>
                        ))}
                      </ul>
                      <Link to="/portfolio" className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-charcoal dark:text-concrete hover:text-accent dark:hover:text-accent transition-colors">
                        View Related Projects <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Image Display */}
          <div className="lg:col-span-7 h-[50vh] lg:h-auto relative lg:sticky lg:top-32" style={{ maxHeight: '80vh' }}>
            <div className="w-full h-full relative overflow-hidden bg-steel/10 border border-steel/20 dark:border-concrete/20">
              {servicesData.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={false}
                  animate={{ 
                    opacity: activeService === idx ? 1 : 0,
                    scale: activeService === idx ? 1 : 1.05
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: activeService === idx ? 10 : 0 }}
                >
                  <img 
                    data-cms-key={service.imgKey}
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-charcoal/10 mix-blend-multiply"></div>
                </motion.div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* Markets Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24 border-t border-charcoal/10 dark:border-concrete/10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <motion.div variants={fadeInUp} className="max-w-2xl">
              <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4">Our Reach</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">Markets we<br/>transform.</h2>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-charcoal/60 dark:text-concrete/60 font-mono text-xs uppercase tracking-widest max-w-xs text-right">
              Specialized expertise across diverse sectors to deliver site-specific excellence.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-charcoal/10 dark:bg-concrete/10 border border-charcoal/10 dark:bg-concrete/10">
            {[
              { title: "Aviation & Transportation", icon: "✈️" },
              { title: "Healthcare", icon: "🏥" },
              { title: "Science & Technology", icon: "🔬" },
              { title: "Commercial & Mixed-Use", icon: "🏢" },
              { title: "Residential & Hospitality", icon: "🏠" },
              { title: "Civic & Cultural", icon: "🏛️" },
              { title: "Education", icon: "🎓" },
              { title: "Urban Planning", icon: "🏙️" }
            ].map((market, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="bg-concrete dark:bg-charcoal p-10 group hover:bg-accent transition-all duration-500 cursor-default"
              >
                <div className="text-3xl mb-6  group-hover:-0 transition-all">{market.icon}</div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete group-hover:text-concrete dark:group-hover:text-charcoal transition-colors">
                  {market.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* R&D / Technical Capabilities Section */}

      <section className="bg-charcoal dark:bg-charcoal text-concrete py-24 md:py-32 transition-colors duration-500 border-t border-concrete/20">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row gap-16"
          >
            <div className="w-full md:w-1/3">
              <motion.div variants={fadeInUp} className="sticky top-32">
                <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4">Research & Development</p>
                <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-8">Technical<br/>Capabilities</h2>
                <p className="text-concrete/70 font-mono text-sm leading-relaxed mb-8">
                  Our dedicated R&D lab explores the intersection of material science, parametric modeling, and sustainable engineering to push the boundaries of architectural feasibility.
                </p>
                <div className="w-16 h-1 bg-accent"></div>
              </motion.div>
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col border-t border-concrete/20">
              {[
                {
                  id: "01",
                  title: "Low-Carbon Concrete Formulations",
                  desc: "Investigating supplementary cementitious materials (SCMs) and optimized aggregate grading to reduce embodied carbon by up to 40% without compromising structural integrity.",
                  tags: ["Material Science", "Sustainability", "Structural"]
                },
                {
                  id: "02",
                  title: "Parametric Environmental Modeling",
                  desc: "Utilizing algorithmic design tools to simulate solar radiation, wind flow, and thermal performance, enabling data-driven optimization of building massing and facade articulation.",
                  tags: ["Computational Design", "Environmental", "Simulation"]
                },
                {
                  id: "03",
                  title: "Advanced Passive Cooling Systems",
                  desc: "Developing site-specific natural ventilation strategies and thermal mass utilization techniques to minimize reliance on mechanical cooling in tropical and subtropical climates.",
                  tags: ["HVAC", "Passive Design", "Thermodynamics"]
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeInUp}
                  className="border-b border-concrete/20 py-8 group hover:bg-concrete/5 transition-colors px-6 -mx-6"
                >
                  <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 mb-4">
                    <span className="font-mono text-accent text-sm">{item.id}</span>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors">{item.title}</h3>
                  </div>
                  <div className="md:pl-12">
                    <p className="text-concrete/70 font-mono text-sm leading-relaxed mb-6 max-w-2xl">
                      {item.desc}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-mono uppercase tracking-widest border border-concrete/30 px-2 py-1 text-concrete/60 group-hover:border-accent/50 group-hover:text-accent transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
