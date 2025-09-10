
import express from 'express';
import cors from 'cors';
import { db, testConnection } from './database.js';
import authRoutes from './auth-routes.js';
import apiRoutes from './api-routes.js';
import projectRoutes from './routes/projects.js';
import teamRoutes from './routes/team-routes.js';
import aiRoutes from './routes/ai-routes.js';
import feedRoutes from './routes/feed-routes.js';
import favoritesRoutes from './routes/favorites-routes.js';
import './environment-check.js';

const app = express();
const port = process.env.PORT || 5000;

console.log('🚀 Starting SwipDEAL Server...');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/favorites', favoritesRoutes);

// Routes missions supprimées - retourner 410 Gone
app.all('/api/missions*', (req, res) => {
  res.status(410).json({
    error: 'API missions supprimée',
    message: 'Cette fonctionnalité a été complètement supprimée'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'swideal-api',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

// Gestion des erreurs globales
app.use((error: any, req: any, res: any, next: any) => {
  console.error('❌ Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(port, '0.0.0.0', async () => {
  console.log(`✅ Serveur démarré sur le port ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  
  await testConnection();
});

// Création des comptes démo simplifiée (non bloquant) - moved to after server start
setImmediate(async () => {
  try {
    console.log('✅ Comptes démo - vérification différée');
  } catch (error) {
    console.warn('⚠️ Comptes démo - vérification échouée');
  }
});
