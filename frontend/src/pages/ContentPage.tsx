import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Video, 
  Image, 
  FileText,
  AlertTriangle,
  ExternalLink,
  Scale,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../store';
import { 
  GlassCard, 
  StatusBadge, 
  ConfidenceMeter, 
  PageHeader,
  CardSkeleton,
  EmptyState,
  ContentTypeIcon
} from '../components/ui';
import { AppealModal } from '../components/AppealModal';
import type { ContentItem } from '../types';
import { clsx } from 'clsx';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

type FilterType = 'all' | 'deepfake_suspected' | 'harmful_content' | 'misinformation' | 'copyright_violation';
type ContentTypeFilter = 'all' | 'video' | 'image' | 'text';

export function ContentPage() {
  const { 
    content, 
    contentLoading, 
    fetchContent,
    cases,
    fetchCases,
    openAppealModal,
    isAppealModalOpen
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [contentType, setContentType] = useState<ContentTypeFilter>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  
  useEffect(() => {
    fetchContent();
    fetchCases();
  }, []);
  
  // Filter and sort content
  const filteredContent = content
    .filter(item => {
      if (filterType !== 'all' && item.guardianClassification !== filterType) return false;
      if (contentType !== 'all' && item.contentType !== contentType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.creatorName.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.guardianScore - a.guardianScore;
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });
  
  // Check if content has an existing case
  const getExistingCase = (contentId: string) => {
    return cases.find(c => c.contentReference.includes(contentId));
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Flagged Content"
        description="Content flagged by Umanitek Guardian AI for review. Submit appeals for false positives."
      />
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search by title, creator, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        
        {/* Classification Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="input w-auto min-w-[180px]"
        >
          <option value="all">All Classifications</option>
          <option value="deepfake_suspected">Deepfake</option>
          <option value="harmful_content">Harmful Content</option>
          <option value="misinformation">Misinformation</option>
          <option value="copyright_violation">Copyright</option>
        </select>
        
        {/* Content Type Filter */}
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value as ContentTypeFilter)}
          className="input w-auto min-w-[140px]"
        >
          <option value="all">All Types</option>
          <option value="video">Video</option>
          <option value="image">Image</option>
          <option value="text">Text</option>
        </select>
        
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
          className="input w-auto min-w-[140px]"
        >
          <option value="score">Highest Score</option>
          <option value="date">Most Recent</option>
        </select>
      </div>
      
      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-dark-400">
          Showing {filteredContent.length} of {content.length} flagged items
        </p>
      </div>
      
      {/* Content Grid */}
      {contentLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredContent.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12 text-dark-500" />}
          title="No content found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredContent.map(item => (
            <ContentCard 
              key={item.id} 
              item={item} 
              existingCase={getExistingCase(item.id)}
              onAppeal={() => openAppealModal(item)}
            />
          ))}
        </motion.div>
      )}
      
      {/* Appeal Modal */}
      <AppealModal />
    </div>
  );
}

// Content Card Component
interface ContentCardProps {
  item: ContentItem;
  existingCase?: any;
  onAppeal: () => void;
}

function ContentCard({ item, existingCase, onAppeal }: ContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div variants={itemVariants}>
      <GlassCard className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={clsx(
              'p-2 rounded-lg',
              item.contentType === 'video' && 'bg-primary-500/10 text-primary-400',
              item.contentType === 'image' && 'bg-accent-500/10 text-accent-400',
              item.contentType === 'text' && 'bg-warning-500/10 text-warning-400',
            )}>
              <ContentTypeIcon type={item.contentType} />
            </div>
            <div>
              <p className="text-xs text-dark-400 capitalize">{item.platform}</p>
              <p className="text-xs text-dark-500">{item.uploadDate}</p>
            </div>
          </div>
          <StatusBadge status={item.guardianClassification} />
        </div>
        
        {/* Title & Creator */}
        <h3 className="font-semibold text-white mb-1 line-clamp-2">{item.title}</h3>
        <p className="text-sm text-dark-400 mb-3">{item.creatorName}</p>
        
        {/* Confidence Score */}
        <ConfidenceMeter 
          value={item.guardianScore} 
          label="Guardian Confidence"
          className="mb-3"
        />
        
        {/* Reason */}
        <p className="text-sm text-dark-400 line-clamp-2 mb-4 flex-1">
          {item.guardianReason}
        </p>
        
        {/* Expandable Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-dark-400">Content Hash</span>
                  <span className="font-mono text-dark-300">{item.contentHash.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-400">DKG Asset ID</span>
                  <span className="font-mono text-accent-400">{item.dkgId.split(':').pop()?.slice(0, 8)}...</span>
                </div>
                {item.duration && (
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400">Duration</span>
                    <span className="text-dark-300">{item.duration}s</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-dark-400">Has Original Source</span>
                  <span className={item.hasOriginalSource ? 'text-success-400' : 'text-dark-500'}>
                    {item.hasOriginalSource ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          {existingCase ? (
            <a 
              href={`/cases/${existingCase['@id'].split(':').pop()}`}
              className="btn-secondary flex-1 text-sm py-2"
            >
              <Scale className="w-4 h-4 mr-1" />
              View Appeal
              <StatusBadge status={existingCase.appealStatus} className="ml-2 scale-90" />
            </a>
          ) : (
            <button 
              onClick={onAppeal}
              className="btn-primary flex-1 text-sm py-2"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              File Appeal
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-ghost p-2"
          >
            <ChevronDown className={clsx(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )} />
          </button>
          
          <a 
            href={item.contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost p-2"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default ContentPage;
