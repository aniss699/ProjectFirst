
import { Request, Response, NextFunction } from 'express';

// Middleware de validation des requêtes
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Ajouter l'ID de requête aux headers
  req.headers['x-request-id'] = requestId;
  
  // Log de la requête entrante
  console.log(`📥 ${req.method} ${req.originalUrl}`, {
    request_id: requestId,
    user_agent: req.headers['user-agent']?.substring(0, 100),
    ip: req.ip,
    content_type: req.headers['content-type'],
    content_length: req.headers['content-length'],
    timestamp
  });

  // Validation du Content-Type pour les requêtes POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Invalid Content-Type: ${contentType} for ${req.method} ${req.originalUrl}`);
      return res.status(400).json({
        ok: false,
        error: 'Content-Type must be application/json',
        request_id: requestId,
        timestamp
      });
    }
  }

  // Timeout de sécurité pour éviter les requêtes qui traînent
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`⏰ Request timeout: ${req.method} ${req.originalUrl} (${requestId})`);
      res.status(408).json({
        ok: false,
        error: 'Request timeout',
        request_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
  }, 30000); // 30 secondes

  // Nettoyer le timeout quand la réponse est envoyée
  res.on('finish', () => {
    clearTimeout(timeout);
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${requestId})`);
  });

  next();
};

// Middleware de limitation de taille des requêtes
export const limitRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      ok: false,
      error: 'Request too large',
      max_size: '10MB',
      received_size: `${Math.round(contentLength / 1024 / 1024)}MB`
    });
  }
  
  next();
};
