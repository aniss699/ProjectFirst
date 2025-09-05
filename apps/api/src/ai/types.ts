export type AIPhase = 'pricing'|'brief_enhance'|'matching'|'scoring';

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
    provenance: 'auto'|'human_validated'|'ab_test_winner';
    created_at: string;
  };
}