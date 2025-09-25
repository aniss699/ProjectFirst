/**
 * Analytics Avancées - SUPPRIMÉ après simplification  
 * Remplacé par analytics simples dans predictive-analytics-engine.ts
 * @deprecated Utiliser SimpleAnalyticsEngine à la place
 */

console.warn('⚠️ Advanced Analytics supprimé - utiliser SimpleAnalyticsEngine');

// Redirection vers le moteur analytique simplifié
export { SimpleAnalyticsEngine as advancedAnalyticsEngine } from './predictive-analytics-engine';
export { SimpleAnalyticsEngine as default } from './predictive-analytics-engine';