import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, MessageCircle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 p-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <span className="text-xl font-bold font-accent tracking-wide text-text-primary">HeartSync</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-text-primary font-medium">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="glass" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-secondary/20 blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-8">
              <Sparkles className="w-4 h-4" />
              The Next Generation of Dating
            </span>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold font-accent tracking-tight text-text-primary mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            Find your match with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              meaningful connections
            </span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Experience dating reinvented. Swipe less, connect more with our intelligent matchmaking and real-time interactions.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Start your journey <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Abstract Cards (Desktop Only) */}
        <motion.div 
          className="hidden lg:block absolute left-[10%] top-[30%] w-48 h-64 glass-card rounded-2xl rotate-[-15deg] opacity-50"
          animate={{ y: [-10, 10, -10], rotate: [-15, -12, -15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="hidden lg:block absolute right-[10%] bottom-[30%] w-56 h-72 glass-card rounded-2xl rotate-[10deg] opacity-50"
          animate={{ y: [10, -10, 10], rotate: [10, 12, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10 bg-background/50 backdrop-blur-3xl border-t border-border/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-2xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Smart Matching</h3>
              <p className="text-text-secondary">Our algorithm learns your preferences to find the most compatible partners.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-2xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Real-time Chat</h3>
              <p className="text-text-secondary">Instant messaging with typing indicators and read receipts for seamless communication.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-2xl border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">Safe & Secure</h3>
              <p className="text-text-secondary">Enterprise-grade security and strict moderation keeps our community safe.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
