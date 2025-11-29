/**
 * API Routes for Guardian Appeals Layer
 * 
 * Endpoints:
 * - GET  /api/content         - List all flagged content
 * - GET  /api/content/:id     - Get specific content
 * - GET  /api/cases           - List all cases
 * - GET  /api/cases/:id       - Get specific case
 * - POST /api/cases           - Create new appeal
 * - POST /api/cases/:id/fast-track - Request fast-track (x402)
 * - GET  /api/evidence/:id    - Get evidence
 * - GET  /api/metrics         - Get evaluation metrics
 * - POST /api/process         - Trigger agent processing
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { dkgClient, CaseAsset, ContentAsset } from '../dkg/client.js';
import { sampleDataset, getFlaggedContent, calculateBaselineAccuracy } from '../data/sampleDataset.js';
import { processAppealCase, processAllPendingCases } from '../agents/evidenceAgent.js';
import x402 from '../x402/handler.js';
import { nanoid } from 'nanoid';

//Types
interface CreateCaseBody {
  contentId: string;
  creatorDid: string;
  appealStatement: string;
}

interface FastTrackBody {
  paymentPayload?: string;
  walletAddress?: string;
}

// ============================================================================
// Route Registration
// ============================================================================

export async function registerRoutes(app: FastifyInstance) {
  
  // ==================== CONTENT ENDPOINTS ====================
  
  /**
   * GET /api/content - List all flagged content
   */
  app.get('/api/content', async (request, reply) => {
    const flaggedContent = getFlaggedContent();
    const dkgContent = await dkgClient.getAllContentAssets();
    
    const combined = flaggedContent.map(sample => {
      const dkgMatch = dkgContent.data?.find(
        d => d.contentHash === sample.contentHash
      );
      
      return {
        id: sample.id,
        dkgId: dkgMatch?.['@id'] || `did:dkg:content:${sample.id}`,
        contentUrl: sample.contentUrl,
        contentHash: sample.contentHash,
        platform: sample.platform,
        contentType: sample.contentType,
        title: sample.title,
        description: sample.description,
        creatorName: sample.creatorName,
        creatorDid: sample.creatorDid,
        uploadDate: sample.uploadDate,
        duration: sample.duration,
        guardianClassification: sample.guardianClassification,
        guardianScore: sample.guardianScore,
        guardianReason: sample.guardianReason,
        hasOriginalSource: !!sample.originalSource,
      };
    });
    
    return reply.send({
      success: true,
      count: combined.length,
      data: combined,
    });
  });
  
  /**
   * GET /api/content/:id - Get specific content
   */
  app.get('/api/content/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = request.params;
    
    const sample = sampleDataset.find(s => s.id === id);
    if (!sample) {
      return reply.code(404).send({ success: false, error: 'Content not found' });
    }
    
    const dkgId = `did:dkg:content:${id}`;
    const dkgResult = await dkgClient.getContentAsset(dkgId);
    
    return reply.send({
      success: true,
      data: {
        id: sample.id,
        dkgId: dkgResult.data?.['@id'] || dkgId,
        contentUrl: sample.contentUrl,
        contentHash: sample.contentHash,
        platform: sample.platform,
        contentType: sample.contentType,
        title: sample.title,
        description: sample.description,
        creatorName: sample.creatorName,
        creatorDid: sample.creatorDid,
        uploadDate: sample.uploadDate,
        duration: sample.duration,
        guardianClassification: sample.guardianClassification,
        guardianScore: sample.guardianScore,
        guardianReason: sample.guardianReason,
        dkgAsset: dkgResult.data,
      },
    });
  });
  
  // ==================== CASE ENDPOINTS ====================
  
  /**
   * GET /api/cases - List all cases
   */
  app.get('/api/cases', async (request, reply) => {
    const allCases = await dkgClient.getAllCaseAssets();
    const allContent = await dkgClient.getAllContentAssets();
    
    const enriched = await Promise.all(
      (allCases.data || []).map(async (caseAsset) => {
        const contentRef = caseAsset.contentReference;
        const dkgContent = allContent.data?.find(c => c['@id'] === contentRef);
        const sample = dkgContent 
          ? sampleDataset.find(s => s.contentHash === dkgContent.contentHash)
          : null;
        
        return {
          ...caseAsset,
          contentTitle: sample?.title || 'Appeal Case',
          contentType: sample?.contentType || 'video',
          creatorName: sample?.creatorName || caseAsset.creatorDid.split(':').pop(),
        };
      })
    );
    
    enriched.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return reply.send({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  });
  
  /**
   * GET /api/cases/:id - Get specific case with evidence
   */
  app.get('/api/cases/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = request.params;
    const fullId = id.startsWith('did:') ? id : `did:dkg:case:${id}`;
    
    const caseResult = await dkgClient.getCaseAsset(fullId);
    if (!caseResult.data) {
      return reply.code(404).send({ success: false, error: 'Case not found' });
    }
    
    const caseAsset = caseResult.data;
    const evidenceResult = await dkgClient.getEvidenceForCase(fullId);
    const contentId = caseAsset.contentReference.split(':').pop();
    const sample = sampleDataset.find(s => s.id === contentId);
    
    return reply.send({
      success: true,
      data: {
        case: caseAsset,
        evidence: evidenceResult.data || [],
        content: sample ? {
          title: sample.title,
          description: sample.description,
          contentType: sample.contentType,
          platform: sample.platform,
          creatorName: sample.creatorName,
          guardianReason: sample.guardianReason,
        } : null,
      },
    });
  });
  
  /**
   * POST /api/cases - Create new appeal
   */
  app.post('/api/cases', async (
    request: FastifyRequest<{ Body: CreateCaseBody }>,
    reply
  ) => {
    const { contentId, creatorDid, appealStatement } = request.body;
    
    if (!contentId || !creatorDid || !appealStatement) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields: contentId, creatorDid, appealStatement',
      });
    }
    
    const contentReference = contentId.startsWith('did:') 
      ? contentId 
      : `did:dkg:content:${contentId}`;
    
    const sample = sampleDataset.find(s => 
      s.id === contentId || `did:dkg:content:${s.id}` === contentId
    );
    
    if (!sample) {
      return reply.code(404).send({
        success: false,
        error: 'Content not found in system',
      });
    }
    
    const existingCases = await dkgClient.getCasesByCreator(creatorDid);
    const existing = existingCases.data?.find(
      c => c.contentReference === contentReference
    );
    
    if (existing) {
      return reply.code(409).send({
        success: false,
        error: 'Appeal already exists for this content',
        existingCaseId: existing['@id'],
      });
    }
    
    await dkgClient.publishContentAsset({
      '@context': 'https://schema.org',
      '@type': 'MediaObject',
      contentUrl: sample.contentUrl,
      contentHash: sample.contentHash,
      platform: sample.platform,
      guardianClassification: sample.guardianClassification,
      guardianScore: sample.guardianScore,
      guardianVersion: '2.0.0',
      metadata: {
        originalCreator: sample.creatorName,
        uploadDate: sample.uploadDate,
        contentType: sample.contentType,
        duration: sample.duration,
      },
    });
    
    const result = await dkgClient.publishCaseAsset({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      contentReference,
      creatorDid,
      appealStatus: 'open',
      appealStatement,
      priority: false,
      evidence: [],
      resolution: {
        '@type': 'Action',
        status: 'pending',
        decidedBy: null,
        decisionTime: null,
        confidenceScore: null,
        reasoning: null,
        paymentTx: null,
      },
    });
    
    if (!result.success) {
      return reply.code(500).send({
        success: false,
        error: 'Failed to create case on DKG',
      });
    }
    
    setTimeout(() => {
      processAppealCase(result.assetId).catch(console.error);
    }, 2000);
    
    return reply.code(201).send({
      success: true,
      caseId: result.assetId,
      transactionHash: result.transactionHash,
      message: 'Appeal submitted successfully. Processing will begin shortly.',
    });
  });
  
  /**
   * POST /api/cases/:id/fast-track - Request fast-track processing via x402
   */
  app.post('/api/cases/:id/fast-track', async (
    request: FastifyRequest<{ 
      Params: { id: string };
      Body: FastTrackBody;
      Headers: { 'x-payment'?: string };
    }>,
    reply
  ) => {
    const { id } = request.params;
    const fullId = id.startsWith('did:') ? id : `did:dkg:case:${id}`;
    
    const caseResult = await dkgClient.getCaseAsset(fullId);
    if (!caseResult.data) {
      return reply.code(404).send({ success: false, error: 'Case not found' });
    }
    
    const caseAsset = caseResult.data;
    
    if (caseAsset.priority) {
      return reply.code(400).send({
        success: false,
        error: 'Case is already in fast-track queue',
      });
    }
    
    if (caseAsset.appealStatus.startsWith('resolved_')) {
      return reply.code(400).send({
        success: false,
        error: 'Case is already resolved',
      });
    }
    
    const paymentHeader = request.headers['x-payment'];
    const paymentBody = request.body?.paymentPayload;
    
    if (!paymentHeader && !paymentBody && !request.body?.walletAddress) {
      const paymentRequired = x402.generatePaymentRequired(
        fullId,
        `/api/cases/${id}/fast-track`
      );
      
      return reply
        .code(402)
        .header('Content-Type', 'application/json')
        .send(paymentRequired);
    }
    
    let verificationResult;
    
    if (request.body?.walletAddress) {
      const mockPayment = x402.generateMockPayment(
        request.body.walletAddress,
        `/api/cases/${id}/fast-track`
      );
      verificationResult = await x402.verifyPayment(mockPayment, fullId);
    } else {
      const paymentData = paymentHeader 
        ? x402.parsePaymentHeader(paymentHeader)
        : x402.parsePaymentHeader(paymentBody!);
      
      if (!paymentData) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid payment payload',
        });
      }
      
      verificationResult = await x402.verifyPayment(paymentData, fullId);
    }
    
    if (!verificationResult.valid) {
      return reply.code(402).send({
        success: false,
        error: verificationResult.error || 'Payment verification failed',
      });
    }
    
    await dkgClient.updateCaseAsset(fullId, {
      priority: true,
      resolution: {
        ...caseAsset.resolution,
        paymentTx: verificationResult.transactionHash || null,
      },
    });
    
    setTimeout(() => {
      processAppealCase(fullId).catch(console.error);
    }, 500);
    
    return reply.send({
      success: true,
      caseId: fullId,
      priority: true,
      transactionHash: verificationResult.transactionHash,
      estimatedProcessingTime: '< 30 seconds',
      message: 'Fast-track activated! Your case will be processed with priority.',
    });
  });
  
  // ==================== EVIDENCE ENDPOINTS ====================
  
  /**
   * GET /api/evidence/:id - Get specific evidence
   */
  app.get('/api/evidence/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply
  ) => {
    const { id } = request.params;
    const fullId = id.startsWith('did:') ? id : `did:dkg:evidence:${id}`;
    
    const result = await dkgClient.getEvidenceAsset(fullId);
    
    if (!result.data) {
      return reply.code(404).send({ success: false, error: 'Evidence not found' });
    }
    
    return reply.send({
      success: true,
      data: result.data,
    });
  });
  
  // ==================== METRICS ENDPOINTS ====================
  
  /**
   * GET /api/metrics - Get evaluation metrics
   */
  app.get('/api/metrics', async (request, reply) => {
    const baseline = calculateBaselineAccuracy();
    const allCases = await dkgClient.getAllCaseAssets();
    const cases = allCases.data || [];
    
    const resolved = cases.filter(c => c.appealStatus.startsWith('resolved_'));
    const overturned = cases.filter(c => c.appealStatus === 'resolved_overturned');
    const upheld = cases.filter(c => c.appealStatus === 'resolved_upheld');
    const pending = cases.filter(c => !c.appealStatus.startsWith('resolved_'));
    const priority = cases.filter(c => c.priority);
    
    const correctedFalsePositives = overturned.length;
    const postGalAccuracy = baseline.total > 0
      ? (baseline.truePositives + baseline.trueNegatives + correctedFalsePositives) / baseline.total
      : baseline.accuracy;
    
    return reply.send({
      success: true,
      data: {
        dataset: {
          total: baseline.total,
          flagged: baseline.truePositives + baseline.falsePositives,
          safe: baseline.trueNegatives,
        },
        baseline: {
          accuracy: baseline.accuracy,
          truePositives: baseline.truePositives,
          falsePositives: baseline.falsePositives,
          trueNegatives: baseline.trueNegatives,
        },
        gal: {
          totalAppeals: cases.length,
          resolved: resolved.length,
          overturned: overturned.length,
          upheld: upheld.length,
          pending: pending.length,
          priority: priority.length,
          postGalAccuracy,
          improvement: postGalAccuracy - baseline.accuracy,
        },
        summary: {
          baselineAccuracyPercent: `${(baseline.accuracy * 100).toFixed(1)}%`,
          postGalAccuracyPercent: `${(postGalAccuracy * 100).toFixed(1)}%`,
          improvementPercent: `${((postGalAccuracy - baseline.accuracy) * 100).toFixed(1)}%`,
          falsePositivesCorrected: correctedFalsePositives,
        },
      },
    });
  });
  
  // ==================== AGENT ENDPOINTS ====================
  
  /**
   * POST /api/process - Trigger agent processing
   */
  app.post('/api/process', async (request, reply) => {
    const result = await processAllPendingCases();
    
    return reply.send({
      success: true,
      data: result,
    });
  });
  
  /**
   * POST /api/process/:id - Process specific case
   */
  app.post('/api/process/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply
  ) => {
    const { id } = request.params;
    const fullId = id.startsWith('did:') ? id : `did:dkg:case:${id}`;
    
    const result = await processAppealCase(fullId);
    
    if (!result.success) {
      return reply.code(400).send({
        success: false,
        error: result.error,
      });
    }
    
    return reply.send({
      success: true,
      data: {
        caseId: fullId,
        resolution: result.resolution,
        evidenceIds: result.evidenceIds,
      },
    });
  });
  
  // ==================== DEMO SEED ENDPOINT ====================
  
  /**
   * POST /api/demo/seed - Seed demo data with processed appeals
   */
  app.post('/api/demo/seed', async (request, reply) => {
    const results = await seedDemoAppeals();
    
    return reply.send({
      success: true,
      message: `Seeded ${results.length} demo appeals`,
      data: results,
    });
  });
  
  // ==================== x402 INFO ENDPOINT ====================
  
  /**
   * GET /api/x402/info - Get x402 pricing info
   */
  app.get('/api/x402/info', async (request, reply) => {
    const price = x402.getFormattedPrice();
    
    return reply.send({
      success: true,
      data: {
        price,
        network: x402.config.NETWORK,
        asset: x402.config.USDC_CONTRACT,
        treasury: x402.config.TREASURY_ADDRESS,
        description: 'Fast-track appeal processing via x402 micropayment',
      },
    });
  });
  
  // ==================== MCP ENDPOINTS ====================
  
  /**
   * GET /api/mcp/info - Get MCP server info and available tools
   */
  app.get('/api/mcp/info', async (request, reply) => {
    const mcp = await import('../mcp/server.js');
    return reply.send({
      success: true,
      data: mcp.mcpServerInfo,
    });
  });
  
  /**
   * GET /api/mcp/tools - List available MCP tools
   */
  app.get('/api/mcp/tools', async (request, reply) => {
    const mcp = await import('../mcp/server.js');
    return reply.send({
      success: true,
      data: mcp.mcpTools,
    });
  });
  
  /**
   * POST /api/mcp/execute - Execute an MCP tool
   */
  app.post('/api/mcp/execute', async (request, reply) => {
    const { tool, params } = request.body as { tool: string; params: Record<string, string> };
    
    if (!tool) {
      return reply.status(400).send({
        success: false,
        error: 'Tool name required',
      });
    }
    
    const mcp = await import('../mcp/server.js');
    const result = await mcp.executeMCPTool(tool, params || {});
    
    return reply.send(result);
  });
  
  // ==================== HEALTH CHECK ====================
  
  /**
   * GET /api/health - Health check
   */
  app.get('/api/health', async (request, reply) => {
    return reply.send({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      layers: {
        agent: 'Evidence Resolution Agent v1.0',
        knowledge: 'OriginTrail DKG (NeuroWeb)',
        trust: 'x402 Payments (Base Sepolia)'
      }
    });
  });
}

// ============================================================================
// Exported seed function for auto-seeding on startup
// ============================================================================

export async function seedDemoAppeals() {
  const falsePositives = sampleDataset.filter(s => s.isFalsePositive && s.guardianClassification !== 'safe');
  const results = [];
  
  for (const sample of falsePositives) {
    const allContent = await dkgClient.getAllContentAssets();
    const contentMatch = allContent.data?.find(c => c.contentHash === sample.contentHash);
    
    if (!contentMatch) continue;
    
    const caseResult = await dkgClient.publishCaseAsset({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      contentReference: contentMatch['@id'],
      creatorDid: sample.creatorDid,
      appealStatus: 'open',
      appealStatement: `This content was incorrectly flagged as ${sample.guardianClassification}. ${sample.verificationNotes || 'I am the original creator.'}`,
      priority: Math.random() > 0.5,
      evidence: [],
      resolution: {
        '@type': 'Action',
        status: 'pending',
        decidedBy: null,
        decisionTime: null,
        confidenceScore: null,
        reasoning: null,
        paymentTx: null,
      },
    });

    const processResult = await processAppealCase(caseResult.assetId);
    results.push({
      sampleId: sample.id,
      title: sample.title,
      caseId: caseResult.assetId,
      processed: processResult.success,
      decision: processResult.resolution?.decision || 'pending',
    });
  }
  
  console.log(`[Seed] Seeded ${results.length} demo appeals`);
  return results;
}

export default registerRoutes;
