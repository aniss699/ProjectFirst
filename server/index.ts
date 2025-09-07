import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { setupVite, serveStatic, log } from './vite.js';
import { Mission } from './types/mission.js';
import { MissionSyncService } from './services/mission-sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Initialize services
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/swideal';
const missionSyncService = new MissionSyncService(databaseUrl);

// Stockage temporaire des missions
const missions: Mission[] = [
  {
    id: "mission1",
    title: "Développement d'une application mobile de e-commerce",
    description: "Je recherche un développeur expérimenté pour créer une application mobile complète de vente en ligne avec système de paiement intégré.",
    category: "developpement",
    budget: "5000",
    location: "Paris, France",
    clientId: "client1",
    clientName: "Marie Dubois",
    status: "open",
    createdAt: new Date("2024-01-15").toISOString(),
    bids: []
  }
];

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
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY
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
import aiDiagnosticRoutes from './routes/ai-diagnostic-routes.js'; // Import AI diagnostic routes

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

// Register AI diagnostic routes
app.use('/api/ai', aiRateLimit, aiDiagnosticRoutes);

app.use('/api', feedRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', missionDemoRoutes);

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
    status: hasApiKey ? 'ready' : 'incomplete'
  });
});

// Mission endpoints
app.get('/api/missions', (req, res) => {
  res.json(missions);
});

app.post('/api/missions', async (req, res) => {
  const { title, description, category, budget, location, clientId, clientName } = req.body;

  if (!title || !description || !category || !budget || !clientId || !clientName) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const newMission: Mission = {
    id: `mission_${Date.now()}`,
    title,
    description,
    category,
    budget,
    location: location || 'Non spécifié',
    clientId,
    clientName,
    status: 'open',
    createdAt: new Date().toISOString(),
    bids: []
  };

  try {
    // Ajouter à la mémoire
    missions.push(newMission);

    // Ajouter à la base de données pour le feed
    await missionSyncService.addMissionToFeed(newMission);

    res.status(201).json(newMission);
  } catch (error) {
    console.error('Erreur création mission:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la mission' });
  }
});

app.get('/api/missions/:id', (req, res) => {
  const { id } = req.params;
  const mission = missions.find(m => m.id === id);

  if (!mission) {
    return res.status(404).json({ error: 'Mission non trouvée' });
  }

  res.json(mission);
});

// Start server
const server = createServer(app);

// Force production mode to avoid Vite host blocking issues in Replit
console.log('🔧 Forcing production mode to bypass Vite host restrictions');
serveStatic(app);
console.log('✅ Production mode: serving static files');

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
});

// Launch mission synchronization
missionSyncService.syncMissionsToFeed(missions).catch(console.error);

console.log('✅ Advanced AI routes registered');

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