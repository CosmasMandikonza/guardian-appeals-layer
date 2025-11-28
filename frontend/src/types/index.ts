// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// Content types
export interface ContentItem {
  id: string;
  dkgId: string;
  contentUrl: string;
  contentHash: string;
  platform: string;
  contentType: 'video' | 'image' | 'text';
  title: string;
  description: string;
  creatorName: string;
  creatorDid: string;
  uploadDate: string;
  duration?: number;
  guardianClassification: 'deepfake_suspected' | 'harmful_content' | 'copyright_violation' | 'misinformation' | 'safe';
  guardianScore: number;
  guardianReason: string;
  hasOriginalSource?: boolean;
}

// Case types
export interface CaseItem {
  '@context': string;
  '@type': string;
  '@id': string;
  contentReference: string;
  creatorDid: string;
  appealStatus: 'open' | 'in_review' | 'resolved_upheld' | 'resolved_overturned';
  appealStatement: string;
  priority: boolean;
  evidence: string[];
  resolution: {
    '@type': string;
    status: 'pending' | 'resolved';
    decidedBy: string | null;
    decisionTime: string | null;
    confidenceScore: number | null;
    reasoning: string | null;
    paymentTx: string | null;
  };
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  contentTitle?: string;
  contentType?: string;
  creatorName?: string;
}

// Evidence types
export interface EvidenceItem {
  '@context': string;
  '@type': string;
  '@id': string;
  caseReference: string;
  evidenceType: 'SourceLink' | 'SocialGraph' | 'GuardianLog' | 'ExternalVerification' | 'CommunityNote';
  submittedBy: string;
  summary: string;
  supportScore: number;
  sourceUrls: string[];
  analysisDetails: {
    method: string;
    confidence: number;
    findings: string[];
  };
  createdAt: string;
}

// Metrics types
export interface MetricsData {
  dataset: {
    total: number;
    flagged: number;
    safe: number;
  };
  baseline: {
    accuracy: number;
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
  };
  gal: {
    totalAppeals: number;
    resolved: number;
    overturned: number;
    upheld: number;
    pending: number;
    priority: number;
    postGalAccuracy: number;
    improvement: number;
  };
  summary: {
    baselineAccuracyPercent: string;
    postGalAccuracyPercent: string;
    improvementPercent: string;
    falsePositivesCorrected: number;
  };
}

// Case detail response
export interface CaseDetailResponse {
  case: CaseItem;
  evidence: EvidenceItem[];
  content: {
    title: string;
    description: string;
    contentType: string;
    platform: string;
    creatorName: string;
    guardianReason: string;
  } | null;
}

// x402 types
export interface X402Info {
  price: {
    amount: string;
    symbol: string;
    decimals: number;
  };
  network: string;
  asset: string;
  treasury: string;
  description: string;
}

export interface X402PaymentRequired {
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
  }>;
}
