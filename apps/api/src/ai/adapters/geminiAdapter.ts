
import { UnifiedAIOutput, AIPhase } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function geminiCall(phase: AIPhase, prompt: any): Promise<UnifiedAIOutput> {
  const t0 = Date.now();
  
  // Configuration Gemini API uniquement
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  console.log('🎯 Initialisation Gemini API...');
  
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  console.log('📡 Envoi requête Gemini API...');
  
  let text: string;
  try {
    const result = await model.generateContent(JSON.stringify(prompt));
    const response = await result.response;
    text = response.text();
    
    if (!text) {
      throw new Error('Réponse vide de Gemini API');
    }
    
    console.log('✅ Réponse Gemini API reçue avec succès');
    
  } catch (geminiError) {
    console.error('🚨 ERREUR GEMINI API:', geminiError);
    throw new Error(`Gemini API échoué: ${geminiError.message}`);
  }

  let parsed: any;
  try { 
    parsed = JSON.parse(text); 
  } catch { 
    parsed = { raw: text }; 
  }

  const latency = Date.now() - t0;

  const out: UnifiedAIOutput = {
    phase,
    model_family: 'gemini',
    model_name: 'gemini-1.5-flash',
    input_redacted: {},
    output: parsed,
    quality: { latency_ms: latency },
    meta: {
      provider: 'gemini-api',
      allow_training: false,
      provenance: 'gemini-api-direct',
      created_at: new Date().toISOString()
    }
  };
  return out;
}
