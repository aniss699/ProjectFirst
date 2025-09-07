import { UnifiedAIOutput, AIPhase } from '../types';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { GoogleGenerativeAI } from '@google/generative-ai';
import policy from '../providers/policy.google.json' with { type: 'json' };

export async function geminiCall(phase: AIPhase, prompt:any) : Promise<UnifiedAIOutput> {
  const t0 = Date.now();
  
  // Vérification complète de la configuration Vertex AI
  const hasProjectId = !!process.env.GOOGLE_CLOUD_PROJECT_ID;
  const hasLocation = !!process.env.GOOGLE_CLOUD_LOCATION;
  const hasCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const useVertexAI = hasProjectId && hasLocation && hasCredentials;
  
  console.log('🔍 Vertex AI config check:', {
    projectId: hasProjectId ? 'configured' : 'MISSING',
    location: hasLocation ? process.env.GOOGLE_CLOUD_LOCATION : 'MISSING',
    credentials: hasCredentials ? 'configured' : 'MISSING',
    useVertexAI: useVertexAI ? 'YES' : 'NO'
  });
  
  if (!hasProjectId) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID manquant dans les secrets');
  }
  if (!hasLocation) {
    console.error('❌ GOOGLE_CLOUD_LOCATION manquant dans les secrets');
  }
  if (!hasCredentials) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS_JSON manquant dans les secrets');
  }
  
  let text: string;
  let modelName: string;
  
  if (useVertexAI) {
    try {
      console.log('🚀 Initialisation Vertex AI...');
      
      // Configuration Vertex AI
      let clientConfig: any = {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        location: process.env.GOOGLE_CLOUD_LOCATION || 'europe-west1'
      };
      
      // Parse et validation des credentials
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
        clientConfig.credentials = credentials;
        console.log('✅ Credentials Vertex AI parsés avec succès');
      } catch (credError) {
        console.error('❌ Erreur parsing credentials:', credError);
        throw new Error('Format JSON des credentials invalide');
      }
      
      const client = new PredictionServiceClient(clientConfig);
      
      modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const location = process.env.GOOGLE_CLOUD_LOCATION || 'europe-west1';
      const endpoint = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/${location}/publishers/google/models/${modelName}`;
      
      console.log(`🎯 Endpoint Vertex AI: ${endpoint}`);
      
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
      
      console.log('📡 Envoi requête Vertex AI...');
      const [response] = await client.predict(request);
      text = response.predictions?.[0]?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        throw new Error('Réponse vide de Vertex AI');
      }
      
      console.log('✅ Réponse Vertex AI reçue');
      
    } catch (vertexError) {
      console.error('❌ Erreur Vertex AI:', vertexError);
      
      // Fallback vers API Gemini standard si disponible
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(`Vertex AI échoué et aucune clé API Gemini disponible: ${vertexError.message}`);
      }
      
      console.log('⚠️ Fallback vers API Gemini standard à cause de l\'erreur Vertex AI');
      const genai = new GoogleGenerativeAI(apiKey);
      modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genai.getGenerativeModel({ model: modelName });

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(prompt) }]}],
        generationConfig: { responseMimeType: 'application/json' }
      });

      text = response.response.text();
    }
  } else {
    // Configuration manquante - essayer fallback API Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Aucune configuration AI disponible. Configurez Vertex AI (GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_LOCATION, GOOGLE_APPLICATION_CREDENTIALS_JSON) ou une clé API Gemini (GEMINI_API_KEY).');
    }
    
    console.log('⚠️ Configuration Vertex AI incomplète - utilisation API Gemini standard');
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