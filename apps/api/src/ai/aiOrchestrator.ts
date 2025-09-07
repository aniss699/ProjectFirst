
// AI Orchestrator - Fonctions principales pour la gestion IA
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Types
interface PricingSuggestionRequest {
  category?: string;
  description?: string;
  budget?: string;
  timeline?: string;
}

interface BriefEnhancementRequest {
  title?: string;
  description?: string;
  category?: string;
}

// Fonction de suggestion de prix
export async function getPricingSuggestion(request: PricingSuggestionRequest) {
  try {
    // Simulation de calcul de prix basé sur la catégorie et description
    const basePrice = calculateBasePrice(request.category || 'general');
    const complexity = analyzeComplexity(request.description || '');
    const timelineMultiplier = getTimelineMultiplier(request.timeline || '');
    
    const minPrice = Math.round(basePrice * complexity * 0.8);
    const maxPrice = Math.round(basePrice * complexity * timelineMultiplier * 1.3);
    const averagePrice = Math.round((minPrice + maxPrice) / 2);

    return {
      success: true,
      pricing: {
        minPrice,
        maxPrice,
        averagePrice,
        confidence: 0.85,
        factors: [
          `Catégorie: ${request.category}`,
          `Complexité: ${complexity}x`,
          `Délai: ${timelineMultiplier}x`
        ]
      },
      analysis: {
        category: request.category,
        complexity_level: complexity > 1.5 ? 'high' : complexity > 1.0 ? 'medium' : 'low',
        market_position: 'competitive'
      }
    };
  } catch (error) {
    console.error('Erreur getPricingSuggestion:', error);
    throw new Error('Impossible de calculer la suggestion de prix');
  }
}

// Fonction d'amélioration de brief
export async function enhanceBrief(request: BriefEnhancementRequest) {
  try {
    const originalDescription = request.description || '';
    const category = request.category || 'general';
    
    // Analyse du brief actuel
    const analysis = analyzeBriefQuality(originalDescription);
    
    // Génération d'améliorations
    const improvements = generateImprovements(originalDescription, category, analysis);
    
    return {
      success: true,
      original: {
        title: request.title,
        description: originalDescription,
        word_count: originalDescription.split(' ').length
      },
      enhanced: {
        title: improveTitle(request.title || '', category),
        description: improvements.enhanced_description,
        word_count: improvements.enhanced_description.split(' ').length
      },
      analysis: {
        quality_score: analysis.score,
        missing_elements: analysis.missing,
        improvements_applied: improvements.changes
      },
      suggestions: improvements.suggestions
    };
  } catch (error) {
    console.error('Erreur enhanceBrief:', error);
    throw new Error('Impossible d\'améliorer le brief');
  }
}

// Fonction de logging des feedbacks
export async function logUserFeedback(phase: string, prompt: string, feedback: any) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      phase,
      prompt,
      feedback,
      user_session: 'anonymous'
    };

    // Créer le dossier logs s'il n'existe pas
    const logsDir = join(process.cwd(), 'logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }

    // Écrire le log
    const logFile = join(logsDir, `ai-feedback-${new Date().toISOString().split('T')[0]}.json`);
    const logs = [];
    
    try {
      const existingLogs = require(logFile);
      logs.push(...existingLogs);
    } catch {
      // Fichier n'existe pas encore
    }
    
    logs.push(logEntry);
    writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    console.log(`✅ Feedback logged: ${phase}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur logUserFeedback:', error);
    throw new Error('Impossible d\'enregistrer le feedback');
  }
}

// Fonctions utilitaires
function calculateBasePrice(category: string): number {
  const basePrices = {
    'development': 5000,
    'design': 2500,
    'marketing': 3000,
    'consulting': 4000,
    'writing': 1500,
    'general': 3000
  };
  return basePrices[category as keyof typeof basePrices] || basePrices.general;
}

function analyzeComplexity(description: string): number {
  const complexityKeywords = [
    'complex', 'advanced', 'enterprise', 'scalable', 'integration',
    'API', 'database', 'real-time', 'mobile', 'responsive'
  ];
  
  const found = complexityKeywords.filter(keyword => 
    description.toLowerCase().includes(keyword)
  ).length;
  
  return Math.max(0.8, Math.min(2.0, 1.0 + (found * 0.2)));
}

function getTimelineMultiplier(timeline: string): number {
  if (timeline.includes('urgent') || timeline.includes('asap')) return 1.5;
  if (timeline.includes('semaine')) return 1.3;
  if (timeline.includes('mois')) return 1.0;
  return 1.1;
}

function analyzeBriefQuality(description: string) {
  const words = description.split(' ').length;
  const hasBudget = /budget|prix|coût|\€|\$/.test(description.toLowerCase());
  const hasTimeline = /délai|semaine|mois|urgent/.test(description.toLowerCase());
  const hasObjectives = /objectif|but|résultat/.test(description.toLowerCase());
  
  const score = Math.min(1.0, 
    (words / 100) * 0.4 + 
    (hasBudget ? 0.2 : 0) + 
    (hasTimeline ? 0.2 : 0) + 
    (hasObjectives ? 0.2 : 0)
  );
  
  const missing = [];
  if (!hasBudget) missing.push('Budget');
  if (!hasTimeline) missing.push('Délais');
  if (!hasObjectives) missing.push('Objectifs clairs');
  if (words < 50) missing.push('Plus de détails');
  
  return { score, missing };
}

function generateImprovements(description: string, category: string, analysis: any) {
  let enhanced = description;
  const changes = [];
  const suggestions = [];
  
  // Ajouter des éléments manquants
  if (analysis.missing.includes('Budget')) {
    enhanced += '\n\n💰 Budget: À définir selon la proposition (ouvert aux suggestions)';
    changes.push('Ajout indication budget');
  }
  
  if (analysis.missing.includes('Délais')) {
    enhanced += '\n⏰ Délais: Flexible, idéalement sous 4 semaines';
    changes.push('Ajout délais indicatifs');
  }
  
  if (analysis.missing.includes('Objectifs clairs')) {
    enhanced += '\n🎯 Objectifs: Livraison conforme aux attentes avec documentation complète';
    changes.push('Clarification objectifs');
  }
  
  // Suggestions d'amélioration
  suggestions.push('Ajouter des exemples concrets de ce qui est attendu');
  suggestions.push('Préciser les critères de sélection du prestataire');
  suggestions.push('Mentionner les contraintes techniques éventuelles');
  
  return { enhanced_description: enhanced, changes, suggestions };
}

function improveTitle(title: string, category: string): string {
  if (!title) return `Projet ${category} - Mission spécialisée`;
  
  // Ajouter des mots-clés selon la catégorie
  const keywords = {
    'development': '💻',
    'design': '🎨', 
    'marketing': '📈',
    'consulting': '💡',
    'writing': '✍️'
  };
  
  const icon = keywords[category as keyof typeof keywords] || '🚀';
  return title.includes(icon) ? title : `${icon} ${title}`;
}
