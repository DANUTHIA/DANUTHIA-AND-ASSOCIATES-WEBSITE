import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Terminal, ArrowRight, X, Search, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';

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

const logs = [
  { 
    id: 'DOC-001', 
    date: '2026.04.02', 
    category: 'MATERIAL STUDY', 
    title: 'Mycelium Composites in High-Stress Environments', 
    author: 'Dr. E. Vance', 
    status: 'PUBLISHED',
    abstract: 'An exploration into the structural viability of mycelium-based composites when subjected to extreme load-bearing scenarios in urban high-rises. The study demonstrates a 40% reduction in embodied carbon compared to traditional concrete formulations while maintaining acceptable tensile strength.',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'DOC-002', 
    date: '2026.03.15', 
    category: 'FIELD NOTES', 
    title: 'Structural Integrity of Repurposed Shipping Containers', 
    author: 'J. Macharia', 
    status: 'ARCHIVED',
    abstract: 'Observations from the Nairobi Eastlands adaptive reuse project. Analyzes the long-term corrosion resistance and thermal bridging challenges of utilizing ISO shipping containers for modular affordable housing.',
    image: 'https://images.unsplash.com/photo-1588557132645-ff567110cafd?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'DOC-003', 
    date: '2026.02.28', 
    category: 'RESEARCH', 
    title: 'Algorithmic Zoning: Predicting Urban Sprawl', 
    author: 'M. Rossi', 
    status: 'PEER REVIEW',
    abstract: 'Utilizing machine learning models to predict informal settlement expansion in Sub-Saharan Africa. The paper proposes a parametric zoning framework that adapts to population influx rather than rigidly resisting it.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'DOC-004', 
    date: '2026.01.10', 
    category: 'WHITE PAPER', 
    title: 'Thermal Mass Optimization in Arid Climates', 
    author: 'A. Chen', 
    status: 'PUBLISHED',
    abstract: 'A comprehensive review of passive cooling strategies using high thermal mass materials (rammed earth, adobe) in modern brutalist structures located in arid and semi-arid regions.',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 'DOC-005', 
    date: '2025.11.22', 
    category: 'CASE STUDY', 
    title: 'Post-Occupancy Evaluation: The Concrete Canopy', 
    author: 'Dr. E. Vance', 
    status: 'PUBLISHED',
    abstract: 'A 5-year post-occupancy evaluation of the "Concrete Canopy" civic center. The study measures actual energy performance against simulated models, revealing a 15% discrepancy in HVAC efficiency due to unforeseen user behavior.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop'
  },
];

export default function Logbook() {
  const [selectedLog, setSelectedLog] = useState<typeof logs[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof typeof logs[0]; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

  const categories = ['ALL', ...Array.from(new Set(logs.map(log => log.category)))];
  const statuses = ['ALL', ...Array.from(new Set(logs.map(log => log.status)))];

  const handleSort = (key: keyof typeof logs[0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedLogs = useMemo(() => {
    let result = logs.filter(log => {
      const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           log.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [searchQuery, categoryFilter, statusFilter, sortConfig]);

  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500 pt-32 pb-24 bg-blueprint-grid">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col gap-12"
        >
          <motion.div variants={fadeInUp} className="border-b border-charcoal/20 dark:border-concrete/20 pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4 flex items-center gap-2">
                <Terminal size={14} />
                <span>System Database</span>
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete">
                Research Logbook
              </h1>
            </div>
            <div className="text-charcoal/60 dark:text-concrete/60 font-mono text-xs uppercase tracking-widest text-right">
              <p>Total Entries: {logs.length}</p>
              <p>Filtered: {filteredAndSortedLogs.length}</p>
              <p>Status: Online</p>
            </div>
          </motion.div>

          {/* Filters & Search */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 dark:text-concrete/30 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID, Title, or Author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/10 dark:border-concrete/10 py-4 pl-12 pr-4 focus:outline-none focus:border-accent transition-all font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete rounded-none"
              />
            </div>
            
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/10 dark:border-concrete/10 py-4 px-4 focus:outline-none focus:border-accent transition-all font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete rounded-none appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-concrete dark:bg-charcoal">{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 dark:text-concrete/30 pointer-events-none" size={16} />
              <label className="absolute -top-2 left-4 bg-concrete dark:bg-charcoal px-2 text-[8px] font-mono text-accent uppercase tracking-widest">Category</label>
            </div>

            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-charcoal/5 dark:bg-concrete/5 border border-charcoal/10 dark:border-concrete/10 py-4 px-4 focus:outline-none focus:border-accent transition-all font-mono text-xs uppercase tracking-widest text-charcoal dark:text-concrete rounded-none appearance-none cursor-pointer"
              >
                {statuses.map(status => (
                  <option key={status} value={status} className="bg-concrete dark:bg-charcoal">{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 dark:text-concrete/30 pointer-events-none" size={16} />
              <label className="absolute -top-2 left-4 bg-concrete dark:bg-charcoal px-2 text-[8px] font-mono text-accent uppercase tracking-widest">Status</label>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-charcoal/20 dark:border-concrete/20 text-[10px] font-mono text-accent uppercase tracking-widest">
                  <th className="py-4 px-4 font-normal cursor-pointer hover:text-charcoal dark:hover:text-concrete transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-2">Doc_ID <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="py-4 px-4 font-normal cursor-pointer hover:text-charcoal dark:hover:text-concrete transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-2">Date <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="py-4 px-4 font-normal">Category</th>
                  <th className="py-4 px-4 font-normal cursor-pointer hover:text-charcoal dark:hover:text-concrete transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-2">Title <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="py-4 px-4 font-normal">Author</th>
                  <th className="py-4 px-4 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono text-charcoal dark:text-concrete">
                {filteredAndSortedLogs.length > 0 ? (
                  filteredAndSortedLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="border-b border-charcoal/10 dark:border-concrete/10 hover:bg-charcoal/5 dark:hover:bg-concrete/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-6 px-4 text-accent">{log.id}</td>
                      <td className="py-6 px-4 opacity-70">{log.date}</td>
                      <td className="py-6 px-4">
                        <span className="border border-charcoal/20 dark:border-concrete/20 px-2 py-1 text-[10px] tracking-widest">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-6 px-4 font-bold uppercase tracking-tight group-hover:text-accent transition-colors flex items-center gap-3">
                        <FileText size={14} className="opacity-50" />
                        {log.title}
                      </td>
                      <td className="py-6 px-4 opacity-70">{log.author}</td>
                      <td className="py-6 px-4 text-right">
                        <span className={`text-[10px] tracking-widest px-2 py-1 ${
                          log.status === 'PUBLISHED' ? 'bg-accent/20 text-accent' : 
                          log.status === 'ARCHIVED' ? 'bg-charcoal/20 dark:bg-concrete/20 text-charcoal dark:text-concrete' : 
                          'border border-accent text-accent'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center text-charcoal/30 dark:text-concrete/30 uppercase tracking-[0.2em]">
                      No entries found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-concrete/90 dark:bg-charcoal/90 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-concrete dark:bg-charcoal border border-charcoal/20 dark:border-concrete/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row"
            >
              {/* Image Side */}
              <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-charcoal">
                <img 
                  src={selectedLog.image} 
                  alt={selectedLog.title} 
                  className="w-full h-full object-cover  opacity-60 "
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-accent/10 mix-blend-overlay"></div>
                <div className="absolute top-4 left-4 bg-charcoal/80 text-accent text-[10px] font-mono px-2 py-1 border border-accent/30">
                  FIG. 1 // {selectedLog.id}
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="font-mono text-[10px] text-accent uppercase tracking-widest">
                    {selectedLog.date} // {selectedLog.category}
                  </div>
                  <button 
                    onClick={() => setSelectedLog(null)}
                    className="text-charcoal/50 hover:text-charcoal dark:text-concrete/50 dark:hover:text-concrete transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-6">
                  {selectedLog.title}
                </h2>

                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-charcoal/10 dark:border-concrete/10">
                  <div className="font-mono text-xs text-charcoal/70 dark:text-concrete/70 uppercase">
                    Author: <span className="text-charcoal dark:text-concrete font-bold">{selectedLog.author}</span>
                  </div>
                  <div className="w-1 h-1 bg-accent rounded-full"></div>
                  <div className="font-mono text-xs text-charcoal/70 dark:text-concrete/70 uppercase">
                    Status: <span className="text-accent">{selectedLog.status}</span>
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="font-mono text-xs text-accent uppercase tracking-widest mb-4">Abstract</h3>
                  <p className="text-charcoal/80 dark:text-concrete/80 font-mono text-sm leading-relaxed">
                    {selectedLog.abstract}
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t border-charcoal/10 dark:border-concrete/10 flex justify-between items-center">
                  <div className="font-mono text-[10px] text-charcoal/50 dark:text-concrete/50 uppercase tracking-widest">
                    END OF FILE
                  </div>
                  <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-charcoal dark:text-concrete hover:text-accent dark:hover:text-accent transition-colors group">
                    <span>Download PDF</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
