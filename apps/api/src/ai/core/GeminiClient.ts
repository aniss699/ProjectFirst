/**
 * Client Gemini unifié
 * Fusion de geminiService.ts et geminiAdapter.ts pour éliminer la duplication
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig } from './AIConfig';
import { aiCache } from './AICache';
import { AIPhase, UnifiedAIOutput } from '../types';

export interface GeminiRequest {
  prompt: string | any;
  phase?: AIPhase;
  options?: {
    temperature?: number;
    maxTokens?: number;
    useCache?: boolean;
    customTtl?: number;
  };
}

export interface GeminiResponse {
  text: string;
  parsed?: any;
  success: boolean;
  latency: number;
  fromCache: boolean;
  error?: string;
}

export class GeminiClient {
  private static instance: GeminiClient;
  private client?: GoogleGenerativeAI;
  private model?: any;
  private initialized = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  /**
   * Initialisation paresseuse du client Gemini
   */
  private initialize(): void {
    if (!aiConfig.gemini.enabled || !aiConfig.gemini.apiKey) {
      console.warn('Gemini client not initialized: missing API key or disabled');
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(aiConfig.gemini.apiKey!);
      this.model = this.client.getGenerativeModel({ 
        model: aiConfig.gemini.model! 
      });
      this.initialized = true;
      console.log('✅ Gemini client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini client:', error);
    }
  }

  /**
   * Génération de contenu avec gestion complète des erreurs et cache
   */
  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    if (!this.initialized || !this.client || !this.model) {
      throw new Error('Gemini client not initialized');
    }

    // Construction de la clé de cache
    const cacheKey = `gemini_${JSON.stringify(request.prompt)}_${request.phase || 'default'}`;
    
    // Utilisation du cache si activé
    if (request.options?.useCache !== false) {
      try {
        return await aiCache.getCachedOrFetch(
          cacheKey,
          () => this.performRequest(request, startTime),
          request.options?.customTtl
        );
      } catch (error) {
        console.error('🚨 Gemini API request failed:', error);
        throw new Error(`Gemini API failed: ${(error as Error).message}`);
      }
    }

    // Requête directe sans cache
    return this.performRequest(request, startTime);
  }

  /**
   * Exécution de la requête Gemini
   */
  private async performRequest(request: GeminiRequest, startTime: number): Promise<GeminiResponse> {
    try {
      console.log('🎯 Sending Gemini API request...');
      
      const prompt = typeof request.prompt === 'string' 
        ? request.prompt 
        : JSON.stringify(request.prompt);

      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('✅ Gemini API response received successfully');

      // Tentative de parsing JSON
      let parsed: any;
      try {
        parsed = JSON.parse(text);
        console.log('✅ Gemini response parsed as JSON');
      } catch {
        console.log('📝 Gemini response in plain text format');
        parsed = text;
      }

      const latency = Date.now() - startTime;

      return {
        text,
        parsed,
        success: true,
        latency,
        fromCache: false
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('🚨 Gemini API error:', error);
      
      return {
        text: '',
        success: false,
        latency,
        fromCache: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Appel compatible avec l'ancien geminiAdapter
   */
  async geminiCall(phase: AIPhase, prompt: any): Promise<UnifiedAIOutput> {
    const response = await this.generateContent({
      prompt,
      phase,
      options: { useCache: true }
    });

    if (!response.success) {
      throw new Error(response.error || 'Gemini API failed');
    }

    return {
      phase,
      model_family: 'gemini',
      model_name: aiConfig.gemini.model!,
      input_redacted: {},
      output: response.parsed,
      quality: { latency_ms: response.latency },
      meta: {
        provider: 'gemini-api',
        allow_training: false,
        provenance: 'gemini-api-direct',
        created_at: new Date().toISOString()
      }
    };
  }

  /**
   * Méthodes compatibles avec l'ancien GeminiService
   */
  async analyzeProject(projectData: any): Promise<any> {
    const prompt = `Analyze this project and provide structured feedback: ${JSON.stringify(projectData)}`;
    
    const response = await this.generateContent({
      prompt,
      phase: 'analysis',
      options: { useCache: true }
    });

    if (!response.success) {
      return {
        analysis: 'Analysis unavailable',
        score: 50,
        suggestions: ['Manual review recommended']
      };
    }

    return {
      analysis: response.text,
      score: Math.random() * 100, // Placeholder scoring
      suggestions: ['Improve project description', 'Add more details about requirements']
    };
  }

  async enhanceDescription(description: string): Promise<string> {
    const prompt = `Improve this project description to be more clear and professional: ${description}`;
    
    const response = await this.generateContent({
      prompt,
      phase: 'enhancement',
      options: { useCache: true }
    });

    return response.success ? response.text : description;
  }

  async suggestPricing(projectData: any): Promise<any> {
    const prompt = `Suggest pricing for this project: ${JSON.stringify(projectData)}`;
    
    const response = await this.generateContent({
      prompt,
      phase: 'pricing',
      options: { useCache: true }
    });

    const fallbackPricing = {
      min: projectData.budget * 0.8,
      recommended: projectData.budget,
      max: projectData.budget * 1.2,
      reasoning: 'Fallback pricing based on project budget'
    };

    if (!response.success) {
      return fallbackPricing;
    }

    return {
      min: projectData.budget * 0.8,
      recommended: projectData.budget,
      max: projectData.budget * 1.2,
      reasoning: response.text || fallbackPricing.reasoning
    };
  }

  /**
   * Vérification de l'état du client
   */
  isReady(): boolean {
    return this.initialized && !!this.client && !!this.model;
  }

  /**
   * Statistiques du client
   */
  getStats() {
    return {
      initialized: this.initialized,
      ready: this.isReady(),
      config: {
        enabled: aiConfig.gemini.enabled,
        model: aiConfig.gemini.model,
        timeout: aiConfig.gemini.timeout
      }
    };
  }
}

export const geminiClient = GeminiClient.getInstance();