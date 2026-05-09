import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsOfService = () => {
  const sections = [
    {
      title: "1. Eligibility",
      content: "You must be at least 18 years of age to use HeartSync. By creating an account, you represent and warrant that you can form a binding contract with us and meet all legal requirements in your jurisdiction."
    },
    {
      title: "2. Your Account",
      content: "You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate our community standards."
    },
    {
      title: "3. User Conduct",
      content: "You agree not to use HeartSync for any illegal purpose, harassment, bullying, or to impersonate others. You must respect the privacy and boundaries of other users. Inappropriate content or behavior will result in an immediate ban."
    },
    {
      title: "4. Content Ownership",
      content: "You retain ownership of the photos and text you upload. However, by posting content, you grant HeartSync a worldwide, royalty-free license to host, store, and display that content as part of our service."
    },
    {
      title: "5. Premium Subscriptions",
      content: "Premium features are billed in advance. Subscriptions are non-refundable but can be canceled at any time to prevent future billing. Prices are subject to change with prior notice."
    }
  ];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-4 mb-10">
        <Link to="/settings" className="p-2 -ml-2 rounded-full hover:bg-hover text-text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold font-accent text-text-primary">Terms of Service</h1>
      </header>

      <div className="space-y-10">
        <div className="flex items-center gap-4 p-6 glass rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-transparent">
          <FileText className="w-10 h-10 text-secondary" />
          <div>
            <p className="text-xs text-text-secondary uppercase font-black tracking-widest mb-1">Last Updated</p>
            <p className="text-text-primary font-bold">May 9, 2026</p>
          </div>
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {section.title}
              </h3>
              <p className="text-text-secondary leading-relaxed pl-4.5 border-l-2 border-border/50">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <section className="pt-10 border-t border-border">
          <div className="glass p-8 rounded-3xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Scale className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Questions about our Terms?</h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              If you have any questions regarding these terms, please contact our legal team at legal@heartsync.app.
            </p>
            <div className="flex flex-col items-center gap-2 text-xs text-text-secondary">
              <p>HeartSync Inc.</p>
              <p>123 Dating Blvd, San Francisco, CA</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
