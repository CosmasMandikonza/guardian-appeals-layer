/**
 * Sample Dataset for GAL Demo
 * 
 * This dataset simulates Guardian AI moderation flags on content.
 * Some entries are intentional FALSE POSITIVES to demonstrate the appeals system.
 * 
 * Ground truth is provided for evaluation metrics.
 */

export interface SampleContent {
  id: string;
  contentUrl: string;
  contentHash: string;
  platform: string;
  contentType: 'video' | 'image' | 'text';
  title: string;
  description: string;
  creatorName: string;
  creatorDid: string;
  uploadDate: string;
  duration?: number; // seconds, for video
  
  // Guardian AI assessment
  guardianClassification: 'deepfake_suspected' | 'harmful_content' | 'copyright_violation' | 'misinformation' | 'safe';
  guardianScore: number; // 0-1 confidence
  guardianReason: string;
  
  // Ground truth for evaluation
  actuallyHarmful: boolean;
  isFalsePositive: boolean;
  
  // Additional context for evidence agent
  originalSource?: string;
  verificationNotes?: string;
}

export const sampleDataset: SampleContent[] = [
  // ============== TRUE POSITIVES (Correctly flagged) ==============
  {
    id: 'cnt_001',
    contentUrl: 'https://example-platform.com/videos/politician_speech_altered',
    contentHash: 'QmXyz123abc456def789ghi012jkl345mno678pqr',
    platform: 'ExampleTube',
    contentType: 'video',
    title: 'Breaking: Senator Says Something Shocking',
    description: 'Viral clip of senator making controversial statement',
    creatorName: 'NewsNow247',
    creatorDid: 'did:dkg:creator:newsnow247',
    uploadDate: '2025-11-15T10:30:00Z',
    duration: 45,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.94,
    guardianReason: 'Facial artifacts detected, audio-visual synchronization anomalies',
    actuallyHarmful: true,
    isFalsePositive: false,
    verificationNotes: 'Confirmed deepfake by multiple fact-checkers'
  },
  {
    id: 'cnt_002',
    contentUrl: 'https://example-platform.com/images/celebrity_scandal',
    contentHash: 'QmAbc789xyz123def456ghi012jkl345mno678',
    platform: 'ImageShare',
    contentType: 'image',
    title: 'Celebrity Caught in Compromising Position',
    description: 'Leaked photo allegedly showing famous actor',
    creatorName: 'GossipKing',
    creatorDid: 'did:dkg:creator:gossipking',
    uploadDate: '2025-11-18T14:22:00Z',
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.89,
    guardianReason: 'GAN generation artifacts, inconsistent lighting',
    actuallyHarmful: true,
    isFalsePositive: false,
    verificationNotes: 'AI-generated image, not real'
  },
  {
    id: 'cnt_003',
    contentUrl: 'https://example-platform.com/posts/miracle_cure',
    contentHash: 'QmDef456abc789xyz123ghi012jkl345mno678',
    platform: 'HealthForum',
    contentType: 'text',
    title: 'Doctors Dont Want You to Know This Cure',
    description: 'Natural remedy that cures all diseases',
    creatorName: 'NaturalHealth',
    creatorDid: 'did:dkg:creator:naturalhealth',
    uploadDate: '2025-11-20T08:15:00Z',
    guardianClassification: 'misinformation',
    guardianScore: 0.91,
    guardianReason: 'Medical misinformation, unverified health claims',
    actuallyHarmful: true,
    isFalsePositive: false,
    verificationNotes: 'Dangerous health misinformation'
  },
  
  // ============== FALSE POSITIVES (Wrongly flagged - should be appealed) ==============
  {
    id: 'cnt_004',
    contentUrl: 'https://example-platform.com/videos/comedy_sketch_impressions',
    contentHash: 'QmGhi012abc789xyz123def456jkl345mno678',
    platform: 'ExampleTube',
    contentType: 'video',
    title: 'Celebrity Impressions Comedy Show',
    description: 'Stand-up comedian doing celebrity impressions live on stage',
    creatorName: 'ComedianJake',
    creatorDid: 'did:dkg:creator:comedianjake',
    uploadDate: '2025-11-10T20:00:00Z',
    duration: 420,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.72,
    guardianReason: 'Face morphing patterns detected',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://comedy-club.com/shows/jake-impressions-nov10',
    verificationNotes: 'Legitimate comedy performance, impressions are not deepfakes'
  },
  {
    id: 'cnt_005',
    contentUrl: 'https://example-platform.com/videos/documentary_historical',
    contentHash: 'QmJkl345abc789xyz123def456ghi012mno678',
    platform: 'DocuStream',
    contentType: 'video',
    title: 'WWII Colorized: The Battle of Normandy',
    description: 'AI-enhanced colorization of historical D-Day footage',
    creatorName: 'HistoryChannel',
    creatorDid: 'did:dkg:creator:historychannel',
    uploadDate: '2025-11-05T12:00:00Z',
    duration: 2700,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.81,
    guardianReason: 'AI manipulation detected in visual content',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://historychannel.com/documentaries/wwii-colorized',
    verificationNotes: 'Educational AI colorization, clearly labeled, legitimate use'
  },
  {
    id: 'cnt_006',
    contentUrl: 'https://example-platform.com/images/art_digital_portrait',
    contentHash: 'QmMno678abc789xyz123def456ghi012jkl345',
    platform: 'ArtGallery',
    contentType: 'image',
    title: 'Digital Portrait: The Future President',
    description: 'Speculative digital art imagining future political scenarios',
    creatorName: 'DigitalArtist',
    creatorDid: 'did:dkg:creator:digitalartist',
    uploadDate: '2025-11-12T16:45:00Z',
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.77,
    guardianReason: 'AI-generated face detected',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://artgallery.com/artist/digitalartist/future-president',
    verificationNotes: 'Clearly labeled as speculative art, not misrepresented'
  },
  {
    id: 'cnt_007',
    contentUrl: 'https://example-platform.com/videos/music_video_effects',
    contentHash: 'QmPqr901abc789xyz123def456ghi012jkl345',
    platform: 'MusicVids',
    contentType: 'video',
    title: 'Synthwave Dreams - Official Music Video',
    description: 'Music video with heavy visual effects and face transformations',
    creatorName: 'SynthwaveBand',
    creatorDid: 'did:dkg:creator:synthwaveband',
    uploadDate: '2025-11-08T18:30:00Z',
    duration: 240,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.68,
    guardianReason: 'Face manipulation effects detected',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://synthwaveband.com/videos/dreams',
    verificationNotes: 'Artistic visual effects in music video, standard practice'
  },
  {
    id: 'cnt_008',
    contentUrl: 'https://example-platform.com/videos/livestream_archive',
    contentHash: 'QmStu234abc789xyz123def456ghi012jkl345',
    platform: 'StreamLive',
    contentType: 'video',
    title: 'Gaming Marathon - 24 Hour Stream Archive',
    description: 'Full archive of my charity gaming marathon',
    creatorName: 'GamerSarah',
    creatorDid: 'did:dkg:creator:gamersarah',
    uploadDate: '2025-11-22T06:00:00Z',
    duration: 86400,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.65,
    guardianReason: 'Facial inconsistencies detected across video segments',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://streamlive.com/gamersarah/marathon-nov21',
    verificationNotes: 'Compression artifacts and lighting changes over 24hrs triggered false positive'
  },
  {
    id: 'cnt_009',
    contentUrl: 'https://example-platform.com/videos/vfx_tutorial',
    contentHash: 'QmVwx567abc789xyz123def456ghi012jkl345',
    platform: 'LearnVFX',
    contentType: 'video',
    title: 'Face Swap Tutorial for Filmmakers',
    description: 'Educational tutorial on VFX face replacement techniques',
    creatorName: 'VFXMaster',
    creatorDid: 'did:dkg:creator:vfxmaster',
    uploadDate: '2025-11-19T09:00:00Z',
    duration: 1800,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.95,
    guardianReason: 'Multiple deepfake examples and techniques demonstrated',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://learnvfx.com/courses/face-replacement',
    verificationNotes: 'Educational content about VFX, not malicious deepfakes'
  },
  {
    id: 'cnt_010',
    contentUrl: 'https://example-platform.com/posts/satire_article',
    contentHash: 'QmYza890abc789xyz123def456ghi012jkl345',
    platform: 'SatireNews',
    contentType: 'text',
    title: 'CEO Announces Company Will Pay Employees in Hugs',
    description: 'Satirical article about corporate culture',
    creatorName: 'TheOnionClone',
    creatorDid: 'did:dkg:creator:theonionclone',
    uploadDate: '2025-11-21T11:00:00Z',
    guardianClassification: 'misinformation',
    guardianScore: 0.58,
    guardianReason: 'Potentially false business news',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://satirenews.com/articles/hugs-salary',
    verificationNotes: 'Clearly labeled satire publication'
  },
  {
    id: 'cnt_011',
    contentUrl: 'https://example-platform.com/videos/twins_prank',
    contentHash: 'QmBcd123abc789xyz123def456ghi012jkl345',
    platform: 'PrankTV',
    contentType: 'video',
    title: 'Identical Twins Swap Places for a Week',
    description: 'Reality show where identical twins switch lives',
    creatorName: 'TwinPranks',
    creatorDid: 'did:dkg:creator:twinpranks',
    uploadDate: '2025-11-17T15:00:00Z',
    duration: 1200,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.71,
    guardianReason: 'Same face detected in different contexts',
    actuallyHarmful: false,
    isFalsePositive: true,
    originalSource: 'https://pranktv.com/shows/twin-swap',
    verificationNotes: 'Actual identical twins, not deepfakes'
  },
  
  // ============== MORE TRUE POSITIVES ==============
  {
    id: 'cnt_012',
    contentUrl: 'https://example-platform.com/videos/fake_emergency',
    contentHash: 'QmEfg456abc789xyz123def456ghi012jkl345',
    platform: 'NewsAlert',
    contentType: 'video',
    title: 'URGENT: President Declares Martial Law',
    description: 'Breaking news about national emergency',
    creatorName: 'FakeNews',
    creatorDid: 'did:dkg:creator:fakenews',
    uploadDate: '2025-11-23T02:00:00Z',
    duration: 60,
    guardianClassification: 'deepfake_suspected',
    guardianScore: 0.97,
    guardianReason: 'Synthetic speech patterns, facial manipulation confirmed',
    actuallyHarmful: true,
    isFalsePositive: false,
    verificationNotes: 'Malicious deepfake designed to cause panic'
  },
  {
    id: 'cnt_013',
    contentUrl: 'https://example-platform.com/images/fake_receipt',
    contentHash: 'QmHij789abc789xyz123def456ghi012jkl345',
    platform: 'ReviewSite',
    contentType: 'image',
    title: 'Proof of Purchase - Defective Product',
    description: 'Receipt showing purchase of defective item',
    creatorName: 'ScamReviewer',
    creatorDid: 'did:dkg:creator:scamreviewer',
    uploadDate: '2025-11-24T10:00:00Z',
    guardianClassification: 'harmful_content',
    guardianScore: 0.86,
    guardianReason: 'Digitally altered document detected',
    actuallyHarmful: true,
    isFalsePositive: false,
    verificationNotes: 'Fabricated receipt for fraud scheme'
  },
  
  // ============== SAFE CONTENT (Not flagged) ==============
  {
    id: 'cnt_014',
    contentUrl: 'https://example-platform.com/videos/cooking_tutorial',
    contentHash: 'QmKlm012abc789xyz123def456ghi012jkl345',
    platform: 'CookingChannel',
    contentType: 'video',
    title: 'How to Make Perfect Pasta Carbonara',
    description: 'Step-by-step cooking tutorial',
    creatorName: 'ChefMaria',
    creatorDid: 'did:dkg:creator:chefmaria',
    uploadDate: '2025-11-25T14:00:00Z',
    duration: 900,
    guardianClassification: 'safe',
    guardianScore: 0.02,
    guardianReason: 'No harmful content detected',
    actuallyHarmful: false,
    isFalsePositive: false,
  },
  {
    id: 'cnt_015',
    contentUrl: 'https://example-platform.com/videos/pet_compilation',
    contentHash: 'QmNop345abc789xyz123def456ghi012jkl345',
    platform: 'PetTube',
    contentType: 'video',
    title: 'Cutest Cat Moments of 2025',
    description: 'Compilation of adorable cat videos',
    creatorName: 'CatLover',
    creatorDid: 'did:dkg:creator:catlover',
    uploadDate: '2025-11-26T09:00:00Z',
    duration: 600,
    guardianClassification: 'safe',
    guardianScore: 0.01,
    guardianReason: 'No harmful content detected',
    actuallyHarmful: false,
    isFalsePositive: false,
  },
];

// Helper function to get flagged content only
export function getFlaggedContent(): SampleContent[] {
  return sampleDataset.filter(
    c => c.guardianClassification !== 'safe'
  );
}

// Helper function to get false positives only
export function getFalsePositives(): SampleContent[] {
  return sampleDataset.filter(c => c.isFalsePositive);
}

// Helper function to calculate baseline accuracy
export function calculateBaselineAccuracy(): {
  total: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  accuracy: number;
} {
  const flagged = sampleDataset.filter(c => c.guardianClassification !== 'safe');
  const notFlagged = sampleDataset.filter(c => c.guardianClassification === 'safe');
  
  const truePositives = flagged.filter(c => c.actuallyHarmful).length;
  const falsePositives = flagged.filter(c => !c.actuallyHarmful).length;
  const trueNegatives = notFlagged.filter(c => !c.actuallyHarmful).length;
  const falseNegatives = notFlagged.filter(c => c.actuallyHarmful).length;
  
  const total = sampleDataset.length;
  const accuracy = (truePositives + trueNegatives) / total;
  
  return {
    total,
    truePositives,
    falsePositives,
    trueNegatives,
    accuracy,
  };
}

export default sampleDataset;
