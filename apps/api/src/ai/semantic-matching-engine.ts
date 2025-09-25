/**
 * Moteur de Correspondance Simple - SwipDEAL
 * Version simplifiée pour compatibilité (redirections vers semantic-matching.ts)
 */

// Redirection vers le moteur simplifié
export { semanticMatchingEngine, MatchingRequest, MatchingResult } from './semantic-matching';

// Export par défaut pour compatibilité
import { semanticMatchingEngine } from './semantic-matching';
export default semanticMatchingEngine;

console.log('⚠️  Using simplified semantic matching engine instead of complex NLP version');