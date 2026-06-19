import React from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterState {
  categories: string[];
  years: string[];
  searchQuery: string;
}

interface FilterSidebarProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  availableCategories: string[];
  availableYears: string[];
}

export default function FilterSidebar({ filterState, setFilterState, availableCategories, availableYears }: FilterSidebarProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    Typology: true,
    Year: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    setFilterState({ categories: [], years: [], searchQuery: '' });
  };

  const handleCheckboxChange = (section: keyof FilterState, value: string) => {
    setFilterState(prev => {
      const currentList: string[] = prev[section] as string[];
      if (currentList.includes(value)) {
        return { ...prev, [section]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [section]: [...currentList, value] };
      }
    });
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0 border-r border-charcoal/10 dark:border-concrete/10 pr-6 mr-6 overflow-y-auto">
      {/* Semantic Search Base */}
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={14} className="text-steel" />
        </div>
        <input 
          type="text" 
          value={filterState.searchQuery}
          onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
          className="w-full pl-9 pr-3 py-2 bg-charcoal/5 dark:bg-concrete/5 border border-steel/20 dark:border-concrete/20 text-sm font-sans placeholder-steel dark:placeholder-concrete/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          placeholder="Search projects..."
        />
        {filterState.searchQuery && (
          <button 
            onClick={() => setFilterState(prev => ({ ...prev, searchQuery: '' }))}
            className="absolute inset-y-0 right-3 flex items-center text-steel hover:text-accent"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {(filterState.categories.length + filterState.years.length > 0 || filterState.searchQuery) && (
         <div className="flex justify-between items-center mb-6">
           <span className="text-[10px] font-mono text-steel uppercase tracking-widest">Active Filters</span>
           <button onClick={clearAllFilters} className="text-[10px] text-accent font-bold uppercase tracking-widest hover:underline">Clear All</button>
         </div>
      )}

      {/* Accordions */}
      <FilterAccordion 
        title="Typology" 
        isOpen={openSections['Typology']} 
        onToggle={() => toggleSection('Typology')}
        items={availableCategories}
        selectedItems={filterState.categories}
        onChange={(val) => handleCheckboxChange('categories', val)}
      />
      
      <FilterAccordion 
        title="Year" 
        isOpen={openSections['Year']} 
        onToggle={() => toggleSection('Year')}
        items={availableYears}
        selectedItems={filterState.years}
        onChange={(val) => handleCheckboxChange('years', val)}
      />
    </div>
  );
}

function FilterAccordion({ title, isOpen, onToggle, items, selectedItems, onChange }: { 
  title: string, isOpen: boolean, onToggle: () => void, items: string[], selectedItems: string[], onChange: (val: string) => void 
}) {
  return (
    <div className="mb-6 border-b border-charcoal/10 dark:border-concrete/10 pb-4">
      <button 
        onClick={onToggle}
        className="flex w-full justify-between items-center mb-3 group"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-charcoal dark:text-concrete group-hover:text-accent transition-colors">{title}</span>
        {isOpen ? <ChevronUp size={14} className="text-steel" /> : <ChevronDown size={14} className="text-steel" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-2"
          >
            {items.map(item => (
              <label key={item} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-3 h-3 border border-steel/40 dark:border-concrete/40 rounded-none group-hover:border-accent transition-colors">
                  <input 
                    type="checkbox" 
                    className="absolute opacity-0 cursor-pointer w-full h-full"
                    checked={selectedItems.includes(item)}
                    onChange={() => onChange(item)}
                  />
                  {selectedItems.includes(item) && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 bg-accent"
                    />
                  )}
                </div>
                <span className={`text-sm ${selectedItems.includes(item) ? 'font-medium text-charcoal dark:text-concrete' : 'text-steel dark:text-concrete/70 group-hover:text-charcoal dark:group-hover:text-concrete'} transition-colors`}>
                  {item}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
