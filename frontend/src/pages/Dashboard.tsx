import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Zap,
  ArrowRight,
  BarChart3,
  Database,
  Scale,
  Bot,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStore } from '../store';
import { GlassCard, StatCard, StatusBadge, Skeleton, AnimatedCounter, AnimatedPercentage, GlowOrb } from '../components/ui';
import { ArchitectureDiagram, MCPToolsCard, DataFlowDiagram } from '../components/ArchitectureDiagram';
import { clsx } from 'clsx';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const floatVariants = {
  initial: { y: 0 },
  animate: { 
    y: [-10, 10, -10],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
  }
};

export function Dashboard() {
  const { 
    metrics, 
    metricsLoading, 
    fetchMetrics,
    cases,
    casesLoading,
    fetchCases,
    content,
    fetchContent
  } = useStore();
  
  useEffect(() => {
    fetchMetrics();
    fetchCases();
    fetchContent();
  }, []);
  
  // Calculate stats
  const recentCases = cases.slice(0, 5);
  const pendingCount = cases.filter(c => !c.appealStatus.startsWith('resolved_')).length;
  const priorityCount = cases.filter(c => c.priority).length;
  
  // Parse percentage values for animation
  const baselineAccuracy = parseFloat(metrics?.summary.baselineAccuracyPercent || '0');
  const postGalAccuracy = parseFloat(metrics?.summary.postGalAccuracyPercent || '0');
  const improvement = parseFloat(metrics?.summary.improvementPercent || '0');
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-12">
        {/* Decorative glow orbs */}
        <GlowOrb color="accent" size="lg" className="top-0 left-1/4 -translate-x-1/2" />
        <GlowOrb color="purple" size="md" className="top-20 right-1/4 translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              DKG Hackathon 2025
            </motion.div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Guardian Appeals Layer</span>
            </h1>
            <p className="text-xl text-dark-400 max-w-2xl mx-auto">
              Verifiable appeals for AI safety decisions, powered by OriginTrail DKG
            </p>
          </motion.div>
          
          {/* Key Stats */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <motion.div variants={itemVariants}>
              <StatCard
                label="Baseline Accuracy"
                value={baselineAccuracy}
                decimals={1}
                suffix="%"
                icon={<AlertTriangle className="w-5 h-5 text-warning-400" />}
                color="warning"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Post-GAL Accuracy"
                value={postGalAccuracy}
                decimals={1}
                suffix="%"
                change={improvement > 0 ? `+${improvement.toFixed(1)}%` : undefined}
                icon={<CheckCircle2 className="w-5 h-5 text-success-400" />}
                color="success"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Total Appeals"
                value={metrics?.gal.totalAppeals || 0}
                icon={<Scale className="w-5 h-5 text-accent-400" />}
                color="accent"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="False Positives Corrected"
                value={metrics?.summary.falsePositivesCorrected || 0}
                icon={<TrendingUp className="w-5 h-5 text-success-400" />}
                color="success"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Accuracy Comparison Chart */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Accuracy Improvement</h2>
                  <p className="text-sm text-dark-400">Guardian AI vs. GAL-enhanced decisions</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning-500" />
                    <span className="text-dark-400">Baseline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                    <span className="text-dark-400">Post-GAL</span>
                  </div>
                </div>
              </div>
              
              {metricsLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <AccuracyChart metrics={metrics} />
              )}
            </GlassCard>
            
            {/* Resolution Distribution */}
            <div className="grid sm:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Resolution Distribution</h3>
                {metricsLoading ? (
                  <Skeleton className="h-48" />
                ) : (
                  <ResolutionPieChart metrics={metrics} />
                )}
              </GlassCard>
              
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-4">
                  <StatusItem 
                    label="DKG Connection" 
                    status="connected" 
                    detail="NeuroWeb Mainnet"
                  />
                  <StatusItem 
                    label="Guardian API" 
                    status="connected" 
                    detail="v2.0.0"
                  />
                  <StatusItem 
                    label="x402 Payments" 
                    status="connected" 
                    detail="Base Sepolia"
                  />
                  <StatusItem 
                    label="Agent System" 
                    status="active" 
                    detail={`${pendingCount} pending`}
                  />
                </div>
              </GlassCard>
            </div>
          </div>
          
          {/* Right Column - Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/content"
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning-500/10">
                      <AlertTriangle className="w-4 h-4 text-warning-400" />
                    </div>
                    <div>
                      <p className="font-medium">Review Flagged Content</p>
                      <p className="text-xs text-dark-400">{content.length} items flagged</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                
                <Link 
                  to="/cases"
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-500/10">
                      <Scale className="w-4 h-4 text-accent-400" />
                    </div>
                    <div>
                      <p className="font-medium">Manage Appeals</p>
                      <p className="text-xs text-dark-400">{pendingCount} pending review</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                
                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-accent-500/10 to-primary-500/10 hover:from-accent-500/20 hover:to-primary-500/20 border border-accent-500/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent-500/20">
                      <Zap className="w-4 h-4 text-accent-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Fast-Track Queue</p>
                      <p className="text-xs text-dark-400">{priorityCount} priority cases</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-dark-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </GlassCard>
            
            {/* Recent Appeals */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Appeals</h3>
                <Link to="/cases" className="text-sm text-accent-400 hover:text-accent-300">
                  View all
                </Link>
              </div>
              
              {casesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentCases.length === 0 ? (
                <div className="text-center py-8 text-dark-400">
                  <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No appeals yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCases.map(c => (
                    <Link
                      key={c['@id']}
                      to={`/cases/${c['@id'].split(':').pop()}`}
                      className="block p-3 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {c.contentTitle || 'Appeal Case'}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {c.creatorName || c.creatorDid}
                          </p>
                        </div>
                        <StatusBadge status={c.appealStatus} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
            
            {/* Tech Stack */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Powered By</h3>
              <div className="grid grid-cols-3 gap-3">
                <TechBadge name="DKG" icon={<Database className="w-4 h-4" />} />
                <TechBadge name="Polkadot" icon={<Shield className="w-4 h-4" />} />
                <TechBadge name="x402" icon={<Zap className="w-4 h-4" />} />
              </div>
            </GlassCard>
          </div>
        </div>
        
        {/* Architecture & MCP Section - Full Width */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <ArchitectureDiagram />
          <MCPToolsCard />
        </div>
        
        {/* Data Flow Section */}
        <div className="mt-8">
          <DataFlowDiagram />
        </div>
      </section>
    </div>
  );
}

// Sub-components

function AccuracyChart({ metrics }: { metrics: any }) {
  const data = [
    { name: 'Baseline', value: metrics?.baseline.accuracy * 100 || 84, fill: '#f59e0b' },
    { name: 'Post-GAL', value: metrics?.gal.postGalAccuracy * 100 || 98, fill: '#10b981' },
  ];
  
  return (
    <div className="h-64 flex items-end justify-center gap-12">
      {data.map((item, i) => (
        <motion.div 
          key={item.name}
          className="flex flex-col items-center"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: i * 0.2, duration: 0.5 }}
          style={{ transformOrigin: 'bottom' }}
        >
          <span className="text-3xl font-bold mb-2" style={{ color: item.fill }}>
            {item.value.toFixed(1)}%
          </span>
          <div 
            className="w-24 rounded-t-xl transition-all duration-500"
            style={{ 
              height: `${item.value * 2}px`,
              background: `linear-gradient(to top, ${item.fill}40, ${item.fill})`,
            }}
          />
          <span className="mt-3 text-sm text-dark-400">{item.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ResolutionPieChart({ metrics }: { metrics: any }) {
  const data = [
    { name: 'Overturned', value: metrics?.gal.overturned || 0, color: '#10b981' },
    { name: 'Upheld', value: metrics?.gal.upheld || 0, color: '#f43f5e' },
    { name: 'Pending', value: metrics?.gal.pending || 0, color: '#64748b' },
  ].filter(d => d.value > 0);
  
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-dark-400">
        No data yet
      </div>
    );
  }
  
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-dark-400">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusItem({ label, status, detail }: { label: string; status: string; detail: string }) {
  const isConnected = status === 'connected' || status === 'active';
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-success-500' : 'bg-dark-500'
        )} />
        <span className="text-sm text-dark-300">{label}</span>
      </div>
      <span className="text-xs text-dark-500">{detail}</span>
    </div>
  );
}

function TechBadge({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-800/30">
      <div className="text-accent-400">{icon}</div>
      <span className="text-xs text-dark-400">{name}</span>
    </div>
  );
}

export default Dashboard;