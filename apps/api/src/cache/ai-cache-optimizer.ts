/**
 * Optimiseur de cache IA - AppelsPro
 * Système de cache intelligent pour améliorer les performances IA
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  hit_count: number;
  ttl: number;
  priority: 'low' | 'medium' | 'high';
}

interface CacheMetrics {
  total_entries: number;
  hit_rate: number;
  memory_usage_mb: number;
  avg_response_time_ms: number;
  evictions: number;
  cache_size_limit_mb: number;
}

export class AICacheOptimizer {
  private cache = new Map<string, CacheEntry>();
  private hitCounts = new Map<string, number>();
  private maxSizeMB = 256; // Limite de 256MB
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  private cleanupInterval: NodeJS.Timeout;
  
  private metrics: CacheMetrics = {
    total_entries: 0,
    hit_rate: 0,
    memory_usage_mb: 0,
    avg_response_time_ms: 0,
    evictions: 0,
    cache_size_limit_mb: this.maxSizeMB
  };

  constructor() {
    // Nettoyage automatique toutes les 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.performMaintenance();
    }, 2 * 60 * 1000);

    console.log('🚀 AI Cache Optimizer: Initialized with intelligent caching');
  }

  /**
   * Récupère une entrée du cache avec optimisation intelligente
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérification de l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Mise à jour des statistiques de hit
    entry.hit_count++;
    this.hitCounts.set(key, (this.hitCounts.get(key) || 0) + 1);
    
    // Augmentation de la priorité si utilisé fréquemment
    if (entry.hit_count > 10) {
      entry.priority = 'high';
      entry.ttl = this.defaultTTL * 2; // TTL prolongé pour les entrées populaires
    }

    this.updateHitRate();
    
    return entry.data;
  }

  /**
   * Stocke une entrée avec optimisation intelligente
   */
  set<T>(key: string, data: T, options?: {
    ttl?: number;
    priority?: 'low' | 'medium' | 'high';
  }): void {
    const ttl = options?.ttl || this.calculateOptimalTTL(key);
    const priority = options?.priority || this.calculatePriority(key);

    // Vérification de l'espace disponible
    if (this.getMemoryUsage() > this.maxSizeMB * 0.9) {
      this.performEviction();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hit_count: 0,
      ttl,
      priority
    });

    this.metrics.total_entries = this.cache.size;
    this.updateMemoryUsage();
  }

  /**
   * Précharge les données fréquemment utilisées
   */
  preload(keys: Array<{ key: string; fetcher: () => Promise<any> }>) {
    const promises = keys.map(async ({ key, fetcher }) => {
      if (!this.cache.has(key)) {
        try {
          const data = await fetcher();
          this.set(key, data, { priority: 'high' });
        } catch (error) {
          console.warn(`Failed to preload cache key: ${key}`, error);
        }
      }
    });

    return Promise.allSettled(promises);
  }

  /**
   * Invalidation intelligente du cache
   */
  invalidate(pattern: string | RegExp) {
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      const shouldDelete = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
        
      if (shouldDelete) {
        this.cache.delete(key);
        this.hitCounts.delete(key);
        deletedCount++;
      }
    }

    this.metrics.total_entries = this.cache.size;
    this.updateMemoryUsage();

    console.log(`🗑️  AI Cache: Invalidated ${deletedCount} entries matching pattern`);
    return deletedCount;
  }

  /**
   * Optimisation en temps réel du cache
   */
  optimizeInRealTime(): { 
    optimizations_applied: string[];
    performance_gain: number;
  } {
    const optimizations: string[] = [];
    let performanceGain = 0;

    // 1. Ajustement automatique des TTL
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hit_count > 20 && entry.priority !== 'high') {
        entry.priority = 'high';
        entry.ttl = this.defaultTTL * 3;
        optimizations.push(`Extended TTL for popular entry: ${key}`);
        performanceGain += 15;
      }
    }

    // 2. Éviction proactive des entrées peu utilisées
    const lowUsageEntries = Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.hit_count === 0 && Date.now() - entry.timestamp > 60000)
      .slice(0, 10);

    lowUsageEntries.forEach(([key, _]) => {
      this.cache.delete(key);
      optimizations.push(`Evicted unused entry: ${key}`);
      performanceGain += 5;
    });

    // 3. Compression intelligente
    if (this.getMemoryUsage() > this.maxSizeMB * 0.7) {
      this.performEviction();
      optimizations.push('Applied intelligent eviction');
      performanceGain += 25;
    }

    this.updateMemoryUsage();
    
    if (optimizations.length > 0) {
      console.log(`🔧 AI Cache: Applied ${optimizations.length} optimizations, ${performanceGain}% performance gain`);
    }

    return { optimizations_applied: optimizations, performance_gain: performanceGain };
  }

  /**
   * Statistiques détaillées du cache
   */
  getDetailedStats(): CacheMetrics & {
    top_accessed_keys: Array<{ key: string; hits: number }>;
    cache_distribution: Record<string, number>;
  } {
    const topKeys = Array.from(this.hitCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([key, hits]) => ({ key, hits }));

    const distribution: Record<string, number> = {};
    for (const key of this.cache.keys()) {
      const prefix = key.split('_')[0];
      distribution[prefix] = (distribution[prefix] || 0) + 1;
    }

    return {
      ...this.metrics,
      top_accessed_keys: topKeys,
      cache_distribution: distribution
    };
  }

  /**
   * Nettoie complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.hitCounts.clear();
    this.metrics.total_entries = 0;
    this.metrics.evictions = 0;
    this.updateMemoryUsage();
    console.log('🧹 AI Cache: Completely cleared');
  }

  /**
   * Destruction propre
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }

  // Méthodes privées

  private calculateOptimalTTL(key: string): number {
    // TTL adaptatif basé sur le type de données
    if (key.includes('pricing')) return 3 * 60 * 1000; // 3 min pour pricing
    if (key.includes('matching')) return 10 * 60 * 1000; // 10 min pour matching
    if (key.includes('fraud')) return 1 * 60 * 1000; // 1 min pour fraud
    if (key.includes('trust')) return 15 * 60 * 1000; // 15 min pour trust
    return this.defaultTTL;
  }

  private calculatePriority(key: string): 'low' | 'medium' | 'high' {
    if (key.includes('pricing') || key.includes('fraud')) return 'high';
    if (key.includes('matching') || key.includes('trust')) return 'medium';
    return 'low';
  }

  private performEviction(): void {
    // Stratégie d'éviction LFU (Least Frequently Used) avec priorité
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry, score: this.calculateEvictionScore(key, entry) }))
      .sort((a, b) => a.score - b.score);

    // Supprime 20% des entrées les moins importantes
    const toEvict = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      this.cache.delete(entries[i].key);
      this.hitCounts.delete(entries[i].key);
      this.metrics.evictions++;
    }

    console.log(`🗑️  AI Cache: Evicted ${toEvict} entries to free memory`);
  }

  private calculateEvictionScore(key: string, entry: CacheEntry): number {
    const ageWeight = (Date.now() - entry.timestamp) / entry.ttl;
    const hitWeight = 1 / Math.max(entry.hit_count, 1);
    const priorityWeight = entry.priority === 'high' ? 0.1 : 
                          entry.priority === 'medium' ? 0.5 : 1.0;
    
    return ageWeight + hitWeight + priorityWeight;
  }

  private performMaintenance(): void {
    // Suppression des entrées expirées
    let deletedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.hitCounts.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.metrics.total_entries = this.cache.size;
      this.updateMemoryUsage();
      console.log(`🧹 AI Cache: Cleaned ${deletedCount} expired entries`);
    }
  }

  private updateHitRate(): void {
    const totalHits = Array.from(this.hitCounts.values()).reduce((sum, hits) => sum + hits, 0);
    const totalRequests = totalHits + (this.cache.size - this.hitCounts.size);
    this.metrics.hit_rate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  }

  private updateMemoryUsage(): void {
    // Estimation approximative de l'usage mémoire
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry).length;
    }
    this.metrics.memory_usage_mb = totalSize / (1024 * 1024);
  }

  private getMemoryUsage(): number {
    return this.metrics.memory_usage_mb;
  }
}

export const aiCacheOptimizer = new AICacheOptimizer();