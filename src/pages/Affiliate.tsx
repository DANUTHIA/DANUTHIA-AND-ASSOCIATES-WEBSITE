import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Handshake, TrendingUp, Award } from 'lucide-react';

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

export default function Affiliate() {
  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative bg-charcoal dark:bg-charcoal text-concrete p-8 md:p-16 pt-32 md:pt-40 flex flex-col justify-center overflow-hidden min-h-[60vh] transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        >
          <span className="font-display font-bold text-[10vw] leading-none text-steel whitespace-nowrap">AFFILIATE</span>
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
                Become an <span className="text-accent">Affiliate.</span>
              </motion.h1>
            </div>
            <motion.div variants={fadeInUp} className="pb-2">
              <p className="text-lg md:text-xl text-concrete/80 font-light leading-relaxed border-l border-accent pl-6">
                Partner with Danuthia & Co. Earn exclusive commissions by referring high-value architectural and urban planning projects.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
      
      {/* Content Section */}
      <section className="p-8 md:p-16 max-w-7xl mx-auto py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-none border border-charcoal/10 dark:border-concrete/10 flex items-center justify-center mb-6 bg-accent/5 text-accent transition-colors duration-500">
              <Handshake size={24} />
            </div>
            <h3 className="font-display text-2xl mb-4 text-charcoal dark:text-concrete transition-colors duration-500">Refer Clients</h3>
            <p className="text-charcoal/70 dark:text-concrete/70 font-light text-sm leading-relaxed transition-colors duration-500">Introduce our premier services to your network of developers, investors, and property owners.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-none border border-charcoal/10 dark:border-concrete/10 flex items-center justify-center mb-6 bg-accent/5 text-accent transition-colors duration-500">
              <Award size={24} />
            </div>
            <h3 className="font-display text-2xl mb-4 text-charcoal dark:text-concrete transition-colors duration-500">Premium Service</h3>
            <p className="text-charcoal/70 dark:text-concrete/70 font-light text-sm leading-relaxed transition-colors duration-500">We guarantee exceptional architectural delivery, ensuring your referrals receive world-class treatment.</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-none border border-charcoal/10 dark:border-concrete/10 flex items-center justify-center mb-6 bg-accent/5 text-accent transition-colors duration-500">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-display text-2xl mb-4 text-charcoal dark:text-concrete transition-colors duration-500">Earn Commissions</h3>
            <p className="text-charcoal/70 dark:text-concrete/70 font-light text-sm leading-relaxed transition-colors duration-500">Receive a competitive percentage of the project fee upon successful contract signing and commencement.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-concrete dark:bg-charcoal border border-steel/20 dark:border-concrete/20 p-12 text-center transition-colors duration-500">
          <h2 className="font-display text-3xl mb-6 text-charcoal dark:text-concrete transition-colors duration-500">Join the Network</h2>
          <p className="text-charcoal/70 dark:text-concrete/70 mb-10 font-light leading-relaxed transition-colors duration-500">
            Our affiliate program is open to real estate agents, financial advisors, and industry professionals. Contact us to discuss partnership terms and register as an official affiliate.
          </p>
          <a href="mailto:partnerships@danuthiaandassociates.com" className="inline-flex items-center justify-between p-6 bg-charcoal dark:bg-concrete text-concrete dark:text-charcoal hover:bg-accent dark:hover:bg-accent hover:text-charcoal dark:hover:text-charcoal transition-all duration-500 group w-full md:w-auto min-w-[300px]">
            <span className="font-bold uppercase tracking-widest mr-8 text-sm">Apply Now</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </section>
    </main>
  );
}
