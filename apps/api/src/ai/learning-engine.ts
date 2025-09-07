
/**
 * Moteur d'apprentissage automatique - SwipDEAL AI
 * Apprend des réponses de Gemini pour améliorer les suggestions futures
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { aiEvents } from '../../../../shared/schema.js';
import { desc, eq, and, gte } from 'drizzle-orm';

interface LearningPattern {
  input_pattern: string;
  successful_output: string;
  context_category: string;
  user_feedback: 'positive' | 'negative' | 'neutral';
  confidence_score: number;
  usage_count: number;
}

interface LearningInsight {
  pattern_type: 'enhancement' | 'pricing' | 'matching';
  improvement_suggestion: string;
  confidence: number;
  based_on_samples: number;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

export class AILearningEngine {
  private patterns: Map<string, LearningPattern> = new Map();
  private insights: LearningInsight[] = [];

  /**
   * Analyse les interactions passées avec Gemini pour identifier les patterns de succès
   */
  async analyzePastInteractions(limit: number = 1000): Promise<void> {
    try {
      console.log('🧠 Début de l\'analyse des patterns d\'apprentissage...');
      
      // Récupérer les interactions récentes
      const recentInteractions = await db.select()
        .from(aiEvents)
        .where(and(
          eq(aiEvents.provider, 'gemini-api'),
          gte(aiEvents.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 jours
        ))
        .orderBy(desc(aiEvents.created_at))
        .limit(limit);

      console.log(`📊 Analyse de ${recentInteractions.length} interactions Gemini`);

      // Analyser chaque interaction
      for (const interaction of recentInteractions) {
        await this.processInteraction(interaction);
      }

      // Générer des insights
      this.generateLearningInsights();

      console.log(`✅ Apprentissage terminé: ${this.patterns.size} patterns identifiés`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'apprentissage:', error);
    }
  }

  /**
   * Traite une interaction individuelle pour extraire des patterns
   */
  private async processInteraction(interaction: any): Promise<void> {
    try {
      const inputData = interaction.input_redacted || {};
      const output = interaction.output;
      const userFeedback = interaction.accepted ? 'positive' : 'neutral';
      
      if (!output || !inputData.prompt) return;

      // Extraire le pattern d'entrée (texte original)
      const inputPattern = this.extractPattern(inputData.prompt);
      if (!inputPattern) return;

      // Extraire la réponse Gemini nettoyée
      const cleanOutput = this.cleanGeminiOutput(output);
      
      // Créer ou mettre à jour le pattern
      const patternKey = this.generatePatternKey(inputPattern, interaction.phase);
      
      if (this.patterns.has(patternKey)) {
        const existing = this.patterns.get(patternKey)!;
        existing.usage_count++;
        existing.confidence_score = this.calculateConfidence(existing);
        
        // Si la nouvelle réponse semble meilleure
        if (userFeedback === 'positive' && cleanOutput.length > existing.successful_output.length) {
          existing.successful_output = cleanOutput;
        }
      } else {
        this.patterns.set(patternKey, {
          input_pattern: inputPattern,
          successful_output: cleanOutput,
          context_category: this.detectCategory(inputData.prompt),
          user_feedback: userFeedback,
          confidence_score: userFeedback === 'positive' ? 0.8 : 0.6,
          usage_count: 1
        });
      }

    } catch (error) {
      console.error('❌ Erreur traitement interaction:', error);
    }
  }

  /**
   * Génère des suggestions améliorées basées sur l'apprentissage
   */
  async generateImprovedSuggestion(
    inputText: string,
    fieldType: string,
    category?: string
  ): Promise<string | null> {
    
    const inputPattern = this.extractPattern(inputText);
    const patternKey = this.generatePatternKey(inputPattern, fieldType);
    
    // Chercher un pattern exact d'abord
    if (this.patterns.has(patternKey)) {
      const pattern = this.patterns.get(patternKey)!;
      if (pattern.confidence_score > 0.7) {
        console.log(`🎯 Pattern trouvé (confiance: ${pattern.confidence_score})`);
        return this.adaptPattern(pattern.successful_output, inputText);
      }
    }

    // Chercher des patterns similaires
    const similarPatterns = this.findSimilarPatterns(inputPattern, fieldType);
    if (similarPatterns.length > 0) {
      const bestPattern = similarPatterns[0];
      console.log(`🔍 Pattern similaire trouvé (confiance: ${bestPattern.confidence_score})`);
      return this.adaptPattern(bestPattern.successful_output, inputText);
    }

    return null; // Pas de pattern trouvé, utiliser Gemini
  }

  /**
   * Apprend d'une nouvelle réponse Gemini réussie
   */
  async learnFromSuccess(
    inputText: string,
    geminiOutput: string,
    fieldType: string,
    category?: string,
    userFeedback: 'positive' | 'negative' | 'neutral' = 'neutral'
  ): Promise<void> {
    const inputPattern = this.extractPattern(inputText);
    const patternKey = this.generatePatternKey(inputPattern, fieldType);
    const cleanOutput = this.cleanGeminiOutput(geminiOutput);

    if (this.patterns.has(patternKey)) {
      const existing = this.patterns.get(patternKey)!;
      existing.usage_count++;
      existing.user_feedback = userFeedback;
      existing.confidence_score = this.calculateConfidence(existing);
      
      // Améliorer la réponse si c'est un feedback positif
      if (userFeedback === 'positive') {
        existing.successful_output = cleanOutput;
      }
    } else {
      this.patterns.set(patternKey, {
        input_pattern: inputPattern,
        successful_output: cleanOutput,
        context_category: category || this.detectCategory(inputText),
        user_feedback: userFeedback,
        confidence_score: userFeedback === 'positive' ? 0.8 : 0.6,
        usage_count: 1
      });
    }

    console.log(`📚 Nouveau pattern appris: ${patternKey}`);
  }

  /**
   * Nettoyage des réponses Gemini (enlever JSON wrapper, etc.)
   */
  private cleanGeminiOutput(output: string): string {
    let cleaned = output;
    
    // Enlever les wrappers JSON si présents
    if (cleaned.includes('```json')) {
      const match = cleaned.match(/```json\s*\{\s*"enhancedText":\s*"([^"]+)"/);
      if (match) {
        cleaned = match[1];
      }
    }
    
    // Enlever les caractères d'échappement
    cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    
    return cleaned.trim();
  }

  private extractPattern(text: string): string {
    // Extraire les mots-clés principaux (max 5 mots)
    return text.toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5)
      .join(' ');
  }

  private generatePatternKey(pattern: string, type: string): string {
    return `${type}:${pattern}`;
  }

  private detectCategory(text: string): string {
    const categories = {
      'développement': ['site', 'web', 'app', 'code', 'javascript'],
      'design': ['logo', 'graphique', 'design', 'ui', 'ux'],
      'travaux': ['peinture', 'travaux', 'rénovation', 'construction'],
      'marketing': ['marketing', 'pub', 'seo', 'social'],
      'rédaction': ['article', 'contenu', 'texte', 'blog']
    };

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => text.toLowerCase().includes(kw))) {
        return cat;
      }
    }
    
    return 'général';
  }

  private calculateConfidence(pattern: LearningPattern): number {
    let confidence = 0.5; // Base
    
    // Plus d'utilisation = plus de confiance
    confidence += Math.min(0.3, pattern.usage_count * 0.05);
    
    // Feedback positif augmente la confiance
    if (pattern.user_feedback === 'positive') confidence += 0.2;
    if (pattern.user_feedback === 'negative') confidence -= 0.3;
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private findSimilarPatterns(inputPattern: string, fieldType: string): LearningPattern[] {
    const similar: Array<LearningPattern & { similarity: number }> = [];
    const inputWords = inputPattern.split(' ');

    for (const [key, pattern] of this.patterns) {
      if (!key.startsWith(fieldType)) continue;
      
      const patternWords = pattern.input_pattern.split(' ');
      const commonWords = inputWords.filter(word => patternWords.includes(word));
      const similarity = commonWords.length / Math.max(inputWords.length, patternWords.length);
      
      if (similarity > 0.3) {
        similar.push({ ...pattern, similarity });
      }
    }

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  private adaptPattern(patternOutput: string, newInput: string): string {
    // Adaptation basique du pattern à la nouvelle entrée
    return patternOutput.replace(/\[CONTEXTE\]/g, newInput.substring(0, 50));
  }

  private generateLearningInsights(): void {
    this.insights = [];

    // Analyser les patterns par catégorie
    const categoryStats = new Map<string, { count: number, avgConfidence: number }>();
    
    for (const pattern of this.patterns.values()) {
      const cat = pattern.context_category;
      if (categoryStats.has(cat)) {
        const stats = categoryStats.get(cat)!;
        stats.count++;
        stats.avgConfidence = (stats.avgConfidence + pattern.confidence_score) / 2;
      } else {
        categoryStats.set(cat, { count: 1, avgConfidence: pattern.confidence_score });
      }
    }

    // Générer des insights
    for (const [category, stats] of categoryStats) {
      if (stats.count > 5 && stats.avgConfidence > 0.7) {
        this.insights.push({
          pattern_type: 'enhancement',
          improvement_suggestion: `Catégorie ${category}: ${stats.count} patterns fiables identifiés`,
          confidence: stats.avgConfidence,
          based_on_samples: stats.count
        });
      }
    }
  }

  /**
   * API publique pour obtenir les statistiques d'apprentissage
   */
  getLearningStats() {
    return {
      total_patterns: this.patterns.size,
      insights_generated: this.insights.length,
      high_confidence_patterns: Array.from(this.patterns.values())
        .filter(p => p.confidence_score > 0.8).length,
      categories_learned: [...new Set(Array.from(this.patterns.values())
        .map(p => p.context_category))].length
    };
  }
}

export const aiLearningEngine = new AILearningEngine();
