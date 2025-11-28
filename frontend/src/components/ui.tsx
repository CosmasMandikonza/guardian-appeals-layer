import React, { useEffect, useState, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  Video,
  Image,
  FileText,
  ExternalLink,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// ============================================================================
// Animated Counter - Smooth number animations
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  decimals = 0, 
  suffix = '', 
  prefix = '',
  className 
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0
  });
  
  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });
  
  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);
  
  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

// ============================================================================
// Animated Percentage - For accuracy displays
// ============================================================================

interface AnimatedPercentageProps {
  value: number;
  className?: string;
  showTrend?: boolean;
  previousValue?: number;
}

export function AnimatedPercentage({ 
  value, 
  className,
  showTrend = false,
  previousValue
}: AnimatedPercentageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { duration: 2000, bounce: 0 });
  
  const display = useTransform(spring, (current) => `${current.toFixed(1)}%`);
  
  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);
  
  const trend = previousValue !== undefined ? value - previousValue : 0;
  
  return (
    <div ref={ref} className={clsx("flex items-baseline gap-2", className)}>
      <motion.span className="text-3xl font-bold tabular-nums">
        {display}
      </motion.span>
      {showTrend && trend !== 0 && (
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className={clsx(
            "flex items-center text-sm font-medium",
            trend > 0 ? "text-success-400" : "text-danger-400"
          )}
        >
          {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
        </motion.span>
      )}
    </div>
  );
}

// ============================================================================
// Status Badge - Enhanced with animations
// ============================================================================

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
    open: { 
      label: 'Open', 
      variant: 'badge-info', 
      icon: <Clock className="w-3 h-3" /> 
    },
    in_review: { 
      label: 'In Review', 
      variant: 'badge-warning', 
      icon: <Loader2 className="w-3 h-3 animate-spin" /> 
    },
    resolved_overturned: { 
      label: 'Overturned', 
      variant: 'badge-success', 
      icon: <CheckCircle2 className="w-3 h-3" /> 
    },
    resolved_upheld: { 
      label: 'Upheld', 
      variant: 'badge-danger', 
      icon: <XCircle className="w-3 h-3" /> 
    },
    deepfake_suspected: { 
      label: 'Deepfake', 
      variant: 'badge-danger', 
      icon: <AlertTriangle className="w-3 h-3" /> 
    },
    harmful_content: { 
      label: 'Harmful', 
      variant: 'badge-danger', 
      icon: <AlertTriangle className="w-3 h-3" /> 
    },
    misinformation: { 
      label: 'Misinfo', 
      variant: 'badge-warning', 
      icon: <AlertTriangle className="w-3 h-3" /> 
    },
    copyright_violation: { 
      label: 'Copyright', 
      variant: 'badge-warning', 
      icon: <Shield className="w-3 h-3" /> 
    },
    safe: { 
      label: 'Safe', 
      variant: 'badge-success', 
      icon: <CheckCircle2 className="w-3 h-3" /> 
    },
  };
  
  const config = configs[status] || { label: status, variant: 'badge-neutral', icon: null };
  
  return (
    <motion.span 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(config.variant, 'gap-1.5', className)}
    >
      {config.icon}
      {config.label}
    </motion.span>
  );
}

// ============================================================================
// Content Type Icon
// ============================================================================

interface ContentTypeIconProps {
  type: 'video' | 'image' | 'text';
  className?: string;
}

export function ContentTypeIcon({ type, className }: ContentTypeIconProps) {
  const icons = {
    video: Video,
    image: Image,
    text: FileText,
  };
  
  const Icon = icons[type] || FileText;
  return <Icon className={clsx('w-4 h-4', className)} />;
}

// ============================================================================
// Confidence Meter - Enhanced with animation
// ============================================================================

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  className?: string;
}

export function ConfidenceMeter({ value, label, className }: ConfidenceMeterProps) {
  const percentage = Math.round(value * 100);
  const color = value > 0.7 ? 'from-danger-500 to-danger-400' 
    : value > 0.5 ? 'from-warning-500 to-warning-400'
    : 'from-success-500 to-success-400';
  
  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-dark-400">{label}</span>
          <motion.span 
            className="text-white font-semibold tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {percentage}%
          </motion.span>
        </div>
      )}
      <div className="progress-bar">
        <motion.div 
          className={clsx('progress-fill bg-gradient-to-r', color)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Glass Card - Enhanced with glow effects
// ============================================================================

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  glowColor?: 'accent' | 'success' | 'warning' | 'danger' | 'purple';
}

export function GlassCard({ children, className, interactive, onClick, glowColor }: GlassCardProps) {
  const glowColors = {
    accent: 'hover:shadow-[0_0_60px_rgba(6,182,212,0.15)]',
    success: 'hover:shadow-[0_0_60px_rgba(16,185,129,0.15)]',
    warning: 'hover:shadow-[0_0_60px_rgba(245,158,11,0.15)]',
    danger: 'hover:shadow-[0_0_60px_rgba(239,68,68,0.15)]',
    purple: 'hover:shadow-[0_0_60px_rgba(139,92,246,0.15)]',
  };
  
  return (
    <motion.div
      className={clsx(
        'rounded-2xl border',
        interactive ? 'glass-hover cursor-pointer' : 'glass',
        glowColor && glowColors[glowColor],
        className
      )}
      onClick={onClick}
      initial={interactive ? { opacity: 0, y: 20 } : false}
      animate={interactive ? { opacity: 1, y: 0 } : undefined}
      whileHover={interactive ? { 
        scale: 1.01, 
        y: -4,
        transition: { duration: 0.3 }
      } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Stat Card - Enhanced with animated counter
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  color?: 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
  animate?: boolean;
  decimals?: number;
  suffix?: string;
}

export function StatCard({ 
  label, 
  value, 
  change, 
  icon, 
  color = 'accent', 
  className,
  animate = true,
  decimals = 0,
  suffix = ''
}: StatCardProps) {
  const gradients = {
    accent: 'linear-gradient(90deg, #06b6d4, #0891b2, transparent)',
    success: 'linear-gradient(90deg, #10b981, #059669, transparent)',
    warning: 'linear-gradient(90deg, #f59e0b, #d97706, transparent)',
    danger: 'linear-gradient(90deg, #ef4444, #dc2626, transparent)',
  };
  
  const iconBgColors = {
    accent: 'bg-accent-500/10 text-accent-400',
    success: 'bg-success-500/10 text-success-400',
    warning: 'bg-warning-500/10 text-warning-400',
    danger: 'bg-danger-500/10 text-danger-400',
  };
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue);
  
  return (
    <motion.div 
      className={clsx('stat-card group', className)}
      style={{ '--stat-gradient': gradients[color] } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-dark-400 text-sm font-medium">{label}</p>
          <div className="mt-2">
            {animate && isNumeric ? (
              <AnimatedCounter 
                value={numericValue} 
                decimals={decimals}
                suffix={suffix}
                className="text-3xl font-bold text-white tabular-nums"
              />
            ) : (
              <p className="text-3xl font-bold text-white">{value}</p>
            )}
          </div>
          {change && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className={clsx(
                'text-sm font-medium mt-1 flex items-center gap-1',
                change.startsWith('+') ? 'text-success-400' : 'text-danger-400'
              )}
            >
              {change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </motion.p>
          )}
        </div>
        {icon && (
          <motion.div 
            className={clsx('p-3 rounded-xl', iconBgColors[color])}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Priority Badge - Enhanced
// ============================================================================

interface PriorityBadgeProps {
  isPriority: boolean;
  className?: string;
}

export function PriorityBadge({ isPriority, className }: PriorityBadgeProps) {
  if (!isPriority) return null;
  
  return (
    <motion.span 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        'bg-gradient-to-r from-accent-500/20 to-primary-500/20',
        'text-accent-400 border border-accent-500/30',
        'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
        className
      )}
    >
      <Zap className="w-3 h-3" />
      Fast-Track
    </motion.span>
  );
}

// ============================================================================
// DKG Link - Enhanced
// ============================================================================

interface DKGLinkProps {
  assetId: string;
  className?: string;
}

export function DKGLink({ assetId, className }: DKGLinkProps) {
  const shortId = assetId.split(':').pop()?.slice(0, 8) || assetId;
  
  return (
    <motion.a 
      href={`https://dkg.origintrail.io/explore?ual=${encodeURIComponent(assetId)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-lg',
        'text-accent-400 hover:text-accent-300 bg-accent-500/10 hover:bg-accent-500/20',
        'border border-accent-500/20 transition-all duration-300',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{shortId}...</span>
      <ExternalLink className="w-3 h-3" />
    </motion.a>
  );
}

// ============================================================================
// Loading Skeleton - Enhanced
// ============================================================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={clsx(
      'shimmer bg-dark-700/30 rounded-lg',
      className
    )} />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// Empty State - Enhanced
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {icon && (
        <motion.div 
          className="p-6 rounded-2xl bg-dark-800/50 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-2 text-dark-400 max-w-md">{description}</p>
      )}
      {action && (
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Page Header - Enhanced
// ============================================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: string[];
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-dark-400 mb-3">
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-4 h-4" />}
              <span className={i === breadcrumb.length - 1 ? 'text-white' : ''}>{item}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-gradient">{title}</h1>
          {description && (
            <motion.p 
              className="mt-3 text-dark-400 max-w-2xl text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
        </div>
        {action && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Glow Orb - Decorative animated element
// ============================================================================

interface GlowOrbProps {
  color?: 'accent' | 'purple' | 'success' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GlowOrb({ color = 'accent', size = 'md', className }: GlowOrbProps) {
  const colors = {
    accent: 'bg-accent-500/30',
    purple: 'bg-purple-500/30',
    success: 'bg-success-500/30',
    pink: 'bg-pink-500/30',
  };
  
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
  };
  
  return (
    <div 
      className={clsx(
        'absolute rounded-full blur-3xl opacity-50 pointer-events-none',
        colors[color],
        sizes[size],
        'animate-pulse',
        className
      )} 
    />
  );
}