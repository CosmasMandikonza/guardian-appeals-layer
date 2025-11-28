/**
 * x402 Payment Protocol Implementation
 * 
 * Implements the x402 HTTP Payment Required protocol for fast-track
 * appeal processing. Based on the Coinbase x402 specification.
 * 
 * @see https://github.com/coinbase/x402
 * @see https://www.x402.org/
 * 
 * Flow:
 * 1. Client requests fast-track processing
 * 2. Server responds with 402 + payment requirements
 * 3. Client signs and submits payment
 * 4. Server verifies payment and processes priority
 */

import { nanoid } from 'nanoid';

// ============================================================================
// Types (Based on x402 Specification)
// ============================================================================

export interface PaymentRequirement {
  scheme: 'exact';
  network: 'base-sepolia' | 'base-mainnet';
  maxAmountRequired: string; // Amount in smallest unit (e.g., wei)
  resource: string;          // Resource being paid for
  description: string;
  mimeType: string;
  payTo: string;            // Recipient address
  maxTimeoutSeconds: number;
  asset: string;            // Token contract address
  outputSchema?: object;
}

export interface PaymentRequiredResponse {
  x402Version: 1;
  accepts: PaymentRequirement[];
  error?: string;
}

export interface PaymentPayload {
  x402Version: 1;
  scheme: 'exact';
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

export interface PaymentVerificationResult {
  valid: boolean;
  transactionHash?: string;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const X402_CONFIG = {
  // Base Sepolia USDC contract (testnet)
  USDC_CONTRACT: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  
  // GAL Treasury address (would be real in production)
  TREASURY_ADDRESS: '0x742d35Cc6634C0532925a3b844Bc9e7595f28888',
  
  // Fast-track pricing
  FAST_TRACK_PRICE_USDC: '100000', // 0.10 USDC (6 decimals)
  
  // Timeout
  MAX_TIMEOUT_SECONDS: 300, // 5 minutes
  
  // Network
  NETWORK: 'base-sepolia' as const,
};

// ============================================================================
// Payment Functions
// ============================================================================

/**
 * Generate a 402 Payment Required response
 */
export function generatePaymentRequired(
  caseId: string,
  resourceUrl: string
): PaymentRequiredResponse {
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: X402_CONFIG.NETWORK,
        maxAmountRequired: X402_CONFIG.FAST_TRACK_PRICE_USDC,
        resource: resourceUrl,
        description: `Fast-track appeal processing for case ${caseId}`,
        mimeType: 'application/json',
        payTo: X402_CONFIG.TREASURY_ADDRESS,
        maxTimeoutSeconds: X402_CONFIG.MAX_TIMEOUT_SECONDS,
        asset: X402_CONFIG.USDC_CONTRACT,
        outputSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            caseId: { type: 'string' },
            priority: { type: 'boolean' },
            estimatedProcessingTime: { type: 'string' },
          },
        },
      },
    ],
  };
}

/**
 * Verify a payment payload
 * 
 * In production, this would:
 * 1. Verify the signature
 * 2. Check the transaction on-chain
 * 3. Confirm funds were received
 * 
 * For demo purposes, we simulate verification.
 */
export async function verifyPayment(
  payload: PaymentPayload,
  expectedResource: string
): Promise<PaymentVerificationResult> {
  console.log('[x402] Verifying payment...');
  console.log(`[x402] From: ${payload.payload.authorization.from}`);
  console.log(`[x402] Value: ${payload.payload.authorization.value}`);
  
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Basic validation
  if (payload.x402Version !== 1) {
    return { valid: false, error: 'Invalid x402 version' };
  }
  
  if (payload.scheme !== 'exact') {
    return { valid: false, error: 'Invalid payment scheme' };
  }
  
  // Check amount (simulated)
  const expectedAmount = BigInt(X402_CONFIG.FAST_TRACK_PRICE_USDC);
  const providedAmount = BigInt(payload.payload.authorization.value || '0');
  
  if (providedAmount < expectedAmount) {
    return { valid: false, error: 'Insufficient payment amount' };
  }
  
  // Simulate successful verification
  const transactionHash = `0x${nanoid(64).toLowerCase()}`;
  
  console.log(`[x402] Payment verified! TX: ${transactionHash}`);
  
  return {
    valid: true,
    transactionHash,
  };
}

/**
 * Generate a mock payment payload for demo purposes
 */
export function generateMockPayment(
  fromAddress: string,
  resource: string
): PaymentPayload {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    x402Version: 1,
    scheme: 'exact',
    network: X402_CONFIG.NETWORK,
    payload: {
      signature: `0x${nanoid(128).toLowerCase()}`,
      authorization: {
        from: fromAddress,
        to: X402_CONFIG.TREASURY_ADDRESS,
        value: X402_CONFIG.FAST_TRACK_PRICE_USDC,
        validAfter: String(now),
        validBefore: String(now + X402_CONFIG.MAX_TIMEOUT_SECONDS),
        nonce: nanoid(16),
      },
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse X-PAYMENT header
 */
export function parsePaymentHeader(
  headerValue: string
): PaymentPayload | null {
  try {
    // The header should be base64-encoded JSON
    const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    try {
      // Or it might be plain JSON
      return JSON.parse(headerValue);
    } catch {
      return null;
    }
  }
}

/**
 * Encode payment payload for X-PAYMENT header
 */
export function encodePaymentHeader(payload: PaymentPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Get price in human-readable format
 */
export function getFormattedPrice(): {
  amount: string;
  symbol: string;
  decimals: number;
} {
  return {
    amount: '0.10',
    symbol: 'USDC',
    decimals: 6,
  };
}

export default {
  generatePaymentRequired,
  verifyPayment,
  generateMockPayment,
  parsePaymentHeader,
  encodePaymentHeader,
  getFormattedPrice,
  config: X402_CONFIG,
};
