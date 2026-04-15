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

export default function Terms() {
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
              Terms & Conditions
            </h1>
            <div className="text-charcoal/70 dark:text-concrete/70 font-mono text-sm leading-relaxed space-y-6">
              <p>
                Welcome to Danuthia & Associates. These Terms and Conditions outline the rules and regulations for the use of our website and services, located at danuthiaandassociates.com.
              </p>
              <p>
                By accessing this website and utilizing our platform, we assume you accept these terms and conditions. Do not continue to use Danuthia & Associates if you do not agree to take all of the terms and conditions stated on this page.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-12 text-charcoal dark:text-concrete">
            
            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">1. User Accounts and Security</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                To access certain features of the Website, including booking planning or construction management services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts if we suspect any fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">2. Services, Bookings, and Electronic Contracts</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                By scheduling a service, booking a consultation, or initiating a project through this Website, you acknowledge that you are entering into a legally binding electronic agreement. Your click of an "I Accept," "Book Now," "Submit," or similar button constitutes your electronic signature and acceptance of the terms associated with that specific service. Specific deliverables, timelines, and professional fees for construction and planning services will be outlined during the booking process and govern that specific transaction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">3. Payment Terms and Bank Transfers</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                All payments for bookings, consultations, or subscription services must be made via direct bank transfer to the account details provided during the checkout or booking process. Services, account upgrades, or subscriptions will only be confirmed and activated once the transferred funds have successfully cleared and are reflected in our account. You are responsible for any bank charges, transfer fees, or currency conversion fees associated with the transaction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">4. Cancellation, Refunds, and Rescheduling</h2>
              <div className="font-mono text-sm leading-relaxed opacity-80 space-y-4">
                <p><strong>Cancellations & Refunds:</strong> We offer a strict 7-day cancellation window for our services and subscriptions. If you choose to cancel your booking or subscription within seven (7) days of the initial transaction date, you are eligible for a refund, less any administrative or banking fees incurred during the transfer. Once this 7-day period has elapsed, all payments become strictly non-refundable, regardless of whether the services or platform features have been fully utilized.</p>
                <p><strong>Rescheduling:</strong> You may request to reschedule a booked professional consultation or service without incurring any additional penalty fees. However, all rescheduling requests are strictly subject to the availability of the designated professional. While we will make reasonable efforts to accommodate your new preferred time, we cannot guarantee immediate availability and will offer the next open appointment slot.</p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">5. Scope of Professional Services and Built Environment Disclaimer</h2>
              <div className="font-mono text-sm leading-relaxed opacity-80 space-y-4">
                <p>The information, resources, and materials provided on this Website are for general informational purposes only and do not constitute binding architectural, engineering, or urban planning advice. The initiation of any formal planning, design, or construction management services requires a separate, formally executed agreement.</p>
                <p><strong>No Reliance on General Information:</strong> Building codes, zoning laws, and environmental regulations are highly localized. You agree not to solely rely on the general information provided on this Website for making structural, financial, or legal decisions regarding your specific project without direct professional consultation.</p>
                <p><strong>User Responsibilities:</strong> If you utilize our platform to submit project inquiries, site details, or planning requests, you are solely responsible for the accuracy of the information provided. Danuthia & Associates shall not be held liable for any design errors, construction delays, or regulatory violations arising from inaccurate site data, property boundaries, or topographical information supplied by the user.</p>
                <p><strong>Third-Party Contractors:</strong> We may reference third-party contractors, suppliers, or materials. Danuthia & Associates makes no warranties or representations regarding the performance, quality, or safety of any third-party services or physical materials unless explicitly stated in a formalized project contract.</p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">6. AI-Generated Content and Automated Tools</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                This platform utilizes artificial intelligence and automated tools to provide preliminary information, generate concepts, and assist with construction management organization. Any outputs, generated text, or automated planning suggestions provided by the application are for informational and conceptual purposes only. They do not replace the certified, stamped approval of a licensed architect, engineer, or urban planner. You assume full responsibility for verifying all automated outputs against local building codes, zoning laws, and safety regulations before proceeding with physical construction or site alterations.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">7. Intellectual Property Rights</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                Other than the content you own, under these Terms, Danuthia & Associates and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing the material contained on this Website.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">8. Restrictions</h2>
              <div className="font-mono text-sm leading-relaxed opacity-80 space-y-2">
                <p>You are specifically restricted from all of the following:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Publishing any Website material in any other media without prior consent.</li>
                  <li>Selling, sublicensing, and/or otherwise commercializing any Website material.</li>
                  <li>Using this Website in any way that is or may be damaging to this Website.</li>
                  <li>Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity.</li>
                  <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">9. User Content</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                "User Content" shall mean any audio, video text, images, or other material you choose to display on this Website. By displaying Your Content, you grant Danuthia & Associates a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media. Your Content must be your own and must not be invading any third-party’s rights.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">10. Disclaimers and Limitation of Liability</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                This Website is provided "as is," with all faults. In no event shall Danuthia & Associates, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website. Furthermore, Danuthia & Associates shall not be liable for any indirect, incidental, or consequential damages arising from construction delays, material price fluctuations, labor disputes, or failure to obtain necessary building permits and zoning approvals from local authorities.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">11. Indemnification</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                You hereby indemnify to the fullest extent Danuthia & Associates from and against any and/or all liabilities, costs, demands, causes of action, damages, and expenses arising in any way related to your breach of any of the provisions of these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">12. Data Privacy Integration</h2>
              <p className="font-mono text-sm leading-relaxed opacity-80">
                Your use of this Website is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information, including data provided during account registration and project booking. By using the Website, you consent to the data practices described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4 text-accent">13. General Provisions</h2>
              <div className="font-mono text-sm leading-relaxed opacity-80 space-y-4">
                <p><strong>Severability:</strong> If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.</p>
                <p><strong>Variation of Terms:</strong> Danuthia & Associates is permitted to revise these Terms at any time as it sees fit.</p>
                <p><strong>Assignment:</strong> Danuthia & Associates is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. You are not allowed to assign, transfer, or subcontract any of your rights.</p>
                <p><strong>Governing Law & Jurisdiction:</strong> These Terms will be governed by and interpreted in accordance with the laws of Kenya, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Kenya for the resolution of any disputes.</p>
              </div>
            </section>

          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
