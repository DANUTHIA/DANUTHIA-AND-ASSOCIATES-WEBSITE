import React from 'react';
import { motion } from 'motion/react';

const TICKER_ITEMS = [
  "PRECISION", "STRUCTURAL INTEGRITY", "SUSTAINABILITY", "AGILITY",
  "NAIROBI TECH HUB: 45,000 SQM", "KAREN VILLA: 1,200 SQM",
  "MOMBASA TRANSIT: 12,000 SQM", "RIFT VALLEY MASTERPLAN: 50,000 HA"
];

export default function KineticDataTicker() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-bronze text-concrete py-1 overflow-hidden z-[9999] border-t border-concrete/20">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <span key={idx} className="px-8 font-mono text-[10px] uppercase tracking-widest font-bold">
            {item} //
          </span>
        ))}
      </motion.div>
    </div>
  );
}
