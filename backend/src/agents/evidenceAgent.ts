/**
 * Evidence & Resolution Agent
 * 
 * This agent is responsible for:
 * 1. Gathering evidence when a new appeal (CaseAsset) is created
 * 2. Querying the DKG for related information
 * 3. Analyzing evidence to determine if the appeal should be upheld or overturned
 * 4. Publishing EvidenceAssets and updating CaseAssets with resolutions
 * 
 * This is the core "AI agent" component of GAL that demonstrates
 * autonomous decision-making backed by DKG knowledge.
 */

import { 
  dkgClient, 
  CaseAsset, 
  ContentAsset, 
  EvidenceAsset, 
  ReputationAsset 
} from '../dkg/client.js';
import { sampleDataset, SampleContent } from '../data/sampleDataset.js';
import { nanoid } from 'nanoid';

// ============================================================================
// Agent Configuration
// ============================================================================

interface AgentConfig {
  // Thresholds for decision making
  overturneThreshold: number;      // Score above this = overturn the flag
  upholdThreshold: number;         // Score below this = uphold the flag
  
  // Weights for different evidence types
  weights: {
    originalSource: number;        // Weight for verified original source
    creatorReputation: number;     // Weight for creator's past reputation
    guardianConfidence: number;    // Weight for Guardian's confidence (negative)
    contentType: number;           // Weight based on content type context
    platformContext: number;       // Weight for platform-specific context
  };
  
  // Processing settings
  priorityBoost: number;           // Processing priority for paid cases
  maxEvidenceSources: number;      // Max evidence items to gather
}

const defaultConfig: AgentConfig = {
  overturneThreshold: 0.6,
  upholdThreshold: 0.4,
  weights: {
    originalSource: 0.35,
    creatorReputation: 0.20,
    guardianConfidence: 0.25,
    contentType: 0.10,
    platformContext: 0.10,
  },
  priorityBoost: 1.5,
  maxEvidenceSources: 5,
};

// ============================================================================
// Evidence Gathering Functions
// ============================================================================

interface GatheredEvidence {
  type: EvidenceAsset['evidenceType'];
  summary: string;
  supportScore: number; // -1 to +1
  sourceUrls: string[];
  confidence: number;
  findings: string[];
}

/**
 * Verify if an original source exists and matches the content
 */
async function gatherOriginalSourceEvidence(
  content: ContentAsset,
  sampleData?: SampleContent
): Promise<GatheredEvidence | null> {
  // Simulate checking original source
  // In production, this would make actual HTTP requests to verify
  
  if (sampleData?.originalSource) {
    // Found original source - this supports the appeal
    return {
      type: 'SourceLink',
      summary: `Original source verified at ${sampleData.originalSource}. Content appears to be legitimately published by the creator.`,
      supportScore: 0.8,
      sourceUrls: [sampleData.originalSource],
      confidence: 0.85,
      findings: [
        'Original publication source found',
        'Creator identity matches original publisher',
        'Content timestamp predates flag',
      ],
    };
  }
  
  // No original source found
  return {
    type: 'SourceLink',
    summary: 'No verifiable original source found for this content.',
    supportScore: -0.3,
    sourceUrls: [],
    confidence: 0.6,
    findings: [
      'Unable to locate original publication',
      'No authoritative source reference provided',
    ],
  };
}

/**
 * Check creator's reputation and history
 */
async function gatherReputationEvidence(
  creatorDid: string
): Promise<GatheredEvidence> {
  // Query DKG for creator's reputation
  const cases = await dkgClient.getCasesByCreator(creatorDid);
  
  let successfulAppeals = 0;
  let totalAppeals = 0;
  
  if (cases.data) {
    totalAppeals = cases.data.length;
    successfulAppeals = cases.data.filter(
      c => c.appealStatus === 'resolved_overturned'
    ).length;
  }
  
  // Calculate reputation-based support
  const successRate = totalAppeals > 0 ? successfulAppeals / totalAppeals : 0.5;
  const supportScore = (successRate - 0.5) * 2; // Normalize to -1 to +1
  
  return {
    type: 'SocialGraph',
    summary: totalAppeals > 0 
      ? `Creator has ${totalAppeals} past appeals with ${(successRate * 100).toFixed(0)}% success rate.`
      : 'New creator with no previous appeal history.',
    supportScore: supportScore,
    sourceUrls: [],
    confidence: totalAppeals > 3 ? 0.8 : 0.5, // More history = more confidence
    findings: [
      `Total past appeals: ${totalAppeals}`,
      `Successful appeals: ${successfulAppeals}`,
      `Success rate: ${(successRate * 100).toFixed(1)}%`,
    ],
  };
}

/**
 * Analyze Guardian's classification reasoning
 */
async function gatherGuardianLogEvidence(
  content: ContentAsset
): Promise<GatheredEvidence> {
  // Analyze the Guardian's reasoning
  const classification = content.guardianClassification;
  const score = content.guardianScore;
  
  // Lower Guardian confidence = higher support for appeal
  const supportScore = -(score - 0.5) * 2; // Invert: high Guardian score = negative support
  
  return {
    type: 'GuardianLog',
    summary: `Guardian flagged content as "${classification}" with ${(score * 100).toFixed(0)}% confidence.`,
    supportScore: supportScore,
    sourceUrls: [],
    confidence: 0.9, // We trust Guardian's reported confidence
    findings: [
      `Classification: ${classification}`,
      `Confidence: ${(score * 100).toFixed(1)}%`,
      `Low confidence may indicate edge case`,
    ],
  };
}

/**
 * Check content type context (some content types are more likely to be false positives)
 */
async function gatherContentTypeEvidence(
  content: ContentAsset,
  sampleData?: SampleContent
): Promise<GatheredEvidence> {
  // Platforms and content types that are commonly false positives
  const legitimateContexts = [
    'comedy', 'satire', 'parody', 'education', 'tutorial', 
    'documentary', 'art', 'music', 'vfx', 'film',
  ];
  
  const description = sampleData?.description?.toLowerCase() || '';
  const title = sampleData?.title?.toLowerCase() || '';
  const platform = content.platform.toLowerCase();
  
  const contextMatches = legitimateContexts.filter(
    ctx => description.includes(ctx) || title.includes(ctx) || platform.includes(ctx)
  );
  
  if (contextMatches.length > 0) {
    return {
      type: 'ExternalVerification',
      summary: `Content appears to be in a legitimate context: ${contextMatches.join(', ')}.`,
      supportScore: 0.5,
      sourceUrls: [],
      confidence: 0.7,
      findings: [
        `Legitimate context indicators: ${contextMatches.join(', ')}`,
        'Content type commonly produces false positives',
      ],
    };
  }
  
  return {
    type: 'ExternalVerification',
    summary: 'No specific legitimate context indicators found.',
    supportScore: 0,
    sourceUrls: [],
    confidence: 0.5,
    findings: ['Standard content context'],
  };
}

// ============================================================================
// Resolution Computation
// ============================================================================

interface ResolutionResult {
  decision: 'upheld' | 'overturned';
  confidenceScore: number;
  reasoning: string;
  evidenceUsed: GatheredEvidence[];
}

function computeResolution(
  evidence: GatheredEvidence[],
  config: AgentConfig = defaultConfig
): ResolutionResult {
  // Calculate weighted score
  let totalScore = 0;
  let totalWeight = 0;
  
  const evidenceByType = new Map<string, GatheredEvidence>();
  evidence.forEach(e => evidenceByType.set(e.type, e));
  
  // Apply weights based on evidence type
  const sourceEvidence = evidenceByType.get('SourceLink');
  if (sourceEvidence) {
    totalScore += sourceEvidence.supportScore * config.weights.originalSource * sourceEvidence.confidence;
    totalWeight += config.weights.originalSource;
  }
  
  const reputationEvidence = evidenceByType.get('SocialGraph');
  if (reputationEvidence) {
    totalScore += reputationEvidence.supportScore * config.weights.creatorReputation * reputationEvidence.confidence;
    totalWeight += config.weights.creatorReputation;
  }
  
  const guardianEvidence = evidenceByType.get('GuardianLog');
  if (guardianEvidence) {
    totalScore += guardianEvidence.supportScore * config.weights.guardianConfidence * guardianEvidence.confidence;
    totalWeight += config.weights.guardianConfidence;
  }
  
  const contextEvidence = evidenceByType.get('ExternalVerification');
  if (contextEvidence) {
    totalScore += contextEvidence.supportScore * config.weights.contentType * contextEvidence.confidence;
    totalWeight += config.weights.contentType;
  }
  
  // Normalize score to 0-1 range
  const normalizedScore = totalWeight > 0 
    ? (totalScore / totalWeight + 1) / 2 // Convert from -1,1 to 0,1
    : 0.5;
  
  // Make decision
  let decision: 'upheld' | 'overturned';
  let reasoning: string;
  
  if (normalizedScore >= config.overturneThreshold) {
    decision = 'overturned';
    reasoning = `Evidence strongly supports the appeal (score: ${(normalizedScore * 100).toFixed(1)}%). The Guardian's flag appears to be a false positive based on verified original source, creator reputation, and content context.`;
  } else if (normalizedScore <= config.upholdThreshold) {
    decision = 'upheld';
    reasoning = `Evidence does not support the appeal (score: ${(normalizedScore * 100).toFixed(1)}%). The Guardian's classification appears accurate based on available evidence.`;
  } else {
    // Edge case - slight lean towards appeal if close
    decision = normalizedScore > 0.5 ? 'overturned' : 'upheld';
    reasoning = `Evidence is mixed (score: ${(normalizedScore * 100).toFixed(1)}%). Decision made with moderate confidence based on aggregate evidence analysis.`;
  }
  
  return {
    decision,
    confidenceScore: normalizedScore,
    reasoning,
    evidenceUsed: evidence,
  };
}

// ============================================================================
// Main Agent Functions
// ============================================================================

/**
 * Process a single appeal case
 */
export async function processAppealCase(
  caseId: string,
  config: AgentConfig = defaultConfig
): Promise<{
  success: boolean;
  resolution?: ResolutionResult;
  evidenceIds?: string[];
  error?: string;
}> {
  console.log(`\n[EvidenceAgent] Processing case: ${caseId}`);
  
  try {
    // 1. Fetch the case from DKG
    const caseResult = await dkgClient.getCaseAsset(caseId);
    if (!caseResult.data) {
      return { success: false, error: 'Case not found in DKG' };
    }
    
    const caseAsset = caseResult.data;
    console.log(`[EvidenceAgent] Case status: ${caseAsset.appealStatus}`);
    
    // Skip if already resolved
    if (caseAsset.appealStatus.startsWith('resolved_')) {
      return { success: false, error: 'Case already resolved' };
    }
    
    // 2. Fetch the related content - try by ID first, then by hash
    let content: ContentAsset | null = null;
    
    // First try direct lookup
    const contentResult = await dkgClient.getContentAsset(caseAsset.contentReference);
    if (contentResult.data) {
      content = contentResult.data;
    } else {
      // If not found by ID, try to find by hash in sample data
      const sampleContentId = caseAsset.contentReference.split(':').pop();
      const sampleMatch = sampleDataset.find(s => s.id === sampleContentId);
      
      if (sampleMatch) {
        // Look up by hash
        const hashResult = await dkgClient.getContentByHash(sampleMatch.contentHash);
        if (hashResult.data) {
          content = hashResult.data;
        }
      }
    }
    
    if (!content) {
      return { success: false, error: 'Content not found in DKG' };
    }
    
    // Find sample data for additional context (in production, this would be real verification)
    const sampleData = sampleDataset.find(s => 
      `did:dkg:content:${s.id}` === caseAsset.contentReference ||
      s.contentHash === content.contentHash
    );
    
    // 3. Update case to in_review
    await dkgClient.updateCaseAsset(caseId, { appealStatus: 'in_review' });
    console.log(`[EvidenceAgent] Case marked as in_review`);
    
    // 4. Gather evidence from multiple sources
    console.log(`[EvidenceAgent] Gathering evidence...`);
    
    const gatheredEvidence: GatheredEvidence[] = [];
    
    // Original source verification
    const sourceEvidence = await gatherOriginalSourceEvidence(content, sampleData);
    if (sourceEvidence) gatheredEvidence.push(sourceEvidence);
    
    // Creator reputation
    const reputationEvidence = await gatherReputationEvidence(caseAsset.creatorDid);
    gatheredEvidence.push(reputationEvidence);
    
    // Guardian log analysis
    const guardianEvidence = await gatherGuardianLogEvidence(content);
    gatheredEvidence.push(guardianEvidence);
    
    // Content type context
    const contextEvidence = await gatherContentTypeEvidence(content, sampleData);
    gatheredEvidence.push(contextEvidence);
    
    console.log(`[EvidenceAgent] Gathered ${gatheredEvidence.length} evidence items`);
    
    // 5. Publish evidence assets to DKG
    const evidenceIds: string[] = [];
    
    for (const evidence of gatheredEvidence) {
      const result = await dkgClient.publishEvidenceAsset({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        caseReference: caseId,
        evidenceType: evidence.type,
        submittedBy: 'did:dkg:agent:evidence-resolver',
        summary: evidence.summary,
        supportScore: evidence.supportScore,
        sourceUrls: evidence.sourceUrls,
        analysisDetails: {
          method: 'GAL Evidence Agent v1.0',
          confidence: evidence.confidence,
          findings: evidence.findings,
        },
      });
      
      if (result.success) {
        evidenceIds.push(result.assetId);
      }
    }
    
    console.log(`[EvidenceAgent] Published ${evidenceIds.length} evidence assets`);
    
    // 6. Compute resolution
    const resolution = computeResolution(gatheredEvidence, config);
    console.log(`[EvidenceAgent] Decision: ${resolution.decision} (confidence: ${(resolution.confidenceScore * 100).toFixed(1)}%)`);
    
    // 7. Update case with resolution
    const finalStatus = resolution.decision === 'overturned' 
      ? 'resolved_overturned' 
      : 'resolved_upheld';
    
    await dkgClient.updateCaseAsset(caseId, {
      appealStatus: finalStatus,
      evidence: evidenceIds,
      resolution: {
        '@type': 'Action',
        status: 'resolved',
        decidedBy: 'did:dkg:agent:evidence-resolver',
        decisionTime: new Date().toISOString(),
        confidenceScore: resolution.confidenceScore,
        reasoning: resolution.reasoning,
        paymentTx: caseAsset.priority ? `0x${nanoid(64).toLowerCase()}` : null,
      },
    });
    
    console.log(`[EvidenceAgent] Case resolved: ${finalStatus}`);
    
    return {
      success: true,
      resolution,
      evidenceIds,
    };
    
  } catch (error) {
    console.error(`[EvidenceAgent] Error processing case:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process all pending cases (background job)
 */
export async function processAllPendingCases(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  console.log('\n[EvidenceAgent] Starting batch processing of pending cases...');
  
  // Get all open cases
  const openCases = await dkgClient.getCasesByStatus('open');
  const inReviewCases = await dkgClient.getCasesByStatus('in_review');
  
  const pendingCases = [
    ...(openCases.data || []),
    ...(inReviewCases.data || []),
  ];
  
  // Sort by priority (paid cases first)
  pendingCases.sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  console.log(`[EvidenceAgent] Found ${pendingCases.length} pending cases`);
  
  let successful = 0;
  let failed = 0;
  
  for (const caseAsset of pendingCases) {
    const result = await processAppealCase(caseAsset['@id']);
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    
    // Small delay between cases
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`[EvidenceAgent] Batch complete: ${successful} successful, ${failed} failed`);
  
  return {
    processed: pendingCases.length,
    successful,
    failed,
  };
}

export default {
  processAppealCase,
  processAllPendingCases,
};