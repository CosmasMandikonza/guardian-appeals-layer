/**
 * Guardian Ingest Agent
 * 
 * This agent simulates receiving flags from Umanitek Guardian
 * and creates ContentAssets on the DKG for each flagged item.
 * 
 * In production, this would:
 * 1. Connect to Guardian API webhooks
 * 2. Process real-time moderation events
 * 3. Create Knowledge Assets for each flag
 */

import { dkgClient, ContentAsset } from '../dkg/client.js';
import { sampleDataset, SampleContent } from '../data/sampleDataset.js';

interface IngestResult {
  success: boolean;
  contentId?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Ingest a single content item from Guardian
 */
export async function ingestGuardianFlag(
  item: SampleContent
): Promise<IngestResult> {
  console.log(`[GuardianIngest] Processing: ${item.title}`);
  
  try {
    // Create ContentAsset from Guardian flag
    const result = await dkgClient.publishContentAsset({
      '@context': 'https://schema.org',
      '@type': 'MediaObject',
      contentUrl: item.contentUrl,
      contentHash: item.contentHash,
      platform: item.platform,
      guardianClassification: item.guardianClassification,
      guardianScore: item.guardianScore,
      guardianVersion: '2.0.0',
      metadata: {
        originalCreator: item.creatorName,
        uploadDate: item.uploadDate,
        contentType: item.contentType,
        duration: item.duration,
      },
    });
    
    if (result.success) {
      console.log(`[GuardianIngest] Published ContentAsset: ${result.assetId}`);
      return {
        success: true,
        contentId: result.assetId,
        transactionHash: result.transactionHash,
      };
    }
    
    return { success: false, error: 'DKG publish failed' };
    
  } catch (error) {
    console.error(`[GuardianIngest] Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ingest all sample data (initialization)
 */
export async function ingestAllSampleData(): Promise<{
  total: number;
  successful: number;
  failed: number;
  contentIds: string[];
}> {
  console.log('\n[GuardianIngest] Starting bulk ingest of sample data...');
  
  const contentIds: string[] = [];
  let successful = 0;
  let failed = 0;
  
  for (const item of sampleDataset) {
    // Only ingest flagged content (not 'safe')
    if (item.guardianClassification === 'safe') {
      continue;
    }
    
    const result = await ingestGuardianFlag(item);
    
    if (result.success && result.contentId) {
      successful++;
      contentIds.push(result.contentId);
    } else {
      failed++;
    }
    
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`[GuardianIngest] Bulk ingest complete: ${successful} successful, ${failed} failed`);
  
  return {
    total: sampleDataset.filter(s => s.guardianClassification !== 'safe').length,
    successful,
    failed,
    contentIds,
  };
}

/**
 * Get mapping of sample IDs to DKG content IDs
 */
export function getSampleToDkgMapping(): Map<string, string> {
  const mapping = new Map<string, string>();
  
  // In a real implementation, this would query the DKG
  // For demo, we create deterministic IDs
  sampleDataset.forEach(item => {
    if (item.guardianClassification !== 'safe') {
      mapping.set(item.id, `did:dkg:content:${item.id}`);
    }
  });
  
  return mapping;
}

export default {
  ingestGuardianFlag,
  ingestAllSampleData,
  getSampleToDkgMapping,
};
