import React from 'react';
import { motion } from 'motion/react';

interface Material {
  name: string;
  description: string;
  textureUrl: string;
}

interface MaterialityGridProps {
  materials: Material[];
}

export default function MaterialityGrid({ materials }: MaterialityGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      {materials.map((material, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`relative overflow-hidden border border-steel/20 dark:border-concrete/10 group ${idx === 0 ? 'col-span-2' : ''}`}
        >
          <img 
            src={material.textureUrl} 
            alt={material.name} 
            className="w-full h-48 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h4 className="text-concrete font-bold font-display uppercase tracking-widest text-sm">{material.name}</h4>
            <p className="text-accent text-[10px] font-mono">{material.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
