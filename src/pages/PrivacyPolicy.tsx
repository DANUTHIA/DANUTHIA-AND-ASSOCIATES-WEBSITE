import React from 'react';
import { motion } from 'motion/react';

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

export default function PrivacyPolicy() {
  return (
    <main className="bg-concrete dark:bg-charcoal min-h-screen transition-colors duration-500 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col gap-12"
        >
          <motion.div variants={fadeInUp} className="border-b border-charcoal/20 dark:border-concrete/20 pb-12">
            <p className="text-accent tracking-[0.2em] text-xs font-mono uppercase mb-4">Legal Documentation</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-charcoal dark:text-concrete mb-8">
              Privacy Policy
            </h1>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-12 text-charcoal dark:text-concrete">
            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">Introduction</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                Welcome to Danuthia Associates Construction LLc. We are committed to redefining the African built environment while fiercely protecting your personal data. This Privacy Policy outlines how we collect, process, and safeguard your information in accordance with the Kenya Data Protection Act (DPA).
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">Data Collection & Storage</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                We collect contact details, project specifications, and financial parameters necessary for architectural drafting and construction management. This data is stored securely on encrypted cloud infrastructure (via Google Firebase) to ensure high-level security and operational efficiency.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">User Rights</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                You retain the right to access, rectify, or request the deletion of your personal data at any time. To exercise these rights, please contact our Data Protection Officer at danuthiaandassociates@gmail.com.
              </p>
            </section>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
