
// ============================================
// API MISSIONS SUPPRIMÉE
// ============================================

import { Router } from 'express';

const router = Router();

// Toutes les routes missions sont désactivées
router.all('*', (req, res) => {
  res.status(410).json({
    error: 'API missions supprimée',
    message: 'Cette API a été complètement supprimée du système'
  });
});

export default router;
