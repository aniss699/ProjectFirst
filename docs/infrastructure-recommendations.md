
# 🏗️ Recommandations Infrastructure & Sécurité

## 🔍 1. Indexation & Performance Database

### Index Critiques
```sql
-- Performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Index composites pour requêtes courantes
CREATE INDEX CONCURRENTLY idx_missions_hot_feed 
ON missions(status, created_at DESC, quality_score DESC) 
WHERE status = 'published';

-- Index partiel pour recherches géo
CREATE INDEX CONCURRENTLY idx_missions_geo_published 
ON missions(latitude, longitude) 
WHERE status = 'published' AND latitude IS NOT NULL;

-- Index GIN optimisé pour recherche
CREATE INDEX CONCURRENTLY idx_missions_search_optimized 
ON missions USING GIN(
  setweight(to_tsvector('french', title), 'A') ||
  setweight(to_tsvector('french', description), 'B')
);
```

### Partitioning (pour gros volumes)
```sql
-- Partition par date pour archivage automatique
CREATE TABLE missions_y2024m01 PARTITION OF missions
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Trigger d'archivage automatique
CREATE OR REPLACE FUNCTION archive_old_missions()
RETURNS void AS $$
BEGIN
  UPDATE missions 
  SET status = 'archived'
  WHERE created_at < NOW() - INTERVAL '2 years'
    AND status NOT IN ('in_progress', 'awarded');
END;
$$ LANGUAGE plpgsql;

-- Cron job (pg_cron extension)
SELECT cron.schedule('archive-missions', '0 2 * * 0', 'SELECT archive_old_missions()');
```

### Connection Pooling
```typescript
// server/database.ts - Configuration optimisée
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

const sql = postgres(connectionString, {
  // Pool configuration
  max: 20,                    // Maximum connections
  idle_timeout: 20,          // Close idle connections after 20s
  connect_timeout: 10,       // Connection timeout
  prepare: false,            // Disable prepared statements for better pooling
  
  // Performance options
  transform: postgres.camel, // Auto camelCase transformation
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Monitoring
  onnotice: (notice) => console.log('DB Notice:', notice),
  debug: process.env.NODE_ENV === 'development'
});

export const db = drizzle(sql);
```

## 🔒 2. Sécurité & Authentication

### Rate Limiting Avancé
```typescript
// server/middleware/rate-limiting.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Rate limiting par endpoint
export const createMissionLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:create_mission:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 missions max par fenêtre
  message: {
    error: 'Trop de missions créées. Attendez 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

export const searchLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:search:'
  }),
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 60,                  // 60 recherches par minute
  keyGenerator: (req) => req.user?.id || req.ip
});

// Protection DDoS avancée
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,                 // 100 requêtes par IP
  standardHeaders: true,
  keyGenerator: (req) => {
    // Rate limiting intelligent
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    return `ip:${req.ip}`;
  },
  skip: (req) => {
    // Skip pour certaines routes publiques
    return req.path.startsWith('/health') || req.path.startsWith('/static');
  }
});
```

### Validation & Sanitisation XSS
```typescript
// server/middleware/security.ts
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// Helmet configuration sécurisée
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Sanitisation input
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Pas de HTML autorisé
    ALLOWED_ATTR: []
  });
};

// Middleware de validation mission
export const validateMissionInput = [
  body('title')
    .isLength({ min: 3, max: 500 })
    .customSanitizer(sanitizeHtml)
    .escape(),
  body('description')
    .isLength({ min: 10, max: 5000 })
    .customSanitizer(sanitizeHtml)
    .escape(),
  body('budget.valueCents')
    .optional()
    .isInt({ min: 100, max: 100000000 }), // 1€ à 1M€
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];
```

### Audit Logging
```typescript
// server/middleware/audit-logger.ts
import { Request, Response, NextFunction } from 'express';

interface AuditLog {
  user_id?: number;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  request_data?: any;
  response_status: number;
}

export const auditLogger = (action: string, resourceType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log après réponse
      const auditLog: AuditLog = {
        user_id: req.user?.id,
        action,
        resource_type: resourceType,
        resource_id: req.params.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || 'Unknown',
        timestamp: new Date(),
        request_data: filterSensitiveData(req.body),
        response_status: res.statusCode
      };
      
      // Envoyer vers service d'audit (Elasticsearch, etc.)
      saveAuditLog(auditLog);
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

function filterSensitiveData(data: any): any {
  const filtered = { ...data };
  delete filtered.password;
  delete filtered.token;
  return filtered;
}

async function saveAuditLog(log: AuditLog): Promise<void> {
  // Implémenter sauvegarde (DB, Elasticsearch, etc.)
  console.log('Audit:', JSON.stringify(log));
}
```

## 📊 3. Monitoring & Observabilité

### Health Checks Avancés
```typescript
// server/routes/health.ts
import { Router } from 'express';
import { db } from '../database.js';
import Redis from 'ioredis';

const router = Router();
const redis = new Redis(process.env.REDIS_URL);

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    checks: {}
  };

  try {
    // Check database
    const dbStart = Date.now();
    await db.execute('SELECT 1');
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart
    };
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'unhealthy',
      error: error.message
    };
  }

  try {
    // Check Redis
    const redisStart = Date.now();
    await redis.ping();
    health.checks.redis = {
      status: 'healthy',
      latency: Date.now() - redisStart
    };
  } catch (error) {
    health.checks.redis = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning', // 500MB
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/metrics', async (req, res) => {
  // Métriques Prometheus-compatible
  const metrics = await generateMetrics();
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

export default router;
```

### Performance Monitoring
```typescript
// server/middleware/performance-monitor.ts
import { performance } from 'perf_hooks';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  memory_usage: number;
  timestamp: Date;
}

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  const memStart = process.memoryUsage().heapUsed;
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    const memUsed = process.memoryUsage().heapUsed - memStart;
    
    const metric: PerformanceMetric = {
      endpoint: req.route?.path || req.path,
      method: req.method,
      duration,
      memory_usage: memUsed,
      timestamp: new Date()
    };
    
    // Alert si performance dégradée
    if (duration > 1000) { // > 1 seconde
      console.warn('Slow request detected:', metric);
      // Envoyer alerte (Slack, PagerDuty, etc.)
    }
    
    // Sauvegarder métrique pour analyse
    savePerformanceMetric(metric);
  });
  
  next();
};
```

## 🌐 4. Caching Strategy

### Multi-level Caching
```typescript
// server/services/cache-service.ts
import Redis from 'ioredis';
import NodeCache from 'node-cache';

class CacheService {
  private redis: Redis;
  private memoryCache: NodeCache;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.memoryCache = new NodeCache({ 
      stdTTL: 300,      // 5 minutes
      checkperiod: 60   // Check expired keys every minute
    });
  }
  
  async get(key: string): Promise<any> {
    // L1: Memory cache (fastest)
    let value = this.memoryCache.get(key);
    if (value) {
      return value;
    }
    
    // L2: Redis cache
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      value = JSON.parse(redisValue);
      this.memoryCache.set(key, value, 60); // Cache in memory for 1 min
      return value;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    // Set in both caches
    this.memoryCache.set(key, value, Math.min(ttl, 300));
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Invalidate memory cache
    this.memoryCache.flushAll();
    
    // Invalidate Redis by pattern
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const cacheService = new CacheService();

// Middleware de cache pour routes
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    
    const cacheKey = `api:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, JSON.parse(data), ttl);
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};
```

## 📈 5. Scalabilité & DevOps

### Configuration Docker Production
```dockerfile
# Dockerfile.production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime

# Security: non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .

# Security headers
RUN apk add --no-cache dumb-init

USER nodeuser
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Monitoring Stack (docker-compose.yml)
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  grafana-storage:
  redis-data:
```

### Backup Strategy
```bash
#!/bin/bash
# scripts/backup-production.sh

set -e

# Variables
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="swideal_production"
S3_BUCKET="swideal-backups"

# Database backup
echo "Starting database backup..."
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_backup_$DATE.sql.gz" "s3://$S3_BUCKET/database/"

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Verify backup
echo "Backup completed: db_backup_$DATE.sql.gz"
```

## 🚨 6. Security Checklist Final

- [ ] **Authentication**: JWT tokens sécurisés, refresh tokens
- [ ] **Authorization**: RBAC implémenté, permissions granulaires
- [ ] **Input validation**: Zod schemas, sanitisation XSS
- [ ] **Rate limiting**: Par IP et par utilisateur
- [ ] **SQL injection**: Requêtes paramétrées obligatoires
- [ ] **HTTPS**: SSL/TLS activé en production
- [ ] **Headers sécurité**: Helmet.js configuré
- [ ] **Audit logging**: Toutes les actions sensibles loggées
- [ ] **Data privacy**: RGPD compliance, anonymisation
- [ ] **Backup & Recovery**: Stratégie de sauvegarde testée
- [ ] **Monitoring**: Alertes configurées pour incidents
- [ ] **Dependencies**: Scan sécurité régulier (npm audit)

Cette architecture garantit une marketplace robuste, sécurisée et scalable ! 🚀
