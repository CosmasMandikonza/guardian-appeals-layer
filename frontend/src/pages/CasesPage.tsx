import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Zap,
  Filter,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../store';
import { 
  GlassCard, 
  StatusBadge, 
  PriorityBadge,
  PageHeader,
  CardSkeleton,
  EmptyState,
  DKGLink
} from '../components/ui';
import type { CaseItem } from '../types';
import { clsx } from 'clsx';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

type StatusFilter = 'all' | 'open' | 'in_review' | 'resolved_overturned' | 'resolved_upheld';

export function CasesPage() {
  const { cases, casesLoading, fetchCases } = useStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showPriorityOnly, setShowPriorityOnly] = useState(false);
  
  useEffect(() => {
    fetchCases();
  }, []);
  
  // Filter cases
  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'all' && c.appealStatus !== statusFilter) return false;
    if (showPriorityOnly && !c.priority) return false;
    return true;
  });
  
  // Calculate stats
  const stats = {
    total: cases.length,
    open: cases.filter(c => c.appealStatus === 'open').length,
    inReview: cases.filter(c => c.appealStatus === 'in_review').length,
    overturned: cases.filter(c => c.appealStatus === 'resolved_overturned').length,
    upheld: cases.filter(c => c.appealStatus === 'resolved_upheld').length,
    priority: cases.filter(c => c.priority).length,
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Appeals"
        description="Track and manage content moderation appeals through the Guardian Appeals Layer."
        action={
          <Link to="/content" className="btn-primary">
            <Scale className="w-4 h-4 mr-2" />
            File New Appeal
          </Link>
        }
      />
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatButton 
          label="All" 
          value={stats.total} 
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        <StatButton 
          label="Open" 
          value={stats.open} 
          color="info"
          active={statusFilter === 'open'}
          onClick={() => setStatusFilter('open')}
        />
        <StatButton 
          label="In Review" 
          value={stats.inReview} 
          color="warning"
          active={statusFilter === 'in_review'}
          onClick={() => setStatusFilter('in_review')}
        />
        <StatButton 
          label="Overturned" 
          value={stats.overturned} 
          color="success"
          active={statusFilter === 'resolved_overturned'}
          onClick={() => setStatusFilter('resolved_overturned')}
        />
        <StatButton 
          label="Upheld" 
          value={stats.upheld} 
          color="danger"
          active={statusFilter === 'resolved_upheld'}
          onClick={() => setStatusFilter('resolved_upheld')}
        />
        <StatButton 
          label="Fast-Track" 
          value={stats.priority} 
          color="accent"
          icon={<Zap className="w-3 h-3" />}
          active={showPriorityOnly}
          onClick={() => {
            setShowPriorityOnly(!showPriorityOnly);
            if (!showPriorityOnly) setStatusFilter('all');
          }}
        />
      </div>
      
      {/* Cases List */}
      {casesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <EmptyState
          icon={<Scale className="w-12 h-12 text-dark-500" />}
          title="No appeals found"
          description={statusFilter === 'all' ? "No appeals have been filed yet." : "No appeals match the selected filter."}
          action={
            <Link to="/content" className="btn-primary">
              Browse Flagged Content
            </Link>
          }
        />
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filteredCases.map(caseItem => (
            <CaseCard key={caseItem['@id']} caseItem={caseItem} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Stat Button Component
interface StatButtonProps {
  label: string;
  value: number;
  color?: 'info' | 'warning' | 'success' | 'danger' | 'accent';
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function StatButton({ label, value, color, icon, active, onClick }: StatButtonProps) {
  const colors = {
    info: 'border-accent-500/50 bg-accent-500/10',
    warning: 'border-warning-500/50 bg-warning-500/10',
    success: 'border-success-500/50 bg-success-500/10',
    danger: 'border-danger-500/50 bg-danger-500/10',
    accent: 'border-primary-500/50 bg-primary-500/10',
  };
  
  return (
    <button
      onClick={onClick}
      className={clsx(
        'p-4 rounded-xl border transition-all text-left',
        active 
          ? color ? colors[color] : 'border-white/20 bg-white/10' 
          : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-1 text-dark-400 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </button>
  );
}

// Case Card Component
interface CaseCardProps {
  caseItem: CaseItem;
}

function CaseCard({ caseItem }: CaseCardProps) {
  const caseId = caseItem['@id'].split(':').pop();
  const isResolved = caseItem.appealStatus.startsWith('resolved_');
  
  return (
    <motion.div variants={itemVariants}>
      <Link to={`/cases/${caseId}`}>
        <GlassCard interactive className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left side */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-white truncate">
                  {caseItem.contentTitle || 'Appeal Case'}
                </h3>
                <PriorityBadge isPriority={caseItem.priority} />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-dark-400 mb-3">
                <span>{caseItem.creatorName || caseItem.creatorDid}</span>
                <span className="text-dark-600">•</span>
                <span className="capitalize">{caseItem.contentType}</span>
                <span className="text-dark-600">•</span>
                <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
              </div>
              
              <p className="text-sm text-dark-400 line-clamp-2">
                "{caseItem.appealStatement}"
              </p>
              
              {/* Resolution info */}
              {isResolved && caseItem.resolution.reasoning && (
                <div className={clsx(
                  'mt-4 p-3 rounded-lg text-sm',
                  caseItem.appealStatus === 'resolved_overturned' 
                    ? 'bg-success-500/10 border border-success-500/20'
                    : 'bg-danger-500/10 border border-danger-500/20'
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    {caseItem.appealStatus === 'resolved_overturned' ? (
                      <CheckCircle2 className="w-4 h-4 text-success-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-danger-400" />
                    )}
                    <span className="font-medium">
                      {caseItem.appealStatus === 'resolved_overturned' ? 'Appeal Granted' : 'Appeal Denied'}
                    </span>
                    {caseItem.resolution.confidenceScore && (
                      <span className="text-dark-400">
                        ({Math.round(caseItem.resolution.confidenceScore * 100)}% confidence)
                      </span>
                    )}
                  </div>
                  <p className="text-dark-300 line-clamp-2">{caseItem.resolution.reasoning}</p>
                </div>
              )}
            </div>
            
            {/* Right side */}
            <div className="flex flex-col items-end gap-3">
              <StatusBadge status={caseItem.appealStatus} />
              
              <div className="flex items-center gap-2">
                <DKGLink assetId={caseItem['@id']} />
              </div>
              
              <div className="flex items-center gap-1 text-dark-400 text-sm">
                <span>View Details</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

export default CasesPage;
