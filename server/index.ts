import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { setupVite, serveStatic, log } from './vite.js';
import { Mission } from './types/mission.js';
import { MissionSyncService } from './services/mission-sync.js';
import { validateEnvironment } from './environment-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation des variables d'environnement au démarrage
validateEnvironment();

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Initialize services with Cloud SQL support - Force production DB for preview
const isPreviewMode = process.env.PREVIEW_MODE === 'true' || process.env.NODE_ENV === 'production';
const databaseUrl = isPreviewMode 
  ? (process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING || '')
  : (process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING || 'postgresql://localhost:5432/swideal');

// Cloud SQL connection string format: postgresql://user:password@/database?host=/cloudsql/project:region:instance
const isCloudSQL = databaseUrl.includes('/cloudsql/');
if (isCloudSQL) {
  console.log('🔗 Using Cloud SQL connection');
} else {
  console.log('🔗 Using standard PostgreSQL connection');
}

const missionSyncService = new MissionSyncService(databaseUrl);

// Log database configuration for debugging
console.log('🔗 Database configuration:', {
  DATABASE_URL: !!process.env.DATABASE_URL,
  CLOUD_SQL_CONNECTION_STRING: !!process.env.CLOUD_SQL_CONNECTION_STRING,
  NODE_ENV: process.env.NODE_ENV
});

// Création des comptes démo simplifiée (non bloquant)
setTimeout(async () => {
  try {
    console.log('✅ Comptes démo - vérification différée');
  } catch (error) {
    console.warn('⚠️ Comptes démo - vérification échouée');
  }
}, 5000);

// Remove in-memory missions storage - using database only

// Initialize global variables safely
if (!global.projectStandardizations) {
  global.projectStandardizations = new Map();
}
if (!global.aiEnhancementCache) {
  global.aiEnhancementCache = new Map();
}
if (!global.performanceMetrics) {
  global.performanceMetrics = new Map();
}

// Log Gemini AI configuration for debugging
console.log('🔍 Gemini AI Environment Variables:', {
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  PROVIDER: 'gemini-api-only'
});

// Middleware anti-cache pour développement
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// Trust proxy for Replit environment
app.set('trust proxy', true);

// CORS and Replit-specific headers
app.use((req, res, next) => {
  // Special handling for Replit environment
  const isReplit = process.env.REPLIT_DB_URL || process.env.REPLIT_DEV_DOMAIN;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (isReplit) {
    // Allow iframe embedding in Replit
    res.header('X-Frame-Options', 'ALLOWALL');
  } else {
    res.header('X-Frame-Options', 'SAMEORIGIN');
  }

  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'same-origin');
  next();
});

app.use(express.json());

// Import auth routes
import authRoutes from './auth-routes.js';
import missionsRoutes from './routes/missions.js';
import apiRoutes from './api-routes.js';
import aiMonitoringRoutes from './routes/ai-monitoring-routes.js';
import aiRoutes from './routes/ai-routes.js';
import aiSuggestionsRoutes from './routes/ai-suggestions-routes.js';
import aiMissionsRoutes from './routes/ai-missions-routes.js';
import aiOrchestratorRoutes from '../apps/api/src/routes/ai.js';
import feedRoutes from './routes/feed-routes.js';
import favoritesRoutes from './routes/favorites-routes.js';
import missionDemoRoutes from './routes/mission-demo.js';
import aiQuickAnalysisRoutes from './routes/ai-quick-analysis.js';
import aiDiagnosticRoutes from './routes/ai-diagnostic-routes.js';
import aiLearningRoutes from './routes/ai-learning-routes.js';
import teamRoutes from './routes/team-routes.js';

// Import rate limiting middleware
import { aiRateLimit, strictAiRateLimit, monitoringRateLimit } from './middleware/ai-rate-limit.js';

// Mount routes
app.use('/api/missions', missionsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Apply rate limiting to AI routes
app.use('/api/ai/monitoring', monitoringRateLimit, aiMonitoringRoutes);
app.use('/api/ai/suggest-pricing', strictAiRateLimit);  // Endpoint coûteux
app.use('/api/ai/enhance-description', strictAiRateLimit);  // Endpoint coûteux  
app.use('/api/ai/analyze-quality', strictAiRateLimit);  // Endpoint coûteux
app.use('/api/ai/enhance-text', strictAiRateLimit);  // Endpoint coûteux
app.use('/api/ai', aiRateLimit, aiRoutes);  // Rate limiting général pour les autres routes IA
app.use('/api/ai', aiRateLimit, aiSuggestionsRoutes);
app.use('/api/ai/missions', aiRateLimit, aiMissionsRoutes);
app.use('/api-ai-orchestrator', strictAiRateLimit, aiOrchestratorRoutes);  // Orchestrateur IA complexe
app.use('/api', aiRateLimit, aiQuickAnalysisRoutes);  // Analyses IA rapides

// Register AI diagnostic and learning routes
app.use('/api/ai/diagnostic', aiDiagnosticRoutes);
app.use('/api/ai/suggestions', aiSuggestionsRoutes);
app.use('/api/ai/learning', aiLearningRoutes);

app.use('/api', feedRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', missionDemoRoutes);
app.use('/api/team', teamRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'SwipDEAL API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint pour diagnostique - simplified
app.get('/api/debug/missions', (req, res) => {
  res.json({
    debug_info: {
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      status: 'database_unified',
      memory_usage: process.memoryUsage(),
    },
    message: 'Check /api/missions for actual missions data'
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'swideal-api',
    version: '1.0.0',
    node_env: process.env.NODE_ENV
  });
});

// Gemini AI diagnostic endpoint
app.get('/api/ai/gemini-diagnostic', (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  res.json({
    gemini_ai_configured: hasApiKey,
    api_key: hasApiKey ? 'CONFIGURED' : 'MISSING',
    status: hasApiKey ? 'ready' : 'incomplete',
    provider: 'gemini-api-only'
  });
});

// Missions endpoints now handled by server/routes/missions.ts (database-only)

// Mission POST endpoint now handled by server/routes/missions.ts (database-only)

// Mission GET by ID endpoint now handled by server/routes/missions.ts (database-only)

// Start server
const server = createServer(app);

// Force production mode to avoid Vite host blocking issues in Replit
const isProductionLike = process.env.NODE_ENV === 'production' || process.env.PREVIEW_MODE === 'true';
if (isProductionLike) {
  console.log('🔧 Forcing production mode to bypass Vite host restrictions');
  serveStatic(app);
  console.log('✅ Production mode: serving static files');
} else {
  console.log('🛠️ Development mode: using Vite dev server');
  setupVite(app).catch(console.error);
}

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use. Trying to kill existing processes...`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SwipDEAL server running on http://0.0.0.0:${port}`);
  console.log(`📱 Frontend: http://0.0.0.0:${port}`);
  console.log(`🔧 API Health: http://0.0.0.0:${port}/api/health`);
  console.log(`🎯 AI Provider: Gemini API Only`);
});

// Mission sync now handled by database routes

console.log('✅ Advanced AI routes registered - Gemini API Only');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

export default app;