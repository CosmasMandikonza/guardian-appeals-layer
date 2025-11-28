import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Scale, Zap, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge, ConfidenceMeter, ContentTypeIcon } from './ui';

export function AppealModal() {
  const { 
    isAppealModalOpen, 
    appealingContent, 
    closeAppealModal,
    createCase
  } = useStore();
  
  const [statement, setStatement] = useState('');
  const [creatorDid, setCreatorDid] = useState('did:key:z6Mk...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  if (!appealingContent) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const result = await createCase(
        appealingContent.id,
        creatorDid,
        statement
      );
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          closeAppealModal();
          setSuccess(false);
          setStatement('');
        }, 2000);
      } else {
        setError('Failed to create appeal. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      closeAppealModal();
      setStatement('');
      setError(null);
      setSuccess(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isAppealModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full z-50"
          >
            <div className="glass rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning-500/10">
                    <Scale className="w-5 h-5 text-warning-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">File Appeal</h2>
                    <p className="text-sm text-dark-400">Challenge this moderation decision</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>
              
              {/* Content Summary */}
              <div className="p-6 bg-dark-900/30 border-b border-white/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-dark-800">
                    <ContentTypeIcon type={appealingContent.contentType} className="w-6 h-6 text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{appealingContent.title}</h3>
                    <p className="text-sm text-dark-400">{appealingContent.creatorName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={appealingContent.guardianClassification} />
                      <span className="text-xs text-dark-500">
                        {(appealingContent.guardianScore * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                  <p className="text-sm text-dark-400 mb-1">Guardian's Reason:</p>
                  <p className="text-sm text-dark-300">{appealingContent.guardianReason}</p>
                </div>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Creator DID */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Your Creator DID
                  </label>
                  <input
                    type="text"
                    value={creatorDid}
                    onChange={(e) => setCreatorDid(e.target.value)}
                    placeholder="did:key:z6Mk..."
                    className="input font-mono text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-dark-500">
                    Your decentralized identifier for the appeal record
                  </p>
                </div>
                
                {/* Appeal Statement */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Appeal Statement
                  </label>
                  <textarea
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Explain why you believe this content was incorrectly flagged. Include any relevant context, such as whether this is satire, educational content, or if you have proof of original ownership."
                    rows={4}
                    className="textarea"
                    required
                    minLength={20}
                  />
                  <p className="mt-1 text-xs text-dark-500">
                    Minimum 20 characters. Be specific about why the Guardian's decision is incorrect.
                  </p>
                </div>
                
                {/* Fast-track info */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-accent-500/10 to-primary-500/10 border border-accent-500/20">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Fast-Track Available</p>
                      <p className="text-sm text-dark-400 mt-1">
                        After filing, you can pay 0.10 USDC via x402 for priority processing. 
                        Fast-tracked appeals are processed within minutes instead of hours.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                    {error}
                  </div>
                )}
                
                {/* Success */}
                {success && (
                  <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20 text-success-400 text-sm">
                    Appeal submitted successfully! Redirecting...
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || statement.length < 20 || success}
                    className="btn-primary flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Scale className="w-4 h-4 mr-2" />
                        Submit Appeal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AppealModal;
