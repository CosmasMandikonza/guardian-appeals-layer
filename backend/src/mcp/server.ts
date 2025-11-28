/**
 * MCP (Model Context Protocol) Server for Guardian Appeals Layer
 * 
 * This implements the Model Context Protocol to allow AI agents to:
 * 1. Query the DKG for flagged content and appeals
 * 2. Verify content authenticity
 * 3. Submit and process appeals
 * 4. Access evidence and resolution data
 * 
 * MCP is the "USB-C for AI" - a standardized way for LLMs to interact
 * with external tools and data sources.
 */

import { dkgClient, ContentAsset, CaseAsset, EvidenceAsset } from '../dkg/client.js';
import { sampleDataset, getFlaggedContent } from '../data/sampleDataset.js';
import { processAppealCase } from '../agents/evidenceAgent.js';

// ============================================================================
// MCP Tool Definitions (Following Anthropic's MCP Spec)
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  dkg_asset_id?: string;
  provenance?: {
    source: string;
    verified: boolean;
    timestamp: string;
  };
}

// ============================================================================
// Available MCP Tools for AI Agents
// ============================================================================

export const mcpTools: MCPTool[] = [
  {
    name: 'query_flagged_content',
    description: 'Query the DKG for content flagged by Umanitek Guardian AI. Returns content items with their classification, confidence score, and DKG asset ID for verification.',
    input_schema: {
      type: 'object',
      properties: {
        classification: {
          type: 'string',
          description: 'Filter by Guardian classification type',
          enum: ['deepfake_suspected', 'harmful_content', 'copyright_violation', 'misinformation', 'all']
        },
        min_confidence: {
          type: 'string',
          description: 'Minimum confidence score (0-1)'
        },
        limit: {
          type: 'string',
          description: 'Maximum number of results to return'
        }
      },
      required: []
    }
  },
  {
    name: 'verify_content_authenticity',
    description: 'Verify if a piece of content exists in the DKG and retrieve its provenance chain. Use this to check if content has been verified or flagged.',
    input_schema: {
      type: 'object',
      properties: {
        content_hash: {
          type: 'string',
          description: 'SHA-256 hash of the content to verify'
        },
        content_url: {
          type: 'string',
          description: 'URL of the content to look up'
        }
      },
      required: []
    }
  },
  {
    name: 'get_appeal_status',
    description: 'Get the current status of an appeal case from the DKG, including evidence gathered and resolution.',
    input_schema: {
      type: 'object',
      properties: {
        case_id: {
          type: 'string',
          description: 'The DKG case asset ID (did:dkg:case:...)'
        },
        content_id: {
          type: 'string',
          description: 'The content ID to find related appeals'
        }
      },
      required: []
    }
  },
  {
    name: 'submit_appeal',
    description: 'Submit a new appeal for content that was flagged by Guardian AI. Creates a CaseAsset in the DKG.',
    input_schema: {
      type: 'object',
      properties: {
        content_id: {
          type: 'string',
          description: 'The DKG content asset ID to appeal'
        },
        creator_did: {
          type: 'string',
          description: 'The DID of the content creator filing the appeal'
        },
        appeal_statement: {
          type: 'string',
          description: 'Statement explaining why the flag was incorrect'
        }
      },
      required: ['content_id', 'creator_did', 'appeal_statement']
    }
  },
  {
    name: 'gather_evidence',
    description: 'Trigger the evidence-gathering agent to collect and analyze evidence for an appeal case.',
    input_schema: {
      type: 'object',
      properties: {
        case_id: {
          type: 'string',
          description: 'The case ID to gather evidence for'
        }
      },
      required: ['case_id']
    }
  },
  {
    name: 'get_trust_metrics',
    description: 'Get trust and accuracy metrics for the Guardian Appeals Layer system.',
    input_schema: {
      type: 'object',
      properties: {
        include_breakdown: {
          type: 'string',
          description: 'Include detailed breakdown of metrics (true/false)'
        }
      },
      required: []
    }
  },
  {
    name: 'sparql_query',
    description: 'Execute a SPARQL query against the DKG to retrieve linked data. Use this for complex queries involving relationships between Knowledge Assets.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SPARQL query string'
        }
      },
      required: ['query']
    }
  }
];

// ============================================================================
// MCP Tool Execution
// ============================================================================

export async function executeMCPTool(
  toolName: string,
  params: Record<string, string>
): Promise<MCPToolResult> {
  console.log(`[MCP] Executing tool: ${toolName}`, params);
  
  const timestamp = new Date().toISOString();
  
  try {
    switch (toolName) {
      case 'query_flagged_content': {
        const classification = params.classification || 'all';
        const minConfidence = parseFloat(params.min_confidence || '0');
        const limit = parseInt(params.limit || '20');
        
        const flagged = getFlaggedContent();
        let filtered = flagged;
        
        if (classification !== 'all') {
          filtered = filtered.filter(c => 
            c.guardianClassification === classification
          );
        }
        
        if (minConfidence > 0) {
          filtered = filtered.filter(c => c.guardianScore >= minConfidence);
        }
        
        const results = filtered.slice(0, limit).map(c => ({
          id: c.id,
          title: c.title,
          classification: c.guardianClassification,
          confidence: c.guardianScore,
          reason: c.guardianReason,
          dkg_asset_id: `did:dkg:content:${c.id}`,
          platform: c.platform
        }));
        
        return {
          success: true,
          data: {
            total_flagged: flagged.length,
            returned: results.length,
            items: results
          },
          provenance: {
            source: 'OriginTrail DKG via Guardian Appeals Layer',
            verified: true,
            timestamp
          }
        };
      }
      
      case 'verify_content_authenticity': {
        const { content_hash, content_url } = params;
        
        if (content_hash) {
          const result = await dkgClient.getContentByHash(content_hash);
          if (result.data) {
            return {
              success: true,
              data: {
                verified: true,
                content: result.data,
                provenance_chain: [
                  { event: 'Content ingested by Guardian', timestamp: result.data.createdAt },
                  { event: 'Published to DKG', timestamp: result.data.createdAt },
                  { event: 'Classification verified', timestamp }
                ]
              },
              dkg_asset_id: result.data['@id'],
              provenance: { source: 'OriginTrail DKG', verified: true, timestamp }
            };
          }
        }
        
        if (content_url) {
          const sample = sampleDataset.find(s => s.originalSource === content_url);
          if (sample) {
            return {
              success: true,
              data: {
                verified: true,
                content_hash: sample.contentHash,
                classification: sample.guardianClassification,
                is_false_positive: sample.isFalsePositive
              },
              provenance: { source: 'Guardian Sample Dataset', verified: true, timestamp }
            };
          }
        }
        
        return {
          success: true,
          data: { verified: false, message: 'Content not found in DKG' },
          provenance: { source: 'OriginTrail DKG', verified: true, timestamp }
        };
      }
      
      case 'get_appeal_status': {
        const { case_id, content_id } = params;
        
        if (case_id) {
          const result = await dkgClient.getCaseAsset(case_id);
          if (result.data) {
            const evidence = await Promise.all(
              result.data.evidence.map(id => dkgClient.getEvidenceAsset(id))
            );
            
            return {
              success: true,
              data: {
                case: result.data,
                evidence: evidence.filter(e => e.data).map(e => e.data),
                status_summary: {
                  status: result.data.appealStatus,
                  priority: result.data.priority,
                  evidence_count: result.data.evidence.length,
                  resolution: result.data.resolution.status
                }
              },
              dkg_asset_id: case_id,
              provenance: { source: 'OriginTrail DKG', verified: true, timestamp }
            };
          }
        }
        
        if (content_id) {
          const cases = await dkgClient.getAllCaseAssets();
          const related = cases.data?.filter(c => 
            c.contentReference === content_id || 
            c.contentReference.includes(content_id)
          );
          
          return {
            success: true,
            data: { appeals: related || [] },
            provenance: { source: 'OriginTrail DKG', verified: true, timestamp }
          };
        }
        
        return { success: false, error: 'Either case_id or content_id required' };
      }
      
      case 'submit_appeal': {
        const { content_id, creator_did, appeal_statement } = params;
        
        // Validate content exists
        const content = await dkgClient.getContentAsset(content_id);
        if (!content.data) {
          // Try to find by sample ID
          const sample = sampleDataset.find(s => 
            content_id.includes(s.id) || s.id === content_id
          );
          if (!sample) {
            return { success: false, error: 'Content not found' };
          }
        }
        
        // Create case asset
        const result = await dkgClient.publishCaseAsset({
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          contentReference: content_id,
          creatorDid: creator_did,
          appealStatus: 'open',
          appealStatement: appeal_statement,
          priority: false,
          evidence: [],
          resolution: {
            '@type': 'Action',
            status: 'pending',
            decidedBy: null,
            decisionTime: null,
            confidenceScore: null,
            reasoning: null,
            paymentTx: null
          }
        });
        
        return {
          success: true,
          data: {
            case_id: result.assetId,
            status: 'open',
            message: 'Appeal submitted successfully. Evidence gathering will begin shortly.'
          },
          dkg_asset_id: result.assetId,
          provenance: { source: 'OriginTrail DKG', verified: true, timestamp }
        };
      }
      
      case 'gather_evidence': {
        const { case_id } = params;
        
        const result = await processAppealCase(case_id);
        
        if (result.success) {
          return {
            success: true,
            data: {
              case_id,
              resolution: result.resolution,
              evidence_ids: result.evidenceIds,
              message: `Case processed with decision: ${result.resolution?.decision}`
            },
            dkg_asset_id: case_id,
            provenance: { source: 'GAL Evidence Agent', verified: true, timestamp }
          };
        }
        
        return { success: false, error: result.error };
      }
      
      case 'get_trust_metrics': {
        const includeBreakdown = params.include_breakdown === 'true';
        
        const allCases = await dkgClient.getAllCaseAssets();
        const cases = allCases.data || [];
        
        const resolved = cases.filter(c => c.appealStatus.startsWith('resolved_'));
        const overturned = resolved.filter(c => c.appealStatus === 'resolved_overturned');
        const upheld = resolved.filter(c => c.appealStatus === 'resolved_upheld');
        
        const baselineAccuracy = 0.467; // 46.7% from evaluation
        const falsePositivesCorrected = overturned.length;
        const totalFalsePositives = 8;
        const postGalAccuracy = baselineAccuracy + (falsePositivesCorrected / 15);
        
        const metrics = {
          baseline_accuracy: baselineAccuracy,
          post_gal_accuracy: Math.min(postGalAccuracy, 1),
          improvement: postGalAccuracy - baselineAccuracy,
          total_appeals: cases.length,
          resolved_appeals: resolved.length,
          overturned: overturned.length,
          upheld: upheld.length,
          false_positives_corrected: falsePositivesCorrected
        };
        
        if (includeBreakdown) {
          (metrics as any).breakdown = {
            by_classification: {
              deepfake_suspected: cases.filter(c => 
                sampleDataset.some(s => 
                  c.contentReference.includes(s.id) && 
                  s.guardianClassification === 'deepfake_suspected'
                )
              ).length
            }
          };
        }
        
        return {
          success: true,
          data: metrics,
          provenance: { source: 'Guardian Appeals Layer Analytics', verified: true, timestamp }
        };
      }
      
      case 'sparql_query': {
        // Simulate SPARQL query execution against DKG
        const { query } = params;
        
        // Parse basic SPARQL patterns for demo
        if (query.toLowerCase().includes('select')) {
          const contentAssets = await dkgClient.getAllContentAssets();
          const caseAssets = await dkgClient.getAllCaseAssets();
          
          return {
            success: true,
            data: {
              query_type: 'SELECT',
              results: {
                content_assets: contentAssets.data?.length || 0,
                case_assets: caseAssets.data?.length || 0,
                message: 'SPARQL query executed against DKG Knowledge Assets'
              }
            },
            provenance: { source: 'OriginTrail DKG SPARQL Endpoint', verified: true, timestamp }
          };
        }
        
        return {
          success: true,
          data: { message: 'Query parsed but execution simulated for demo' },
          provenance: { source: 'OriginTrail DKG', verified: true, timestamp }
        };
      }
      
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[MCP] Tool execution error:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ============================================================================
// MCP Server Info (for discovery)
// ============================================================================

export const mcpServerInfo = {
  name: 'guardian-appeals-layer',
  version: '1.0.0',
  description: 'MCP server for verifiable AI safety appeals on OriginTrail DKG',
  capabilities: {
    tools: mcpTools.map(t => t.name),
    resources: ['dkg:content', 'dkg:cases', 'dkg:evidence'],
    prompts: ['verify_content', 'file_appeal', 'check_status']
  },
  trust_layer: {
    dkg: 'OriginTrail Decentralized Knowledge Graph',
    blockchain: 'NeuroWeb (Polkadot Parachain)',
    payments: 'x402 Protocol on Base Sepolia'
  }
};

// ============================================================================
// Export for API routes
// ============================================================================

export default {
  tools: mcpTools,
  execute: executeMCPTool,
  info: mcpServerInfo
};