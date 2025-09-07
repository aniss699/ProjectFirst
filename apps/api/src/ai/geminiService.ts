import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateContent(prompt: string): Promise<any> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        text: response.text(),
        success: true
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        text: '',
        success: false,
        error: error.message
      };
    }
  }

  async analyzeProject(projectData: any): Promise<any> {
    const prompt = `Analyze this project and provide structured feedback: ${JSON.stringify(projectData)}`;
    
    try {
      const result = await this.generateContent(prompt);
      return {
        analysis: result.text,
        score: Math.random() * 100, // Placeholder scoring
        suggestions: ['Improve project description', 'Add more details about requirements']
      };
    } catch (error) {
      return {
        analysis: 'Analysis unavailable',
        score: 50,
        suggestions: ['Manual review recommended']
      };
    }
  }

  async enhanceDescription(description: string): Promise<string> {
    const prompt = `Improve this project description to be more clear and professional: ${description}`;
    
    try {
      const result = await this.generateContent(prompt);
      return result.text || description;
    } catch (error) {
      console.error('Description enhancement failed:', error);
      return description;
    }
  }

  async suggestPricing(projectData: any): Promise<any> {
    const prompt = `Suggest pricing for this project: ${JSON.stringify(projectData)}`;
    
    try {
      const result = await this.generateContent(prompt);
      return {
        min: projectData.budget * 0.8,
        recommended: projectData.budget,
        max: projectData.budget * 1.2,
        reasoning: result.text || 'Based on project complexity and market rates'
      };
    } catch (error) {
      return {
        min: projectData.budget * 0.8,
        recommended: projectData.budget,
        max: projectData.budget * 1.2,
        reasoning: 'Fallback pricing based on project budget'
      };
    }
  }
}