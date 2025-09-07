
export interface VertexAIConfig {
  projectId: string;
  location: string;
  credentials: any;
  modelName: string;
  isReady: boolean;
}

export class VertexAIConfigManager {
  private static instance: VertexAIConfigManager;
  private config: VertexAIConfig | null = null;

  static getInstance(): VertexAIConfigManager {
    if (!VertexAIConfigManager.instance) {
      VertexAIConfigManager.instance = new VertexAIConfigManager();
    }
    return VertexAIConfigManager.instance;
  }

  getConfig(): VertexAIConfig {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config;
  }

  private loadConfig(): VertexAIConfig {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'europe-west1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!projectId || !credentialsJson) {
      console.error('🚨 VERTEX AI CONFIGURATION INCOMPLÈTE');
      throw new Error('Vertex AI configuration incomplète. Variables requises: GOOGLE_CLOUD_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS_JSON');
    }

    let credentials: any;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (error) {
      throw new Error(`Format JSON des credentials Vertex AI invalide: ${error.message}`);
    }

    console.log('✅ Configuration Vertex AI chargée:', {
      projectId,
      location,
      modelName,
      credentialsType: credentials.type
    });

    return {
      projectId,
      location,
      credentials,
      modelName,
      isReady: true
    };
  }

  validateConfig(): boolean {
    try {
      const config = this.getConfig();
      return config.isReady;
    } catch (error) {
      console.error('❌ Validation Vertex AI échouée:', error.message);
      return false;
    }
  }

  getEndpoint(model?: string): string {
    const config = this.getConfig();
    const modelToUse = model || config.modelName;
    return `projects/${config.projectId}/locations/${config.location}/publishers/google/models/${modelToUse}`;
  }
}

export const vertexAIConfig = VertexAIConfigManager.getInstance();
