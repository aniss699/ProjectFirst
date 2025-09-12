import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Configuration du rate limiting pour les endpoints IA
export const aiRateLimit = rateLimit({
  // 50 requêtes par fenêtre de 15 minutes pour les endpoints IA
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limite de 50 requêtes par IP
  
  // Messages d'erreur personnalisés
  message: {
    error: 'Trop de requêtes IA depuis cette adresse IP',
    details: 'Limite de 50 requêtes par 15 minutes dépassée',
    retry_after: '15 minutes'
  },
  
  // Code de statut pour les requêtes limitées
  statusCode: 429,
  
  // Headers de rate limiting
  standardHeaders: true, // Retourne les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  
  // Fonction pour générer la clé de rate limiting
  keyGenerator: (req: Request) => {
    // Utilise l'IP client et l'endpoint pour différencier les limites
    return `${req.ip}-${req.originalUrl}`;
  },
  
  // Skip certains endpoints moins critiques
  skip: (req: Request) => {
    // Ne pas limiter les endpoints de health check et les requêtes de base
    return req.originalUrl.includes('/health') || 
           req.originalUrl === '/api' || 
           req.originalUrl.includes('/healthz') ||
           req.method === 'HEAD';
  },
  
  // Handler personnalisé pour les dépassements de limite
  handler: (req: Request, res: Response) => {
    console.log(`⚠️  Rate limit dépassé pour ${req.ip} sur ${req.originalUrl}`);
    
    res.status(429).json({
      success: false,
      error: 'Rate limit dépassé',
      message: 'Trop de requêtes IA. Veuillez attendre avant de réessayer.',
      retry_after: 900, // 15 minutes en secondes
      current_limit: 50,
      window_ms: 900000
    });
  }
});

// Rate limiting plus strict pour les endpoints coûteux
export const strictAiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Seulement 20 requêtes pour les endpoints coûteux
  
  message: {
    error: 'Limite stricte dépassée pour les opérations IA coûteuses',
    details: 'Limite de 20 requêtes par 15 minutes pour les analyses avancées',
    retry_after: '15 minutes'
  },
  
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => `strict-${req.ip}-${req.originalUrl}`,
  
  handler: (req: Request, res: Response) => {
    console.log(`🚨 Rate limit strict dépassé pour ${req.ip} sur ${req.originalUrl}`);
    
    res.status(429).json({
      success: false,
      error: 'Rate limit strict dépassé',
      message: 'Limite stricte pour les analyses IA avancées dépassée.',
      retry_after: 900,
      current_limit: 20,
      window_ms: 900000
    });
  }
});

// Rate limiting pour les endpoints de monitoring (plus permissif)
export const monitoringRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requêtes par 5 minutes pour le monitoring
  
  message: {
    error: 'Limite de monitoring dépassée',
    details: 'Limite de 100 requêtes par 5 minutes pour le monitoring',
    retry_after: '5 minutes'
  },
  
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req: Request) => `monitoring-${req.ip}`,
  
  handler: (req: Request, res: Response) => {
    console.log(`📊 Rate limit monitoring dépassé pour ${req.ip}`);
    
    res.status(429).json({
      success: false,
      error: 'Rate limit monitoring dépassé',
      message: 'Trop de requêtes de monitoring.',
      retry_after: 300,
      current_limit: 100,
      window_ms: 300000
    });
  }
});