/**
 * DKG Client - OriginTrail Decentralized Knowledge Graph Integration
 * 
 * This module provides the interface to the OriginTrail DKG for publishing
 * and querying Knowledge Assets. In production, this would connect to a
 * DKG Edge Node. For hackathon purposes, we provide both real and mock
 * implementations.
 */

import { nanoid } from 'nanoid';

// ============================================================================
// Knowledge Asset Types (JSON-LD Schema)
// ============================================================================

export interface ContentAsset {
  '@context': 'https://schema.org';
  '@type': 'MediaObject';
  '@id': string; // did:dkg:content:{id}
  contentUrl: string;
  contentHash: string;
  platform: string;
  guardianClassification: 'deepfake_suspected' | 'harmful_content' | 'copyright_violation' | 'misinformation' | 'safe';
  guardianScore: number; // 0-1 confidence
  guardianVersion: string;
  createdAt: string;
  metadata?: {
    originalCreator?: string;
    uploadDate?: string;
    contentType?: string;
    duration?: number;
  };
}

export interface CaseAsset {
  '@context': 'https://schema.org';
  '@type': 'CreativeWork';
  '@id': string; // did:dkg:case:{id}
  contentReference: string; // did:dkg:content:{id}
  creatorDid: string;
  appealStatus: 'open' | 'in_review' | 'resolved_upheld' | 'resolved_overturned';
  appealStatement: string;
  priority: boolean;
  evidence: string[]; // Array of EvidenceAsset @ids
  resolution: {
    '@type': 'Action';
    status: 'pending' | 'resolved';
    decidedBy: string | null;
    decisionTime: string | null;
    confidenceScore: number | null;
    reasoning: string | null;
    paymentTx: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceAsset {
  '@context': 'https://schema.org';
  '@type': 'CreativeWork';
  '@id': string; // did:dkg:evidence:{id}
  caseReference: string; // did:dkg:case:{id}
  evidenceType: 'SourceLink' | 'SocialGraph' | 'GuardianLog' | 'ExternalVerification' | 'CommunityNote';
  submittedBy: string; // DID or "agent:evidence-resolver"
  summary: string;
  supportScore: number; // -1 to +1 (negative = against appeal, positive = supports appeal)
  sourceUrls: string[];
  analysisDetails: {
    method: string;
    confidence: number;
    findings: string[];
  };
  createdAt: string;
}

export interface ReputationAsset {
  '@context': 'https://schema.org';
  '@type': 'Person';
  '@id': string; // did:dkg:reputation:{id}
  wallet?: string;
  reputationScore: number; // 0-1
  totalAppeals: number;
  successfulAppeals: number;
  totalReviews: number;
  accurateReviews: number;
  lastUpdated: string;
}

// ============================================================================
// DKG Client Interface
// ============================================================================

export interface DKGPublishResult {
  success: boolean;
  assetId: string;
  transactionHash?: string;
  blockNumber?: number;
  timestamp: string;
}

export interface DKGQueryResult<T> {
  success: boolean;
  data: T | null;
  source: 'dkg' | 'cache';
}

export interface DKGClient {
  // Publishing Knowledge Assets
  publishContentAsset(asset: Omit<ContentAsset, '@id' | 'createdAt'>): Promise<DKGPublishResult>;
  publishCaseAsset(asset: Omit<CaseAsset, '@id' | 'createdAt' | 'updatedAt'>): Promise<DKGPublishResult>;
  publishEvidenceAsset(asset: Omit<EvidenceAsset, '@id' | 'createdAt'>): Promise<DKGPublishResult>;
  publishReputationAsset(asset: Omit<ReputationAsset, '@id' | 'lastUpdated'>): Promise<DKGPublishResult>;
  
  // Updating Knowledge Assets
  updateCaseAsset(id: string, updates: Partial<CaseAsset>): Promise<DKGPublishResult>;
  updateReputationAsset(id: string, updates: Partial<ReputationAsset>): Promise<DKGPublishResult>;
  
  // Querying Knowledge Assets
  getContentAsset(id: string): Promise<DKGQueryResult<ContentAsset>>;
  getCaseAsset(id: string): Promise<DKGQueryResult<CaseAsset>>;
  getEvidenceAsset(id: string): Promise<DKGQueryResult<EvidenceAsset>>;
  getReputationAsset(id: string): Promise<DKGQueryResult<ReputationAsset>>;
  
  // Advanced Queries
  getCasesByCreator(creatorDid: string): Promise<DKGQueryResult<CaseAsset[]>>;
  getCasesByStatus(status: CaseAsset['appealStatus']): Promise<DKGQueryResult<CaseAsset[]>>;
  getEvidenceForCase(caseId: string): Promise<DKGQueryResult<EvidenceAsset[]>>;
  getContentByHash(hash: string): Promise<DKGQueryResult<ContentAsset>>;
}

// ============================================================================
// Mock DKG Client (For Development/Demo)
// ============================================================================

class InMemoryStore {
  private contentAssets: Map<string, ContentAsset> = new Map();
  private caseAssets: Map<string, CaseAsset> = new Map();
  private evidenceAssets: Map<string, EvidenceAsset> = new Map();
  private reputationAssets: Map<string, ReputationAsset> = new Map();
  
  setContent(id: string, asset: ContentAsset) { this.contentAssets.set(id, asset); }
  getContent(id: string) { return this.contentAssets.get(id) || null; }
  getAllContent() { return Array.from(this.contentAssets.values()); }
  
  setCase(id: string, asset: CaseAsset) { this.caseAssets.set(id, asset); }
  getCase(id: string) { return this.caseAssets.get(id) || null; }
  getAllCases() { return Array.from(this.caseAssets.values()); }
  
  setEvidence(id: string, asset: EvidenceAsset) { this.evidenceAssets.set(id, asset); }
  getEvidence(id: string) { return this.evidenceAssets.get(id) || null; }
  getAllEvidence() { return Array.from(this.evidenceAssets.values()); }
  
  setReputation(id: string, asset: ReputationAsset) { this.reputationAssets.set(id, asset); }
  getReputation(id: string) { return this.reputationAssets.get(id) || null; }
  getReputationByWallet(wallet: string) {
    return Array.from(this.reputationAssets.values()).find(r => r.wallet === wallet) || null;
  }
}

// Global store instance (simulating DKG persistence)
const store = new InMemoryStore();

export class MockDKGClient implements DKGClient {
  private simulateLatency = true;
  private latencyMs = 300;
  
  private async delay() {
    if (this.simulateLatency) {
      await new Promise(resolve => setTimeout(resolve, this.latencyMs + Math.random() * 200));
    }
  }
  
  private generateId(prefix: string): string {
    return `did:dkg:${prefix}:${nanoid(12)}`;
  }
  
  private generateTxHash(): string {
    return `0x${nanoid(64).toLowerCase()}`;
  }
  
  // ============== Publishing ==============
  
  async publishContentAsset(
    asset: Omit<ContentAsset, '@id' | 'createdAt'>
  ): Promise<DKGPublishResult> {
    await this.delay();
    
    const id = this.generateId('content');
    const fullAsset: ContentAsset = {
      ...asset,
      '@id': id,
      createdAt: new Date().toISOString(),
    };
    
    store.setContent(id, fullAsset);
    
    console.log(`[DKG] Published ContentAsset: ${id}`);
    
    return {
      success: true,
      assetId: id,
      transactionHash: this.generateTxHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 20000000,
      timestamp: new Date().toISOString(),
    };
  }
  
  async publishCaseAsset(
    asset: Omit<CaseAsset, '@id' | 'createdAt' | 'updatedAt'>
  ): Promise<DKGPublishResult> {
    await this.delay();
    
    const id = this.generateId('case');
    const now = new Date().toISOString();
    const fullAsset: CaseAsset = {
      ...asset,
      '@id': id,
      createdAt: now,
      updatedAt: now,
    };
    
    store.setCase(id, fullAsset);
    
    console.log(`[DKG] Published CaseAsset: ${id}`);
    
    return {
      success: true,
      assetId: id,
      transactionHash: this.generateTxHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 20000000,
      timestamp: now,
    };
  }
  
  async publishEvidenceAsset(
    asset: Omit<EvidenceAsset, '@id' | 'createdAt'>
  ): Promise<DKGPublishResult> {
    await this.delay();
    
    const id = this.generateId('evidence');
    const fullAsset: EvidenceAsset = {
      ...asset,
      '@id': id,
      createdAt: new Date().toISOString(),
    };
    
    store.setEvidence(id, fullAsset);
    
    console.log(`[DKG] Published EvidenceAsset: ${id}`);
    
    return {
      success: true,
      assetId: id,
      transactionHash: this.generateTxHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 20000000,
      timestamp: new Date().toISOString(),
    };
  }
  
  async publishReputationAsset(
    asset: Omit<ReputationAsset, '@id' | 'lastUpdated'>
  ): Promise<DKGPublishResult> {
    await this.delay();
    
    const id = this.generateId('reputation');
    const fullAsset: ReputationAsset = {
      ...asset,
      '@id': id,
      lastUpdated: new Date().toISOString(),
    };
    
    store.setReputation(id, fullAsset);
    
    console.log(`[DKG] Published ReputationAsset: ${id}`);
    
    return {
      success: true,
      assetId: id,
      transactionHash: this.generateTxHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 20000000,
      timestamp: new Date().toISOString(),
    };
  }
  
  // ============== Updating ==============
  
  async updateCaseAsset(
    id: string,
    updates: Partial<CaseAsset>
  ): Promise<DKGPublishResult> {
    await this.delay();
    
    const existing = store.getCase(id);
    if (!existing) {
      return { success: false, assetId: id, timestamp: new Date().toISOString() };
    }
    
    const updated: CaseAsset = {
      ...existing,
      ...updates,
      '@id': id, // Preserve ID
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      updatedAt: new Date().toISOString(),
    };
    
    store.setCase(id, updated);
    
    console.log(`[DKG] Updated CaseAsset: ${id}`);
    
    return {
      success: true,
      assetId: id,
      transactionHash: this.generateTxHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 20000000,
      timestamp: new Date().toISOString(),
    };
  }
  
  async updateReputationAsset(
    id: string,
    updates: Partial<ReputationAsset>
  ): Promise<DKGPublishResult> {
    await this.delay();
    
    const existing = store.getReputation(id);
    if (!existing) {
      return { success: false, assetId: id, timestamp: new Date().toISOString() };
    }
    
    const updated: ReputationAsset = {
      ...existing,
      ...updates,
      '@id': id,
      '@context': 'https://schema.org',
      '@type': 'Person',
      lastUpdated: new Date().toISOString(),
    };
    
    store.setReputation(id, updated);
    
    console.log(`[DKG] Updated ReputationAsset: ${id}`);
    
    return {
      success: true,
      assetId: id,
      transactionHash: this.generateTxHash(),
      timestamp: new Date().toISOString(),
    };
  }
  
  // ============== Querying ==============
  
  async getContentAsset(id: string): Promise<DKGQueryResult<ContentAsset>> {
    await this.delay();
    const data = store.getContent(id);
    return { success: data !== null, data, source: 'dkg' };
  }
  
  async getCaseAsset(id: string): Promise<DKGQueryResult<CaseAsset>> {
    await this.delay();
    const data = store.getCase(id);
    return { success: data !== null, data, source: 'dkg' };
  }
  
  async getEvidenceAsset(id: string): Promise<DKGQueryResult<EvidenceAsset>> {
    await this.delay();
    const data = store.getEvidence(id);
    return { success: data !== null, data, source: 'dkg' };
  }
  
  async getReputationAsset(id: string): Promise<DKGQueryResult<ReputationAsset>> {
    await this.delay();
    const data = store.getReputation(id);
    return { success: data !== null, data, source: 'dkg' };
  }
  
  // ============== Advanced Queries ==============
  
  async getCasesByCreator(creatorDid: string): Promise<DKGQueryResult<CaseAsset[]>> {
    await this.delay();
    const all = store.getAllCases();
    const filtered = all.filter(c => c.creatorDid === creatorDid);
    return { success: true, data: filtered, source: 'dkg' };
  }
  
  async getCasesByStatus(status: CaseAsset['appealStatus']): Promise<DKGQueryResult<CaseAsset[]>> {
    await this.delay();
    const all = store.getAllCases();
    const filtered = all.filter(c => c.appealStatus === status);
    return { success: true, data: filtered, source: 'dkg' };
  }
  
  async getEvidenceForCase(caseId: string): Promise<DKGQueryResult<EvidenceAsset[]>> {
    await this.delay();
    const all = store.getAllEvidence();
    const filtered = all.filter(e => e.caseReference === caseId);
    return { success: true, data: filtered, source: 'dkg' };
  }
  
  async getContentByHash(hash: string): Promise<DKGQueryResult<ContentAsset>> {
    await this.delay();
    const all = store.getAllContent();
    const found = all.find(c => c.contentHash === hash) || null;
    return { success: found !== null, data: found, source: 'dkg' };
  }
  
  // ============== Utility Methods ==============
  
  async getAllContentAssets(): Promise<DKGQueryResult<ContentAsset[]>> {
    await this.delay();
    return { success: true, data: store.getAllContent(), source: 'dkg' };
  }
  
  async getAllCaseAssets(): Promise<DKGQueryResult<CaseAsset[]>> {
    await this.delay();
    return { success: true, data: store.getAllCases(), source: 'dkg' };
  }
}

// Export singleton instance
export const dkgClient = new MockDKGClient();

// Type export for use elsewhere
export type { DKGClient as IDKGClient };
