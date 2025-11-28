import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileSearch, 
  Scale, 
  BarChart3,
  Github,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/content', label: 'Flagged Content', icon: FileSearch },
  { path: '/cases', label: 'Appeals', icon: Scale },
];

// Aurora Background Component
export function AuroraBackground() {
  return (
    <>
      <div className="aurora-background" />
      <div className="noise-overlay" />
    </>
  );
}

export function Header() {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 glass-dark border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            </motion.div>
            <div>
              <span className="font-display font-bold text-lg text-white">GAL</span>
              <span className="block text-[10px] text-dark-400 -mt-1">Guardian Appeals Layer</span>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              
              return (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'text-white' 
                      : 'text-dark-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-white/10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Network indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs text-dark-300">Base Sepolia</span>
            </div>
            
            {/* GitHub link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            
            {/* DKG Explorer */}
            <a
              href="https://dkg.origintrail.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm text-dark-300 hover:text-white transition-colors"
            >
              DKG Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-dark-400 text-sm">
            <Shield className="w-4 h-4 text-accent-500" />
            <span>Guardian Appeals Layer</span>
            <span className="text-dark-600">•</span>
            <span>The best of the best </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-dark-500">Built with</span>
            <a 
              href="https://origintrail.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dark-300 hover:text-white transition-colors"
            >
              OriginTrail DKG
            </a>
            <span className="text-dark-600">×</span>
            <a 
              href="https://polkadot.network" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dark-300 hover:text-white transition-colors"
            >
              Polkadot
            </a>
            <span className="text-dark-600">×</span>
            <a 
              href="https://umanitek.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dark-300 hover:text-white transition-colors"
            >
              Umanitek
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Layout Wrapper
export function Layout() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuroraBackground />
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}