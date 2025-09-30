import express from 'express';

const router = express.Router();

// Demo routes supprimées - redirection vers l'API principale
router.get('/missions-demo', (req, res) => {
  res.status(301).redirect('/api/missions');
});

export default router;