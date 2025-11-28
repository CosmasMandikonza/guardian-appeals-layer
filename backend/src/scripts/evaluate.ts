#!/usr/bin/env tsx
/**
 * GAL Evaluation Script
 * 
 * This script demonstrates the end-to-end flow of the Guardian Appeals Layer
 * and calculates accuracy metrics before and after GAL intervention.
 * 
 * Usage: npx tsx src/scripts/evaluate.ts
 */

import { dkgClient } from '../dkg/client.js';
import { sampleDataset, getFlaggedContent, getFalsePositives, calculateBaselineAccuracy } from '../data/sampleDataset.js';
import { ingestAllSampleData } from '../agents/guardianIngestAgent.js';
import { processAppealCase } from '../agents/evidenceAgent.js';

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║          Guardian Appeals Layer - Evaluation Script              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  // Step 1: Calculate baseline accuracy
  console.log('📊 STEP 1: Calculating Baseline Accuracy');
  console.log('─'.repeat(60));
  
  const baseline = calculateBaselineAccuracy();
  
  console.log(`Total content items: ${baseline.total}`);
  console.log(`Flagged by Guardian: ${baseline.truePositives + baseline.falsePositives}`);
  console.log(`  ✓ True Positives (correctly flagged): ${baseline.truePositives}`);
  console.log(`  ✗ False Positives (incorrectly flagged): ${baseline.falsePositives}`);
  console.log(`Not flagged: ${baseline.trueNegatives}`);
  console.log(`\n🎯 Baseline Accuracy: ${(baseline.accuracy * 100).toFixed(1)}%`);
  console.log('\n');
  
  // Step 2: Ingest content into DKG
  console.log('📥 STEP 2: Ingesting Content into DKG');
  console.log('─'.repeat(60));
  
  await ingestAllSampleData();
  console.log('\n');
  
  // Step 3: File appeals for all false positives
  console.log('⚖️  STEP 3: Filing Appeals for False Positives');
  console.log('─'.repeat(60));
  
  const falsePositives = getFalsePositives();
  const caseIds: string[] = [];
  
  for (const fp of falsePositives) {
    const contentId = `did:dkg:content:${fp.id}`;
    
    const result = await dkgClient.publishCaseAsset({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      contentReference: contentId,
      creatorDid: fp.creatorDid,
      appealStatus: 'open',
      appealStatement: `This content was incorrectly flagged as ${fp.guardianClassification}. ${fp.verificationNotes}`,
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
    
    if (result.success) {
      caseIds.push(result.assetId);
      console.log(`📝 Filed appeal for "${fp.title}" → ${result.assetId}`);
    }
  }
  
  console.log(`\nTotal appeals filed: ${caseIds.length}`);
  console.log('\n');
  
  // Step 4: Process all appeals
  console.log('🔍 STEP 4: Processing Appeals (Evidence Gathering + Resolution)');
  console.log('─'.repeat(60));
  
  let overturned = 0;
  let upheld = 0;
  
  for (const caseId of caseIds) {
    console.log(`\nProcessing: ${caseId}`);
    
    const result = await processAppealCase(caseId);
    
    if (result.success) {
      const caseResult = await dkgClient.getCaseAsset(caseId);
      const status = caseResult.data?.appealStatus;
      
      if (status === 'resolved_overturned') {
        overturned++;
        console.log(`  ✅ OVERTURNED - Evidence supports creator`);
      } else {
        upheld++;
        console.log(`  ❌ UPHELD - Guardian decision stands`);
      }
      
      console.log(`  📎 Evidence collected: ${result.evidenceIds?.length || 0} items`);
    } else {
      console.log(`  ⚠️  Processing failed: ${result.error}`);
    }
  }
  
  console.log('\n');
  
  // Step 5: Calculate post-GAL accuracy
  console.log('📈 STEP 5: Calculating Post-GAL Accuracy');
  console.log('─'.repeat(60));
  
  // Post-GAL: Overturned cases represent corrected false positives
  const correctedFalsePositives = overturned;
  const remainingFalsePositives = baseline.falsePositives - correctedFalsePositives;
  
  // New accuracy calculation
  // Correct decisions = True Positives + True Negatives + Corrected False Positives
  const correctDecisions = baseline.truePositives + baseline.trueNegatives + correctedFalsePositives;
  const postGalAccuracy = correctDecisions / baseline.total;
  
  console.log(`Appeals processed: ${caseIds.length}`);
  console.log(`  ✓ Overturned (false positives corrected): ${overturned}`);
  console.log(`  ✗ Upheld (false positives remaining): ${upheld}`);
  console.log(`\n🎯 Post-GAL Accuracy: ${(postGalAccuracy * 100).toFixed(1)}%`);
  console.log(`📈 Improvement: +${((postGalAccuracy - baseline.accuracy) * 100).toFixed(1)}%`);
  console.log('\n');
  
  // Final Summary
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         FINAL SUMMARY                            ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Baseline Accuracy (Guardian Only):     ${(baseline.accuracy * 100).toFixed(1).padStart(5)}%                 ║`);
  console.log(`║  Post-GAL Accuracy (With Appeals):      ${(postGalAccuracy * 100).toFixed(1).padStart(5)}%                 ║`);
  console.log(`║  Accuracy Improvement:                 +${((postGalAccuracy - baseline.accuracy) * 100).toFixed(1).padStart(5)}%                 ║`);
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total False Positives (Before):           ${baseline.falsePositives.toString().padStart(2)}                    ║`);
  console.log(`║  False Positives Corrected:                ${correctedFalsePositives.toString().padStart(2)}                    ║`);
  console.log(`║  False Positives Remaining:                ${remainingFalsePositives.toString().padStart(2)}                    ║`);
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  Knowledge Assets Published to DKG:                              ║');
  console.log(`║    - ContentAssets:                        ${sampleDataset.length.toString().padStart(2)}                    ║`);
  console.log(`║    - CaseAssets:                           ${caseIds.length.toString().padStart(2)}                    ║`);
  console.log(`║    - EvidenceAssets:                       ${(caseIds.length * 4).toString().padStart(2)}                    ║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  // Verification
  if (postGalAccuracy > baseline.accuracy) {
    console.log('✅ SUCCESS: GAL improved content moderation accuracy!');
    console.log('   The appeals system successfully identified and corrected');
    console.log('   false positives, demonstrating the value of human appeal');
    console.log('   mechanisms backed by verifiable knowledge graphs.');
  } else {
    console.log('⚠️  Note: No improvement detected in this run.');
    console.log('   This could happen if all false positives were correctly');
    console.log('   identified by Guardian (unlikely) or if evidence gathering');
    console.log('   needs tuning.');
  }
  
  console.log('\n');
}

main().catch(console.error);
