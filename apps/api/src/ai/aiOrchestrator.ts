import { AIPhase, UnifiedAIOutput } from './types';
import { ShadowLogger } from './shadow-logger';
import { prismaSink } from './persisters/prismaSink';
import { geminiCall } from './adapters/geminiAdapter';

const logger = new ShadowLogger(prismaSink);

// TODO: brancher ici les futurs modèles locaux (.onnx) si disponibles
async function tryLocalPricing(prompt:any): Promise<UnifiedAIOutput|null> {
  return null; // placeholder: retournera un UnifiedAIOutput avec model_family 'local'
}

export async function getPricingSuggestion(prompt:any){
  // 1) Essaie modèle local étroit
  const local = await tryLocalPricing(prompt);
  if (local) {
    await logger.log({ ...local, prompt, user_feedback: undefined });
    return local.output;
  }

  // 2) Fallback provider (Gemini)
  const ext = await geminiCall('pricing', prompt);
  await logger.log({ ...ext, prompt, user_feedback: undefined });
  return ext.output;
}

export async function enhanceBrief(prompt:any){
  const ext = await geminiCall('brief_enhance', prompt);
  await logger.log({ ...ext, prompt, user_feedback: undefined });
  return ext.output;
}

export async function logUserFeedback(phase:AIPhase, prompt:any, feedback:{accepted?:boolean;rating?:number;edits?:string}){
  // Log dédié (événement supplémentaire)
  const fb: UnifiedAIOutput = {
    phase,
    model_family: 'local',
    model_name: 'feedback-only',
    input_redacted: {},
    output: { note: 'feedback' },
    meta: { provider:'user', allow_training:true, provenance:'human_validated', created_at:new Date().toISOString() }
  };
  await logger.log({ ...fb, prompt, user_feedback: feedback });
}