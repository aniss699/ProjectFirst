/**
 * Moteur d'apprentissage - SUPPRIMÉ après simplification
 * L'apprentissage automatique complexe a été remplacé par des règles fixes
 * @deprecated Plus de ML/AI learning - système basé règles simples
 */

console.warn('⚠️ AI Learning Engine supprimé - système simplifié sans apprentissage automatique');

// Pas d'apprentissage dans le système simplifié
export class SimpleLearningEngine {
  async analyzePastInteractions(): Promise<void> {
    console.log('📚 Learning désactivé - système basé sur règles fixes');
  }

  async recordInteraction(): Promise<void> {
    console.log('📝 Pas d\'enregistrement d\'interaction - apprentissage désactivé');
  }

  async getInsights(): Promise<any[]> {
    return []; // Pas d'insights dans le système simple
  }

  async improveRecommendations(): Promise<void> {
    console.log('🎯 Recommandations basées sur règles fixes - pas d\'amélioration ML');
  }
}

export const aiLearningEngine = new SimpleLearningEngine();
export default aiLearningEngine;