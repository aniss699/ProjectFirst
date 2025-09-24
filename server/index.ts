import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
// Vite imports will be dynamic to avoid side effects
import { Mission } from './types/mission.js';
import { MissionSyncService } from './services/mission-sync.js';
import { validateEnvironment } from './environment-check.js';
import { Pool } from 'pg';
import cors from 'cors'; // Import cors
import fs from 'fs';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation des variables d'environnement au démarrage
validateEnvironment();

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);
const PID_FILE = '/tmp/swideal-server.pid';

// Helper function to check if port is free
function checkPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(1000);

    client.on('connect', () => {
      client.destroy();
      resolve(false); // Port is busy
    });

    client.on('timeout', () => {
      client.destroy();
      resolve(true); // Port is free
    });

    client.on('error', () => {
      resolve(true); // Port is free (connection refused)
    });

    client.connect(port, '127.0.0.1');
  });
}

// Helper function to wait for port to be free
async function waitForPortFree(port: number, maxWaitMs: number = 10000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    if (await checkPortFree(port)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return false;
}

// Helper function to handle previous process cleanup and force-kill port 5000 in dev
async function cleanupPreviousProcess(): Promise<void> {
  try {
    if (fs.existsSync(PID_FILE)) {
      const pidString = fs.readFileSync(PID_FILE, 'utf8').trim();
      const pid = parseInt(pidString, 10);

      if (!isNaN(pid)) {
        try {
          // Check if process is still running
          process.kill(pid, 0);
          console.log(`🔄 Found previous process with PID ${pid}, sending SIGTERM...`);
          process.kill(pid, 'SIGTERM');

          // Wait for process to exit and port to be free
          console.log('⏳ Waiting for previous process to exit...');
          await waitForPortFree(port, 8000);
        } catch (err) {
          // Process not running, PID file is stale
          console.log('🧹 Removing stale PID file');
        }
      }

      fs.unlinkSync(PID_FILE);
    }
  } catch (error) {
    console.log('🔍 No previous process to cleanup');
  }

  // Development-only: Force kill any process holding port 5000
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('🔫 Development mode: Force-killing any process on port 5000...');
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);

      // Try multiple approaches to kill port 5000 listeners
      try {
        await execAsync('fuser -k 5000/tcp 2>/dev/null || true');
        console.log('🧹 fuser kill attempt completed');
      } catch (e) {
        console.log('🔍 fuser not available, trying alternative...');
      }

      // Wait a moment for processes to die
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Double-check port is free
      if (await checkPortFree(port)) {
        console.log('✅ Port 5000 is now free');
      } else {
        console.log('⚠️ Port 5000 may still be busy, will retry during startup');
      }
    } catch (killError) {
      console.log('🔍 Force-kill attempt failed, continuing with normal startup:', killError instanceof Error ? killError.message : 'Unknown error');
    }
  }
}

// Helper function to write PID file
function writePidFile(): void {
  try {
    fs.writeFileSync(PID_FILE, process.pid.toString());
    console.log(`📝 PID file created: ${PID_FILE} (${process.pid})`);
  } catch (error) {
    console.warn('⚠️ Could not write PID file:', error);
  }
}

// Helper function to remove PID file
function removePidFile(): void {
  try {
    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
      console.log('🧹 PID file removed');
    }
  } catch (error) {
    console.warn('⚠️ Could not remove PID file:', error);
  }
}

// Initialize services with Replit PostgreSQL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/swideal';

console.log('🔗 Using Replit PostgreSQL connection');

const missionSyncService = new MissionSyncService(databaseUrl);

// Create a pool instance for health checks with timeout
const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5000,  // 5 second timeout
  idleTimeoutMillis: 10000,       // 10 second idle timeout
  max: 20                         // maximum number of connections
});

// Log database configuration for debugging
console.log('🔗 Database configuration:', {
  DATABASE_URL: !!process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  PLATFORM: 'Replit'
});

// Validate database connection with timeout
async function validateDatabaseConnection() {
  const timeout = 8000; // 8 second timeout
  try {
    console.log('🔍 Validating database connection...');

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), timeout);
    });

    const connectionPromise = pool.query('SELECT 1 as test');

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Database connection validated successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Database connection validation failed (non-blocking):', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Database initialization will be called explicitly during server startup

// Remove in-memory missions storage - using database only

// Initialize global variables safely
if (!(global as any).projectStandardizations) {
  (global as any).projectStandardizations = new Map();
}
if (!(global as any).aiEnhancementCache) {
  (global as any).aiEnhancementCache = new Map();
}
if (!(global as any).performanceMetrics) {
  (global as any).performanceMetrics = new Map();
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

// CORS configuration - security-aware for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Production: Only allow trusted domains
    const allowedOrigins = [
      'https://swideal.com',
      'https://www.swideal.com',
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.replit\.co$/
    ];

    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else {
        return allowed.test(origin);
      }
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Import middleware
import { validateRequest, limitRequestSize } from './middleware/request-validator.js';
import { performanceMonitor, getPerformanceStats } from './middleware/performance-monitor.js';

// Apply middleware only to API routes to avoid interfering with Vite frontend
app.use('/api', limitRequestSize, validateRequest, performanceMonitor, express.json({ limit: '10mb' }));

// Import auth routes
import authRoutes from './auth-routes.js';

// Auth routes avec logging amélioré
app.use('/api/auth', (req, res, next) => {
  console.log(`🔐 Auth request: ${req.method} ${req.path}`, { body: req.body.email ? { email: req.body.email } : {} });
  next();
}, authRoutes);
// Import missions routes here
import missionsRoutes from './routes/missions.js';
// Import projects supprimé - remplacé par missions
import apiRoutes from './api-routes.js';
import aiMonitoringRoutes from './routes/ai-monitoring-routes.js';
import aiSuggestionsRoutes from './routes/ai-suggestions-routes.js';
import aiMissionsRoutes from './routes/ai-missions-routes.js';
// AI orchestrator routes will be imported dynamically
import feedRoutes from './routes/feed-routes.js';
import favoritesRoutes from './routes/favorites-routes.js';
import missionDemoRoutes from './routes/mission-demo.js';
import aiQuickAnalysisRoutes from './routes/ai-quick-analysis.js';
import aiDiagnosticRoutes from './routes/ai-diagnostic-routes.js';
import aiLearningRoutes from './routes/ai-learning-routes.js';
import teamRoutes from './routes/team-routes.js';
import openTeamsRoutes from './routes/open-teams.js';
import bidsRoutes from './routes/bids.js';

// Import rate limiting middleware
import { aiRateLimit, strictAiRateLimit, monitoringRateLimit } from './middleware/ai-rate-limit.js';

// Add basic API endpoint for health checks (before rate limiting)
app.all('/api', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SWIDEAL API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
// Register missions routes first
console.log('📋 Registering missions routes...');
// Mission routes avec logging amélioré
app.use('/api/missions', (req, res, next) => {
  console.log(`📋 Mission request: ${req.method} ${req.path}`, { 
    body: req.body.title ? { title: req.body.title, userId: req.body.userId } : {} 
  });
  next();
}, missionsRoutes);

console.log('📋 Registering other API routes...');
app.use('/api', apiRoutes);
// Handle deprecated projects API with proper proxy to missions
app.use('/api/projects', (req, res, next) => {
  const newUrl = req.originalUrl.replace('/api/projects', '/api/missions');
  console.log(`🔄 Proxying deprecated projects API ${req.originalUrl} to missions API`);

  // Forward the request to missions API internally
  req.url = req.url.replace('/projects', '/missions');
  req.originalUrl = newUrl;
  next();
}, missionsRoutes);

// Apply rate limiting to AI routes
app.use('/api/ai/monitoring', monitoringRateLimit, aiMonitoringRoutes);
app.use('/api/ai/suggest-pricing', strictAiRateLimit);  // Endpoint coûteux
app.use('/api/ai/enhance-description', strictAiRateLimit);  // Endpoint coûteux
app.use('/api/ai/analyze-quality', strictAiRateLimit);  // Endpoint coûteux
app.use('/api/ai/enhance-text', strictAiRateLimit);  // Endpoint coûteux
// aiRoutes supprimés - routes IA gérées par modules spécialisés
app.use('/api/ai', aiRateLimit, aiSuggestionsRoutes);
app.use('/api/ai/missions', aiRateLimit, aiMissionsRoutes);
// AI orchestrator routes will be mounted after server starts
app.use('/api', aiRateLimit, aiQuickAnalysisRoutes);  // Analyses IA rapides

// Register AI diagnostic and learning routes
app.use('/api/ai/diagnostic', aiDiagnosticRoutes);
app.use('/api/ai/suggestions', aiSuggestionsRoutes);
app.use('/api/ai/learning', aiLearningRoutes);

app.use('/api', feedRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', missionDemoRoutes);
app.use('/api/team', teamRoutes);

console.log('🤝 Registering open teams routes...');
app.use('/api/open-teams', (req, res, next) => {
  console.log(`🤝 Open teams request: ${req.method} ${req.path}`);
  next();
}, openTeamsRoutes);

console.log('🎯 Registering bids routes...');
app.use('/api/bids', (req, res, next) => {
  console.log(`🎯 Bids request: ${req.method} ${req.path}`, { 
    body: req.body.mission_id ? { mission_id: req.body.mission_id, bid_type: req.body.bid_type } : {} 
  });
  next();
}, bidsRoutes);

// Performance stats endpoint
app.get('/api/performance', (req, res) => {
  try {
    const stats = getPerformanceStats();
    res.json({
      ok: true,
      performance: stats,
      server_uptime: process.uptime(),
      memory: {
        used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Failed to get performance stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });

    const queryPromise = pool.query('SELECT 1');
    await Promise.race([queryPromise, timeoutPromise]);

    res.status(200).json({
      status: 'healthy',
      message: 'SWIDEAL API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development',
      database: 'connected',
      service: 'missions-api'
    });
  } catch (error) {
    console.error('Health check database error:', error);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      service: 'missions-api',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

// Start server with retry logic
let currentServer: any = null;

// Function to start server with retry logic
async function startServerWithRetry(): Promise<void> {
  const maxAttempts = 8;
  const delayMs = 750;
  const totalTimeoutMs = 9000; // 9 second hard deadline
  const startTime = Date.now();

  await cleanupPreviousProcess();

  // Initialize database explicitly here instead of in imports
  console.log('🔧 Initializing database before server start...');
  try {
    const { initializeDatabase, testConnection } = await import('./database.js');
    await initializeDatabase();
    await testConnection();
    await validateDatabaseConnection();
    console.log('✅ Database initialization completed');
  } catch (dbError) {
    console.warn('⚠️ Database initialization failed (non-blocking):', dbError instanceof Error ? dbError.message : 'Unknown error');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check hard deadline
    if (Date.now() - startTime > totalTimeoutMs) {
      console.error(`❌ Startup deadline exceeded (${totalTimeoutMs}ms), exiting for supervisor restart`);
      process.exit(1);
    }

    try {
      // Create a fresh server for each attempt
      const server = createServer(app);
      currentServer = server;

      await new Promise<void>((resolve, reject) => {
        const serverInstance = server.listen(port, '0.0.0.0', async () => {
          writePidFile();
          console.log(`🚀 SWIDEAL server running on http://0.0.0.0:${port} (attempt ${attempt})`);
          console.log(`📱 Frontend: http://0.0.0.0:${port}`);
          console.log(`🔧 API Health: http://0.0.0.0:${port}/api/health`);
          console.log(`🎯 AI Provider: Gemini API Only`);
          console.log(`🔍 Process ID: ${process.pid}`);
          console.log(`🔍 Node Environment: ${process.env.NODE_ENV || 'development'}`);

          // Dynamic imports to avoid side effects during startup
          console.log('📦 Loading Vite and AI modules dynamically...');
          try {
            // Import Vite module dynamically
            const { setupVite, serveStatic } = await import('./vite.js');

            // Import AI orchestrator routes dynamically
            const aiOrchestratorModule = await import('../apps/api/src/routes/ai.ts');
            const aiOrchestratorRoutes = aiOrchestratorModule.default;

            // Mount AI orchestrator routes now that server is running with necessary middleware
            app.use('/api-ai-orchestrator', express.json({ limit: '10mb' }), strictAiRateLimit, aiOrchestratorRoutes);
            console.log('✅ AI orchestrator routes mounted');

            // Setup Vite for development, static files for production
            if (process.env.NODE_ENV === 'production') {
              console.log('🏭 Production mode: serving static files');
              serveStatic(app);
            } else {
              console.log('🔧 Development mode: setting up Vite middleware');
              try {
                await setupVite(app, server);
                console.log('✅ Vite middleware setup complete');
              } catch (error) {
                console.error('❌ Failed to setup Vite middleware:', error);
              }
            }
          } catch (importError) {
            console.error('❌ Failed to import modules:', importError);
          }
          resolve();
        });

        server.on('error', (err: any) => {
          server.close(); // Clean up this server instance
          if (err.code === 'EADDRINUSE') {
            console.log(`⏳ Port ${port} busy on attempt ${attempt}/${maxAttempts}`);
            reject(new Error('EADDRINUSE'));
          } else {
            console.error('❌ Server error:', err);
            reject(err);
          }
        });
      });

      // Success!
      return;

    } catch (error: any) {
      if (error.message === 'EADDRINUSE' && attempt < maxAttempts) {
        const remainingTime = totalTimeoutMs - (Date.now() - startTime);
        if (remainingTime > delayMs) {
          console.log(`🔄 Waiting ${delayMs}ms before retry ${attempt + 1}/${maxAttempts}...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          await waitForPortFree(port, 1000); // Shorter wait
        } else {
          console.error(`❌ Not enough time remaining for retry, exiting`);
          process.exit(1);
        }
      } else {
        console.error(`❌ Failed to start server after ${maxAttempts} attempts:`, error);
        process.exit(1);
      }
    }
  }
}

// Start the server
startServerWithRetry().catch((error) => {
  console.error('❌ Fatal error starting server:', error);
  process.exit(1);
});


// Mission sync now handled by database routes

console.log('✅ Advanced AI routes registered - Gemini API Only');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  removePidFile();
  if (currentServer) {
    currentServer.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  removePidFile();
  if (currentServer) {
    currentServer.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler with better error categorization
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;

  // Enable debug mode in preview
  const isDebugMode = process.env.PREVIEW_MODE === 'true' || process.env.NODE_ENV === 'development';

  // Categorize error types
  let statusCode = 500;
  let errorType = 'server_error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'validation_error';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    errorType = 'not_found';
  } else if (error.message.includes('unauthorized')) {
    statusCode = 401;
    errorType = 'unauthorized';
  }

  console.error('🚨 Global error handler:', {
    error_type: errorType,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    user_agent: req.headers['user-agent'],
    ip: req.ip,
    request_id: requestId,
    timestamp
  });

  // Safe event logging without blocking response
  setImmediate(async () => {
    try {
      const eventLoggerModule = await import('../apps/api/src/monitoring/event-logger.js');
      eventLoggerModule.eventLogger?.logUserEvent('click', (req as any).user?.id || 'anonymous', (req as any).sessionID || requestId, {
        error_type: errorType,
        error_message: error.message,
        endpoint: req.originalUrl,
        method: req.method,
        status_code: statusCode
      });
    } catch (logError) {
      console.warn('Event logging failed (non-critical):', logError instanceof Error ? logError.message : 'Unknown error');
    }
  });

  if (!res.headersSent) {
    res.status(statusCode).json({
      ok: false,
      error: statusCode === 500 ? 'Internal server error' : error.message,
      details: isDebugMode ? error.message : 'An error occurred',
      stack: isDebugMode ? error.stack : undefined,
      error_type: errorType,
      timestamp,
      request_id: requestId,
      debug_mode: isDebugMode
    });
  }
});

export default app;