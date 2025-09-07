import { UnifiedAIOutput, AIPhase } from '../types';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { GoogleGenerativeAI } from '@google/generative-ai';
import policy from '../providers/policy.google.json' with { type: 'json' };

export async function geminiCall(phase: AIPhase, prompt:any) : Promise<UnifiedAIOutput> {
  const t0 = Date.now();
  
  // Utilise Vertex AI si les variables d'environnement sont configurées
  const useVertexAI = process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_LOCATION;
  console.log('🔍 Vertex AI config check:', {
    projectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: !!process.env.GOOGLE_CLOUD_LOCATION,
    credentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    useVertexAI
  });
  
  let text: string;
  let modelName: string;
  
  if (useVertexAI) {
    // Configuration Vertex AI
    let clientConfig: any = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    };
    
    // Si les credentials JSON sont fournis, les utiliser
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        clientConfig.credentials = credentials;
      } catch (error) {
        console.error('Erreur parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
      }
    }
    
    const client = new PredictionServiceClient(clientConfig);
    
    modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const endpoint = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}/publishers/google/models/${modelName}`;
    
    const instanceValue = {
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(prompt) }]}]
    };
    
    const parameter = {
      candidateCount: 1,
      maxOutputTokens: 8192,
      temperature: 0.1,
      responseMimeType: 'application/json'
    };
    
    const request = {
      endpoint,
      instances: [instanceValue],
      parameters: parameter,
    };
    
    const [response] = await client.predict(request);
    text = response.predictions?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    // Fallback vers l'API Gemini standard seulement si clé API disponible
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Aucune configuration AI disponible. Configurez Vertex AI ou une clé API Gemini.');
    }
    
    console.log('⚠️ Fallback vers API Gemini standard');
    const genai = new GoogleGenerativeAI(apiKey);
    modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genai.getGenerativeModel({ model: modelName });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(prompt) }]}],
      generationConfig: { responseMimeType: 'application/json' }
    });

    text = response.response.text();
  }

  let parsed:any;
  try { parsed = JSON.parse(text); } catch { parsed = { raw:text }; }

  const latency = Date.now() - t0;

  const out: UnifiedAIOutput = {
    phase,
    model_family: 'gemini',
    model_name: modelName,
    input_redacted: {}, // sera rempli par le logger après redaction
    output: parsed,
    quality: { latency_ms: latency },
    meta: {
      provider: useVertexAI ? 'vertex-ai' : 'google',
      allow_training: !!policy.allow_training,
      provenance: 'auto',
      created_at: new Date().toISOString()
    }
  };
  return out;
}