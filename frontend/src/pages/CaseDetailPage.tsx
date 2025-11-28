import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  GlassCard, 
  StatusBadge, 
  PriorityBadge, 
  ConfidenceMeter,
  PageHeader,
  DKGLink,
  Skeleton
} from '../components/ui';
import type { CaseDetailResponse, EvidenceItem } from '../types';
import { clsx } from 'clsx';

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fastTrackLoading, setFastTrackLoading] = useState(false);
  
  useEffect(() => {
    fetchCase();
  }, [id]);
  
  const fetchCase = async () => {
    try {
      const res = await fetch(`/api/cases/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Failed to load case');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFastTrack = async () => {
    if (!data) return;
    
    setFastTrackLoading(true);
    try {
      // Demo mode: simulate wallet address
      const res = await fetch(`/api/cases/${id}/fast-track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f28888'
        })
      });
      
      const json = await res.json();
      if (json.success) {
        // Refresh case data
        fetchCase();
      }
    } catch (err) {
      console.error('Fast-track failed:', err);
    } finally {
      setFastTrackLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-danger-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Case Not Found</h2>
          <p className="text-dark-400 mb-4">{error || 'The requested case could not be found.'}</p>
          <Link to="/cases" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Appeals
          </Link>
        </GlassCard>
      </div>
    );
  }
  
  const { case: caseItem, evidence, content } = data;
  const isResolved = caseItem.appealStatus.startsWith('resolved_');
  const isOverturned = caseItem.appealStatus === 'resolved_overturned';
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link 
        to="/cases" 
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Appeals
      </Link>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-display font-bold">{content?.title || 'Appeal Case'}</h1>
            <PriorityBadge isPriority={caseItem.priority} />
          </div>
          <div className="flex items-center gap-3 text-dark-400">
            <DKGLink assetId={caseItem['@id']} />
            <span className="text-dark-600">•</span>
            <span>Filed {new Date(caseItem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <StatusBadge status={caseItem.appealStatus} className="text-base px-4 py-1.5" />
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Resolution Card (if resolved) */}
        {isResolved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className={clsx(
              'p-6 border-2',
              isOverturned 
                ? 'border-success-500/30 bg-success-500/5' 
                : 'border-danger-500/30 bg-danger-500/5'
            )}>
              <div className="flex items-start gap-4">
                <div className={clsx(
                  'p-3 rounded-xl',
                  isOverturned ? 'bg-success-500/20' : 'bg-danger-500/20'
                )}>
                  {isOverturned ? (
                    <CheckCircle2 className="w-6 h-6 text-success-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-danger-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">
                    {isOverturned ? 'Appeal Granted' : 'Appeal Denied'}
                  </h2>
                  {caseItem.resolution.confidenceScore && (
                    <p className="text-dark-400 text-sm mb-3">
                      Decision confidence: {Math.round(caseItem.resolution.confidenceScore * 100)}%
                    </p>
                  )}
                  <p className="text-dark-300">{caseItem.resolution.reasoning}</p>
                  {caseItem.resolution.decisionTime && (
                    <p className="text-xs text-dark-500 mt-4">
                      Decided on {new Date(caseItem.resolution.decisionTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
        
        {/* Fast-Track CTA (if not resolved and not priority) */}
        {!isResolved && !caseItem.priority && (
          <GlassCard className="p-6 bg-gradient-to-r from-accent-500/5 to-primary-500/5 border-accent-500/20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent-500/20">
                  <Zap className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Fast-Track This Appeal</h3>
                  <p className="text-sm text-dark-400">
                    Get priority processing via x402 micropayment (0.10 USDC)
                  </p>
                </div>
              </div>
              <button
                onClick={handleFastTrack}
                disabled={fastTrackLoading}
                className="btn-primary"
              >
                {fastTrackLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        )}
        
        {/* Appeal Details */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-accent-400" />
            Appeal Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-dark-400 mb-1">Appeal Statement</p>
              <p className="text-dark-200">"{caseItem.appealStatement}"</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-400 mb-1">Creator DID</p>
                <p className="font-mono text-sm text-dark-300 truncate">{caseItem.creatorDid}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400 mb-1">Content Reference</p>
                <DKGLink assetId={caseItem.contentReference} />
              </div>
            </div>
            
            {caseItem.resolution.paymentTx && (
              <div>
                <p className="text-sm text-dark-400 mb-1">Payment Transaction</p>
                <p className="font-mono text-xs text-accent-400 truncate">{caseItem.resolution.paymentTx}</p>
              </div>
            )}
          </div>
        </GlassCard>
        
        {/* Original Content */}
        {content && (
          <GlassCard className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-warning-400" />
              Flagged Content
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium text-white">{content.title}</h4>
                  <p className="text-sm text-dark-400">{content.creatorName}</p>
                </div>
                <StatusBadge status={content.platform} />
              </div>
              
              <p className="text-dark-300">{content.description}</p>
              
              <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                <p className="text-sm text-dark-400 mb-1">Guardian's Reason for Flagging:</p>
                <p className="text-sm text-dark-300">{content.guardianReason}</p>
              </div>
            </div>
          </GlassCard>
        )}
        
        {/* Evidence Section */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary-400" />
            Evidence ({evidence.length})
          </h3>
          
          {evidence.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No evidence collected yet</p>
              <p className="text-sm text-dark-500">Evidence will appear here once the case is processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evidence.map((item, i) => (
                <EvidenceCard key={item['@id'] || i} evidence={item} />
              ))}
            </div>
          )}
        </GlassCard>
        
        {/* Timeline / Activity */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-dark-400" />
            Timeline
          </h3>
          
          <div className="space-y-4">
            <TimelineItem 
              title="Appeal Filed"
              time={caseItem.createdAt}
              icon={<Scale className="w-4 h-4" />}
              color="accent"
            />
            
            {caseItem.priority && caseItem.resolution.paymentTx && (
              <TimelineItem 
                title="Fast-Track Activated"
                time={caseItem.updatedAt}
                icon={<Zap className="w-4 h-4" />}
                color="warning"
              />
            )}
            
            {evidence.length > 0 && (
              <TimelineItem 
                title={`${evidence.length} Evidence Items Collected`}
                time={evidence[0]?.createdAt}
                icon={<LinkIcon className="w-4 h-4" />}
                color="primary"
              />
            )}
            
            {isResolved && (
              <TimelineItem 
                title={isOverturned ? 'Appeal Granted' : 'Appeal Denied'}
                time={caseItem.resolution.decisionTime || caseItem.updatedAt}
                icon={isOverturned ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                color={isOverturned ? 'success' : 'danger'}
                isLast
              />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// Evidence Card Component
function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const isSupporting = evidence.supportScore > 0;
  
  return (
    <div className={clsx(
      'p-4 rounded-xl border',
      isSupporting 
        ? 'bg-success-500/5 border-success-500/20'
        : 'bg-danger-500/5 border-danger-500/20'
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{evidence.evidenceType}</span>
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full',
              isSupporting 
                ? 'bg-success-500/20 text-success-400'
                : 'bg-danger-500/20 text-danger-400'
            )}>
              {isSupporting ? '+' : ''}{(evidence.supportScore * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-dark-500">{evidence.submittedBy}</p>
        </div>
        <DKGLink assetId={evidence['@id']} />
      </div>
      
      <p className="text-sm text-dark-300 mb-3">{evidence.summary}</p>
      
      {evidence.analysisDetails.findings.length > 0 && (
        <div className="text-xs text-dark-400">
          <span className="font-medium">Findings: </span>
          {evidence.analysisDetails.findings.join(', ')}
        </div>
      )}
      
      {evidence.sourceUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {evidence.sourceUrls.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1"
            >
              Source {i + 1}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  title: string;
  time: string | null;
  icon: React.ReactNode;
  color: 'accent' | 'success' | 'danger' | 'warning' | 'primary';
  isLast?: boolean;
}

function TimelineItem({ title, time, icon, color, isLast }: TimelineItemProps) {
  const colors = {
    accent: 'bg-accent-500/20 text-accent-400',
    success: 'bg-success-500/20 text-success-400',
    danger: 'bg-danger-500/20 text-danger-400',
    warning: 'bg-warning-500/20 text-warning-400',
    primary: 'bg-primary-500/20 text-primary-400',
  };
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={clsx('p-2 rounded-lg', colors[color])}>
          {icon}
        </div>
        {!isLast && <div className="w-px h-full bg-dark-700 my-2" />}
      </div>
      <div className="flex-1 pb-4">
        <p className="font-medium">{title}</p>
        {time && (
          <p className="text-xs text-dark-500">
            {new Date(time).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export default CaseDetailPage;
