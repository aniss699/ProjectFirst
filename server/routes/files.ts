
import { Router } from 'express';
import multer from 'multer';
import { uploadFile, deleteFile, getFilesByContext, getUserFiles } from '../services/file-service.js';

const router = Router();

// Configuration multer pour l'upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// POST /api/files/upload - Upload un fichier
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { context_type, context_id } = req.body;
    
    const file = await uploadFile(req.file, userId, {
      type: context_type,
      id: context_id ? parseInt(context_id) : undefined
    });

    res.status(201).json(file);
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// GET /api/files/user - Fichiers de l'utilisateur
router.get('/user', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { context_type } = req.query;
    const files = await getUserFiles(userId, context_type as string);

    res.json(files);
  } catch (error) {
    console.error('Erreur récupération fichiers utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/files/context/:type/:id - Fichiers par contexte
router.get('/context/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const files = await getFilesByContext(type, parseInt(id));

    res.json(files);
  } catch (error) {
    console.error('Erreur récupération fichiers contexte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/files/:id - Supprimer un fichier
router.delete('/:id', async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await deleteFile(fileId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

export default router;
