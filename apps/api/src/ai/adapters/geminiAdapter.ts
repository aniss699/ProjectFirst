import { UnifiedAIOutput, AIPhase } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import policy from '../providers/policy.google.json' with { type: 'json' };

export async function geminiCall(phase: AIPhase, prompt:any) : Promise<UnifiedAIOutput> {
  const t0 = Date.now();
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  // Choisis le modèle existant du projet (ex: "gemini-2.5-flash") et JSON mode si dispo
  const model = genai.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(prompt) }]}],
    generationConfig: { responseMimeType: 'application/json' }
  });

  const text = response.response.text();
  let parsed:any;
  try { parsed = JSON.parse(text); } catch { parsed = { raw:text }; }

  const latency = Date.now() - t0;

  const out: UnifiedAIOutput = {
    phase,
    model_family: 'gemini',
    model_name: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    input_redacted: {}, // sera rempli par le logger après redaction
    output: parsed,
    quality: { latency_ms: latency },
    meta: {
      provider: 'google',
      allow_training: !!policy.allow_training,
      provenance: 'auto',
      created_at: new Date().toISOString()
    }
  };
  return out;
}