/**
 * Voice to Brief - SUPPRIMÉ après simplification
 * Fonctionnalité vocale supprimée du MVP
 * @deprecated Fonctionnalité non-essentielle pour MVP
 */

console.warn('⚠️ Voice-to-Brief supprimé - fonctionnalité non-essentielle pour MVP');

// Pas de fonctionnalité vocale dans le système simplifié
export const voiceToBriefService = {
  processVoiceInput: () => {
    throw new Error('Voice-to-Brief supprimé - utiliser saisie text standard');
  }
};

export default voiceToBriefService;