interface ExternalMarketData {
  averagePrices: { [category: string]: number };
  demandLevel: string;
  competitionLevel: string;
  trendingSkills: string[];
}

interface ServiceConfig {
  freelancer: boolean;
  upwork: boolean;
  googleTrends: boolean;
  insee: boolean;
  clearbit: boolean;
  hunter: boolean;
  linkedin: boolean;
  openai: boolean;
  anthropic: boolean;
  googleCloudAI: boolean;
}

class ExternalServiceManager {
  private config: ServiceConfig;

  constructor() {
    this.config = {
      freelancer: process.env.ENABLE_FREELANCER_API === 'true',
      upwork: process.env.ENABLE_UPWORK_API === 'true',
      googleTrends: process.env.ENABLE_GOOGLE_TRENDS === 'true',
      insee: process.env.ENABLE_INSEE_DATA === 'true',
      clearbit: process.env.ENABLE_CLEARBIT === 'true',
      hunter: process.env.ENABLE_HUNTER === 'true',
      linkedin: process.env.ENABLE_LINKEDIN_API === 'true',
      openai: process.env.ENABLE_OPENAI_GPT4 === 'true',
      anthropic: process.env.ENABLE_ANTHROPIC_CLAUDE === 'true',
      googleCloudAI: process.env.ENABLE_GOOGLE_CLOUD_AI === 'true'
    };
  }

  isServiceEnabled(service: keyof ServiceConfig): boolean {
    return this.config[service] && this.hasRequiredCredentials(service);
  }

  private hasRequiredCredentials(service: keyof ServiceConfig): boolean {
    switch (service) {
      case 'freelancer':
        return !!(process.env.FREELANCER_API_KEY && process.env.FREELANCER_API_SECRET);
      case 'upwork':
        return !!(process.env.UPWORK_API_KEY && process.env.UPWORK_API_SECRET);
      case 'googleTrends':
        return !!process.env.GOOGLE_TRENDS_API_KEY;
      case 'insee':
        return true; // INSEE est souvent sans clé
      case 'clearbit':
        return !!process.env.CLEARBIT_API_KEY;
      case 'hunter':
        return !!process.env.HUNTER_API_KEY;
      case 'linkedin':
        return !!(process.env.LINKEDIN_API_CLIENT_ID && process.env.LINKEDIN_API_CLIENT_SECRET);
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'googleCloudAI':
        // PRIORISER VERTEX AI - utiliser les mêmes credentials
        return !!(process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      default:
        return false;
    }
  }

  getAvailableServices(): string[] {
    return Object.keys(this.config).filter(service =>
      this.isServiceEnabled(service as keyof ServiceConfig)
    );
  }
}

class ExternalIntegrationsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private serviceManager: ExternalServiceManager;

  constructor() {
    this.serviceManager = new ExternalServiceManager();
  }

  async getMarketData(category: string, location?: string): Promise<ExternalMarketData> {
    const cacheKey = `marketData_${category}_${location || 'global'}`;
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey)!;
      if (Date.now() - cachedData.timestamp < this.CACHE_TTL) {
        return cachedData.data;
      }
    }

    try {
      const promises = [];

      // Récupération des données seulement pour les services activés
      if (this.serviceManager.isServiceEnabled('freelancer')) {
        promises.push(this.getFreelancerMarketData(category));
      }

      if (this.serviceManager.isServiceEnabled('upwork')) {
        promises.push(this.getUpworkMarketData(category));
      }

      if (this.serviceManager.isServiceEnabled('googleTrends')) {
        promises.push(this.getGoogleTrendsData(category));
      }

      if (promises.length === 0) {
        console.log('Aucun service externe activé, utilisation fallback');
        return this.getFallbackMarketData(category);
      }

      const results = await Promise.allSettled(promises);
      const validData = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);

      const aggregatedData = this.aggregateMarketData(validData);
      this.cache.set(cacheKey, { data: aggregatedData, timestamp: Date.now() });
      return aggregatedData;
    } catch (error) {
      console.error('Erreur récupération données marché:', error);
      return this.getFallbackMarketData(category);
    }
  }

  private async getFreelancerMarketData(category: string) {
    if (!this.serviceManager.isServiceEnabled('freelancer')) {
      throw new Error('Freelancer API not enabled or configured');
    }

    const response = await fetch('https://www.freelancer.com/api/projects/0.1/projects/search', {
      headers: {
        'Authorization': `Bearer ${process.env.FREELANCER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      // Vous pourriez vouloir ajouter des paramètres de requête ici pour filtrer par catégorie
      // body: JSON.stringify({ keyword: category }) // Exemple, à adapter selon l'API Freelancer
    });

    if (!response.ok) throw new Error('Freelancer API error');
    const data = await response.json();

    // Adapter pour extraire les données pertinentes
    return {
      source: 'freelancer',
      averagePrice: this.extractAveragePrice(data.result.projects),
      projectCount: data.result.projects.length,
      category
    };
  }

  private async getUpworkMarketData(category: string) {
    if (!this.serviceManager.isServiceEnabled('upwork')) {
      throw new Error('Upwork API not enabled or configured');
    }

    // L'API Upwork nécessite une authentification OAuth2 plus complexe.
    // Ceci est un placeholder. Vous devrez implémenter la logique d'authentification Upwork.
    const response = await fetch(`https://www.upwork.com/api/jobs/v2/jobs?q=${category}`, {
      headers: {
        // L'authentification Upwork est plus complexe que juste une clé API
        // 'Authorization': `Bearer ${process.env.UPWORK_API_TOKEN}` // Exemple, à adapter
      }
    });

    if (!response.ok) throw new Error('Upwork API error');
    const data = await response.json();

    // Adapter pour extraire les données pertinentes
    return {
      source: 'upwork',
      averagePrice: this.extractAveragePrice(data.jobs), // Supposant une structure similaire
      projectCount: data.jobs.length,
      category
    };
  }

  private async getGoogleTrendsData(category: string) {
    if (!this.serviceManager.isServiceEnabled('googleTrends')) {
      throw new Error('Google Trends API not enabled or configured');
    }

    // Google Trends API n'est pas une API publique directe facile à utiliser via fetch.
    // Vous pourriez avoir besoin d'une bibliothèque cliente ou d'une approche différente.
    // Ce code est un placeholder.
    console.warn('Google Trends API access needs a specific implementation (e.g., google-trends package)');
    return {
      source: 'googleTrends',
      averagePrice: 0, // Placeholder
      projectCount: 0, // Placeholder
      trendingSkills: ['AI', 'Blockchain', 'Data Science'], // Placeholder
      category
    };
  }

  private aggregateMarketData(dataArray: any[]): ExternalMarketData {
    let totalAveragePrice = 0;
    let totalProjectCount = 0;
    const allTrendingSkills: string[] = [];
    const pricesByCategory: { [category: string]: number[] } = {};

    dataArray.forEach(data => {
      if (!data) return;

      if (data.averagePrice) {
        totalAveragePrice += data.averagePrice;
      }
      if (data.projectCount) {
        totalProjectCount += data.projectCount;
      }
      if (data.trendingSkills) {
        allTrendingSkills.push(...data.trendingSkills);
      }
      if (data.category && data.averagePrice) {
        if (!pricesByCategory[data.category]) {
          pricesByCategory[data.category] = [];
        }
        pricesByCategory[data.category].push(data.averagePrice);
      }
    });

    // Calculer le prix moyen par catégorie
    const averagePrices: { [category: string]: number } = {};
    for (const category in pricesByCategory) {
      const prices = pricesByCategory[category];
      averagePrices[category] = prices.reduce((a, b) => a + b, 0) / prices.length;
    }

    return {
      averagePrices,
      demandLevel: totalProjectCount > 100 ? 'high' : totalProjectCount > 50 ? 'medium' : 'low',
      competitionLevel: totalAveragePrice > 2000 ? 'high' : totalAveragePrice > 1000 ? 'medium' : 'low',
      trendingSkills: Array.from(new Set(allTrendingSkills)) // Supprimer les doublons
    };
  }

  private getFallbackMarketData(category: string): ExternalMarketData {
    // Données de secours si aucun service n'est disponible ou en cas d'erreur
    return {
      averagePrices: { [category]: 1500 },
      demandLevel: 'medium',
      competitionLevel: 'medium',
      trendingSkills: ['fallback', 'data']
    };
  }

  private async getFreelancerMarketData(category: string): Promise<{ source: string; averagePrice: number; projectCount: number; category: string }> {
    if (!this.serviceManager.isServiceEnabled('freelancer')) {
      throw new Error('Freelancer API not enabled or configured');
    }

    const response = await fetch('https://www.freelancer.com/api/projects/0.1/projects/search', {
      headers: {
        'Authorization': `Bearer ${process.env.FREELANCER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Freelancer API error');
    const data = await response.json();

    return {
      source: 'freelancer',
      averagePrice: this.extractAveragePrice(data.result.projects),
      projectCount: data.result.projects.length,
      category
    };
  }

  // Analyse sémantique avancée avec VERTEX AI (priorité)
  async performAdvancedSemanticAnalysis(text: string, context: string): Promise<any> {
    // PRIORISER VERTEX AI au lieu d'OpenAI
    if (!this.serviceManager.isServiceEnabled('googleCloudAI')) {
      console.warn('🔄 Vertex AI non configuré, utilisation analyse basique');
      return this.getBasicSemanticAnalysis(text);
    }

    try {
      console.log('🎯 Analyse sémantique via Vertex AI...');
      
      // Importer dynamiquement geminiCall pour utiliser Vertex AI
      const { geminiCall } = await import('./adapters/geminiAdapter.js');
      
      const prompt = {
        task: 'semantic_analysis',
        text: text,
        context: context,
        instructions: 'Analysez sémantiquement ce texte. Retournez un JSON avec: intention, complexité, compétences_requises, estimation_temps, niveau_expertise',
        format: 'json'
      };

      const response = await geminiCall('text_enhance', prompt);
      
      if (response.output && typeof response.output === 'object') {
        console.log('✅ Analyse sémantique Vertex AI réussie');
        return {
          ...response.output,
          source: 'vertex-ai',
          provider: 'google-cloud'
        };
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('❌ Erreur analyse sémantique Vertex AI:', error);
      return this.getBasicSemanticAnalysis(text);
    }
  }

  // Enrichissement profil entreprise
  async enrichCompanyProfile(domain: string): Promise<any> {
    if (!this.serviceManager.isServiceEnabled('clearbit')) {
      return { source: 'fallback', data: null };
    }

    try {
      const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`
        }
      });

      if (!response.ok) throw new Error('Clearbit API error');
      const data = await response.json();

      return {
        source: 'clearbit',
        company_info: {
          name: data.name,
          industry: data.category?.industry,
          size: data.metrics?.employees,
          location: data.geo?.city,
          tech_stack: data.tech || [],
          founded: data.foundedYear
        }
      };
    } catch (error) {
      console.error('Erreur enrichissement Clearbit:', error);
      return { source: 'fallback', data: null };
    }
  }

  // Validation email avec Hunter.io
  async validateEmail(email: string): Promise<any> {
    if (!this.serviceManager.isServiceEnabled('hunter')) {
      return { valid: true, confidence: 0.5, source: 'fallback' };
    }

    try {
      const response = await fetch(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`);

      if (!response.ok) throw new Error('Hunter API error');
      const data = await response.json();

      return {
        valid: data.data.result === 'deliverable',
        confidence: data.data.score / 100,
        source: 'hunter',
        details: data.data
      };
    } catch (error) {
      console.error('Erreur validation Hunter:', error);
      return { valid: true, confidence: 0.5, source: 'fallback' };
    }
  }

  // Méthodes fallback
  private getBasicSemanticAnalysis(text: string) {
    const words = text.toLowerCase().split(' ');
    const techKeywords = ['développement', 'web', 'mobile', 'api', 'base de données'];
    const complexity = techKeywords.filter(kw => words.includes(kw)).length;

    return {
      source: 'fallback',
      intention: 'création_projet',
      complexité: Math.min(10, complexity * 2 + 3),
      compétences_requises: techKeywords.filter(kw => words.includes(kw)),
      estimation_temps: Math.max(7, complexity * 3),
      niveau_expertise: complexity > 2 ? 'confirmé' : 'débutant'
    };
  }

  private extractAveragePrice(projects: any[]): number {
    if (!projects || projects.length === 0) return 1500;

    const prices = projects
      .filter(p => p.budget && p.budget.minimum)
      .map(p => (p.budget.minimum + (p.budget.maximum || p.budget.minimum)) / 2);

    return prices.length > 0 ?
      prices.reduce((a, b) => a + b, 0) / prices.length :
      1500;
  }

  // Status des services
  getServicesStatus(): any {
    const availableServices = this.serviceManager.getAvailableServices();

    return {
      total_services: 10,
      active_services: availableServices.length,
      available_services: availableServices,
      missing_credentials: this.getMissingCredentials(),
      fallback_mode: availableServices.length === 0
    };
  }

  private getMissingCredentials(): string[] {
    const missing = [];
    const services = ['freelancer', 'upwork', 'googleTrends', 'clearbit', 'hunter', 'linkedin', 'openai', 'anthropic', 'googleCloudAI'];

    services.forEach(service => {
      if (!this.serviceManager.isServiceEnabled(service as any)) {
        missing.push(service);
      }
    });

    return missing;
  }
}