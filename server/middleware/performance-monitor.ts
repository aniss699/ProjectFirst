
import { Request, Response, NextFunction } from 'express';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  memory_usage: number;
}

// Stockage en mémoire des métriques (pour éviter la dépendance DB)
const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 1000; // Garder seulement les 1000 dernières métriques

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Intercepter la fin de la réponse
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    const memoryUsed = process.memoryUsage().heapUsed - startMemory;

    // Enregistrer la métrique
    const metric: PerformanceMetric = {
      endpoint: req.originalUrl,
      method: req.method,
      duration,
      status: res.statusCode,
      timestamp: new Date().toISOString(),
      memory_usage: memoryUsed
    };

    metrics.push(metric);

    // Garder seulement les métriques récentes
    if (metrics.length > MAX_METRICS) {
      metrics.splice(0, metrics.length - MAX_METRICS);
    }

    // Log des requêtes lentes (> 2 secondes)
    if (duration > 2000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }

    // Log des requêtes qui consomment beaucoup de mémoire (> 50MB)
    if (memoryUsed > 50 * 1024 * 1024) {
      console.warn(`🔥 High memory usage: ${req.method} ${req.originalUrl} used ${Math.round(memoryUsed / 1024 / 1024)}MB`);
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Fonction pour obtenir les statistiques de performance
export const getPerformanceStats = () => {
  if (metrics.length === 0) {
    return { message: 'No metrics available' };
  }

  const recentMetrics = metrics.slice(-100); // 100 dernières requêtes
  const averageDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
  const slowRequests = recentMetrics.filter(m => m.duration > 1000).length;
  const errorRequests = recentMetrics.filter(m => m.status >= 400).length;

  return {
    total_requests: metrics.length,
    recent_requests: recentMetrics.length,
    average_duration_ms: Math.round(averageDuration),
    slow_requests_count: slowRequests,
    error_requests_count: errorRequests,
    error_rate_percent: Math.round((errorRequests / recentMetrics.length) * 100),
    last_updated: new Date().toISOString()
  };
};
