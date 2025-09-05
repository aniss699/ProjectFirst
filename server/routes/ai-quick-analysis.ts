import express from 'express';
import { AIAnalysisService } from '../services/ai-analysis.js';
import { PricingAnalysisService } from '../services/pricing-analysis.js';
import { AIAnalysisRequest } from '../types/mission.js';

const router = express.Router();

router.post('/ai/quick-analysis', async (req, res) => {
  try {
    const { description, title, category }: AIAnalysisRequest = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description requise' });
    }

    const analysis = await AIAnalysisService.performQuickAnalysis({
      description,
      title,
      category
    });

    res.json(analysis);
  } catch (error) {
    console.error('Erreur analyse IA rapide:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse' });
  }
});

router.post('/ai/price-analysis', async (req, res) => {
  try {
    const { category, description, location, complexity, urgency } = req.body;

    if (!category || !description || complexity === undefined) {
      return res.status(400).json({ 
        error: 'Paramètres requis: category, description, complexity' 
      });
    }

    const analysis = await PricingAnalysisService.performPricingAnalysis({
      category,
      description,
      location,
      complexity: Number(complexity),
      urgency: urgency || 'medium'
    });

    res.json(analysis);
  } catch (error) {
    console.error('Erreur analyse de prix IA:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse de prix' });
  }
});

export default router;