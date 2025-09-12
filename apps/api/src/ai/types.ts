// Extended AI phases to cover all use cases
export type AIPhase = 'pricing'|'brief_enhance'|'matching'|'scoring'|'prediction'|'analysis'|'enhancement'|'negotiation'|'text_enhance'|'brief_analysis'|'standardization'|'learning_analysis'|'meta_learning_analysis';

// Enhanced provenance types for GeminiClient compatibility
export type AIProvenance = 'auto'|'human_validated'|'ab_test_winner'|'gemini-api-direct'|'api-direct';

export interface UnifiedAIOutput {
  phase: AIPhase;
  model_family: 'gemini'|'openai'|'local'|'other';
  model_name: string;
  input_redacted: any;            // prompt/params nettoyés PII
  output: any;                    // structuré selon la phase
  quality?: { confidence?: number; tokens?: number; latency_ms?: number };
  meta: {
    provider: string;             // 'google'|'openai'|...
    allow_training: boolean;      // filtrage légal/CGU par provider
    provenance: AIProvenance;
    created_at: string;
  };
}

// Interface contracts for dynamic imports - Hardening security
export interface IStandardizationEngine {
  standardizeProject(data: any): Promise<any>;
}

export interface INeuralPredictionEngine {
  predict(data: any): Promise<any>;
  predictWithGemini?(data: any): Promise<any>; // Optional for legacy compatibility
}

export interface ISmartBriefAnalyzer {
  analyzeBrief?(data: any): Promise<any>;
  smartBriefAnalyzer?: ISmartBriefAnalyzer; // Nested interface for export pattern
}

export interface IPriceNegotiationEngine {
  negotiatePrice?(data: any): Promise<any>;
  priceNegotiationEngine?: IPriceNegotiationEngine;
}

export interface IBehaviorAnalysisEngine {
  analyzeUserBehavior?(data: any): Promise<any>;
  behaviorAnalysisEngine?: IBehaviorAnalysisEngine;
}

export interface ITrustScoringEngine {
  calculateTrustScore?(data: any): Promise<any>;
}

// Export metric types for orchestrator
export interface AIEngineMetrics {
  requests: number;
  successes: number;
  failures: number;
  avgResponseTime: number;
  lastError?: string;
}

// ExecutionPhase for AIOrchestrator 
export type ExecutionPhase = 'pricing' | 'matching' | 'prediction' | 'analysis' | 'enhancement' | 'standardization' | 'scoring' | 'negotiation' | 'brief_analysis';