// Cache pour éviter les appels répétés
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper pour le cache
const getCacheKey = (endpoint: string, data?: any): string => {
  return `${endpoint}_${JSON.stringify(data)}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// API call avec retry et timeout
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// Types
export interface AIAnalysisResult {
  qualityScore: number;
  improvements: string[];
  missingElements: string[];
  technicalComplexity: string;
  optimizedDescription: string;
  marketInsights: {
    competitionLevel: string;
    suggestedBudgetRange: {
      min: number;
      max: number;
    };
  };
}

// Interface for the analyzeWithAI method response
export interface BriefAnalysisResponse {
  qualityScore: number;
  improvements: string[];
  detectedSkills: string[];
  estimatedComplexity: string;
  price_suggested_med?: number;
  delay_suggested_days?: number;
  optimizedDescription?: string | null;
}

export interface QuickAnalysisRequest {
  description: string;
  title?: string;
  category?: string;
}

export interface QuickAnalysisResponse {
  qualityScore: number;
  brief_quality_score: number;
  detectedSkills: string[];
  estimatedComplexity: number;
  price_suggested_med: number;
  price_range_min: number;
  price_range_max: number;
  delay_suggested_days: number;
  optimizedDescription?: string;
  improvements: string[];
  market_insights: {
    estimated_providers_interested: number;
    competition_level: string;
    demand_level: string;
    category_detected: string;
    urgency_detected: boolean;
    suggested_budget_range: {
      min: number;
      max: number;
    };
  };
}

export interface BriefAnalysisRequest {
  description: string;
  category?: string;
  title?: string;
}

export interface PriceAnalysisRequest {
  category: string;
  description: string;
  location?: string;
  complexity: number;
  urgency: string;
}

export const aiService = {
  async analyzeWithAI(data: { title: string; description: string; category?: string }): Promise<BriefAnalysisResponse> {
    const cacheKey = getCacheKey('/ai/analyze', data);
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await apiCall('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      // Fallback data
      return {
        qualityScore: 50,
        improvements: ['Analyseur IA temporairement indisponible'],
        detectedSkills: [],
        estimatedComplexity: 'medium',
        price_suggested_med: 1000,
        delay_suggested_days: 15,
        optimizedDescription: null
      };
    }
  },

  async quickAnalysis(data: QuickAnalysisRequest): Promise<QuickAnalysisResponse> {
    try {
      const response = await fetch('/api/ai/quick-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'analyse rapide IA:', error);
      throw error;
    }
  },

  async optimizeBrief(data: { title: string; description: string; category?: string }) {
    const cacheKey = getCacheKey('/ai/optimize-brief', data);
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await apiCall('/ai/optimize-brief', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur optimisation brief:', error);
      return {
        optimizedText: data.description,
        improvements: ['Service d\'optimisation temporairement indisponible'],
        qualityScore: 50
      };
    }
  },

  async getMarketInsights(category: string) {
    const cacheKey = getCacheKey(`/ai/market-insights/${category}`);
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await apiCall(`/ai/market-insights/${category}`);
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur market insights:', error);
      return {
        averagePrice: 1000,
        demandLevel: 'medium',
        competitionLevel: 'medium',
        trending: false
      };
    }
  },

  async generateMissionSuggestions(keywords: string[]) {
    try {
      return await apiCall('/ai/mission-suggestions', {
        method: 'POST',
        body: JSON.stringify({ keywords }),
      });
    } catch (error) {
      console.error('Erreur suggestions missions:', error);
      return [];
    }
  },

  async priceAnalysis(data: PriceAnalysisRequest) {
    try {
      const response = await fetch('/api/ai/price-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'analyse de prix IA:', error);
      throw error;
    }
  },

  async predictRevenue(data: { missionData: any; providerData: any }) {
    try {
      const response = await fetch('/api/ai/predict-revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la prédiction de revenus:', error);
      throw error;
    }
  },

  async detectDumping(data: { bidData: any }) {
    try {
      const response = await fetch('/api/ai/detect-dumping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la détection de dumping:', error);
      throw error;
    }
  },

  async getBiddingGuidance(data: { missionData: any; providerData: any }) {
    try {
      const response = await fetch('/api/ai/bidding-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du guidage d\'enchères:', error);
      throw error;
    }
  },

  async getMarketAnalysis(data: { category: string; location?: string }) {
    try {
      const response = await fetch('/api/ai/market-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'analyse de marché:', error);
      throw error;
    }
  },

  // Clear cache
  clearCache() {
    cache.clear();
  },

  // Get cache stats
  getCacheStats() {
    return {
      size: cache.size,
      entries: Array.from(cache.keys())
    };
  }
};

// Fonction pour vérifier les comptes démo
export const verifyDemoAccounts = async () => {
  try {
    const response = await fetch('/api/auth/demo-accounts/verify');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur vérification comptes démo:', error);
    return { success: false, error: 'Erreur de connexion' };
  }
};

export default aiService;