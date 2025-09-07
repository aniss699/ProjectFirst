
import { Router } from 'express';
import { aiLearningEngine } from '../../apps/api/src/ai/learning-engine.js';

const router = Router();

// Analyser et apprendre des interactions passées
router.post('/analyze-patterns', async (req, res) => {
  try {
    console.log('🧠 Démarrage analyse patterns d\'apprentissage...');
    await aiLearningEngine.analyzePastInteractions(1000);
    
    const stats = aiLearningEngine.getLearningStats();
    res.json({
      success: true,
      message: 'Analyse d\'apprentissage terminée',
      stats
    });
  } catch (error) {
    console.error('❌ Erreur analyse apprentissage:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'analyse d\'apprentissage'
    });
  }
});

// Obtenir les statistiques d'apprentissage
router.get('/stats', (req, res) => {
  try {
    const stats = aiLearningEngine.getLearningStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

export default router;
