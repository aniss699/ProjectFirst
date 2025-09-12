/**
 * Cache centralisé et intelligent pour tous les services AI
 * Unifie tous les systèmes de cache fragmentés
 */

import { aiConfig } from './AIConfig';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
  lastAccessed: number;
}

export interface CacheMetrics {
  requests: number;
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
  avgResponseTime: number;
}

export class AICache {
  private static instance: AICache;
  private cache: Map<string, CacheEntry<any>>;
  private requestQueue: Map<string, Promise<any>>;
  private metrics: CacheMetrics;
  private cleanupTimer?: NodeJS.Timeout;

  private constructor() {
    this.cache = new Map();
    this.requestQueue = new Map();
    this.metrics = {
      requests: 0,
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
      avgResponseTime: 0
    };

    // Démarrer le nettoyage automatique
    this.startCleanup();
  }

  public static getInstance(): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache();
    }
    return AICache.instance;
  }

  /**
   * Cache intelligent avec TTL adaptatif et déduplication des requêtes
   */
  async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.requests++;

    // Vérification cache
    const cached = this.cache.get(key);
    if (cached && this.isValidEntry(cached)) {
      cached.hitCount++;
      cached.lastAccessed = Date.now();
      this.metrics.hits++;
      this.updateResponseTime(startTime);
      return cached.data;
    }

    // Cache miss
    this.metrics.misses++;

    // Déduplication des requêtes
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }

    // Nouvelle requête
    const request = fetchFn()
      .then(data => {
        const ttl = customTtl || aiConfig.getAdaptiveTtl(key, data);
        this.set(key, data, ttl);
        this.updateResponseTime(startTime);
        return data;
      })
      .catch(error => {
        // En cas d'erreur, essayer de retourner une entrée expirée si disponible
        if (cached) {
          console.warn(`Using expired cache for key ${key} due to error:`, error);
          return cached.data;
        }
        throw error;
      })
      .finally(() => {
        this.requestQueue.delete(key);
      });

    this.requestQueue.set(key, request);
    return request;
  }

  /**
   * Stockage direct dans le cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const finalTtl = ttl || aiConfig.getAdaptiveTtl(key, data);
    
    // Éviction si nécessaire
    if (this.cache.size >= aiConfig.cache.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: finalTtl,
      hitCount: 0,
      lastAccessed: Date.now()
    });

    this.metrics.size = this.cache.size;
  }

  /**
   * Récupération directe du cache
   */
  get<T>(key: string): T | null {
    this.metrics.requests++;
    
    const entry = this.cache.get(key);
    if (!entry || !this.isValidEntry(entry)) {
      this.metrics.misses++;
      return null;
    }

    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.metrics.hits++;
    return entry.data;
  }

  /**
   * Invalidation du cache par pattern
   */
  invalidatePattern(pattern: string): number {
    let invalidated = 0;
    const regex = new RegExp(pattern);
    
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    this.metrics.size = this.cache.size;
    return invalidated;
  }

  /**
   * Invalidation directe
   */
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Vider complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.requestQueue.clear();
    this.metrics.size = 0;
    this.metrics.evictions++;
  }

  /**
   * Métriques de performance
   */
  getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      hitRate: this.metrics.requests > 0 
        ? this.metrics.hits / this.metrics.requests 
        : 0
    };
  }

  /**
   * Vérification de validité d'une entrée
   */
  private isValidEntry(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Éviction intelligente basée sur LRU et fréquence
   */
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    let leastUsedKey = '';
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache) {
      // Score basé sur fréquence et récence
      const recencyScore = Date.now() - entry.lastAccessed;
      const frequencyScore = 1 / (entry.hitCount + 1);
      const totalScore = recencyScore * frequencyScore;

      if (totalScore < lowestScore) {
        lowestScore = totalScore;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Nettoyage automatique des entrées expirées
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, aiConfig.cache.cleanupInterval);
  }

  /**
   * Nettoyage des entrées expirées
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`AICache: Cleaned ${cleaned} expired entries`);
      this.metrics.size = this.cache.size;
    }
  }

  /**
   * Mise à jour des métriques de temps de réponse
   */
  private updateResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime + responseTime) / 2;
  }

  /**
   * Arrêt propre
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

export const aiCache = AICache.getInstance();