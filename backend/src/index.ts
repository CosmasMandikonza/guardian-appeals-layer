/**
 * Guardian Appeals Layer - Backend Server
 * 
 * A verifiable appeals system for AI safety decisions
 * built on OriginTrail DKG × Polkadot × Umanitek Guardian
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes, seedDemoAppeals } from './routes/api.js';
import { ingestAllSampleData } from './agents/guardianIngestAgent.js';

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Create Fastify instance
const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register CORS
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register routes
await registerRoutes(app);

// Startup banner
function printBanner() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║     ██████╗  █████╗ ██╗         Guardian Appeals Layer                     ║
║    ██╔════╝ ██╔══██╗██║         ═══════════════════════                    ║
║    ██║  ███╗███████║██║         Verifiable Appeals for AI Safety           ║
║    ██║   ██║██╔══██║██║                                                    ║
║    ╚██████╔╝██║  ██║███████╗    Built on OriginTrail DKG × Polkadot        ║
║     ╚═════╝ ╚═╝  ╚═╝╚══════╝    × Umanitek Guardian                        ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║  DKG Hackathon 2025 - Scaling Trust in the Age of AI                       ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);
}

// Start server
async function start() {
  try {
    printBanner();
    
    // Initialize sample data
    console.log('\n[Server] Initializing Guardian ingest...');
    await ingestAllSampleData();
    
    // Auto-seed demo appeals for hackathon
    console.log('[Server] Auto-seeding demo appeals...');
    await seedDemoAppeals();
    console.log('[Server] Demo data ready!');
    
    // Start listening
    await app.listen({ port: PORT, host: HOST });
    
    console.log(`\n[Server] 🚀 GAL Backend running at http://localhost:${PORT}`);
    console.log(`[Server] 📊 API Documentation: http://localhost:${PORT}/api/health`);
    console.log(`[Server] 📝 Flagged Content: http://localhost:${PORT}/api/content`);
    console.log(`[Server] 📈 Metrics: http://localhost:${PORT}/api/metrics`);
    console.log('\n');
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
