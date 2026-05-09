import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, UserX, MessageSquare, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SafetyGuidelines = () => {
  const sections = [
    {
      icon: Shield,
      title: "Online Safety",
      tips: [
        "Never share financial information or send money to anyone.",
        "Keep your personal details (address, workplace, phone number) private until you've met in person.",
        "Be wary of people who ask you to leave the app immediately.",
        "Report any suspicious behavior or harassment using the report tool."
      ]
    },
    {
      icon: MapPin,
      title: "Meeting in Person",
      tips: [
        "Always meet in a public, well-lit place.",
        "Tell a friend or family member where you're going and who you're meeting.",
        "Arrange your own transportation to and from the date.",
        "Don't leave your drinks or personal belongings unattended."
      ]
    },
    {
      icon: AlertTriangle,
      title: "Warning Signs",
      tips: [
        "Sudden requests for money or help with an 'emergency'.",
        "Refusal to meet in person or video call.",
        "Overly intense or aggressive behavior early on.",
        "Stories that seem inconsistent or too good to be true."
      ]
    }
  ];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-4 mb-10">
        <Link to="/settings" className="p-2 -ml-2 rounded-full hover:bg-hover text-text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold font-accent text-text-primary">Safety Guidelines</h1>
      </header>

      <div className="space-y-12">
        <section className="glass p-6 rounded-3xl border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Your Safety is Priority</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            At HeartSync, we strive to create a safe and respectful environment for everyone. 
            While we use technology and moderation to protect you, it's important to follow 
            these guidelines to ensure your experience remains positive and secure.
          </p>
        </section>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-bold text-text-primary">{section.title}</h3>
              </div>
              <ul className="grid gap-3 ml-8">
                {section.tips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="text-text-secondary flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10 text-center">
          <h3 className="text-xl font-bold text-text-primary mb-4">Need Help?</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            If you're in immediate danger or have experienced a serious incident, 
            contact your local emergency services immediately.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="rounded-full">Report Incident</Button>
            <Button variant="primary" className="rounded-full px-8">Contact Support</Button>
          </div>
        </section>
      </div>
    </div>
  );
};
