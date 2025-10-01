
import { Router } from 'express';
import { db } from '../database.js';
import { contracts, deliverables } from '../../shared/schema.js';
import { eq, and, or } from 'drizzle-orm';
import { 
  createContract, 
  signContract, 
  transitionContract, 
  submitDeliverable, 
  reviewDeliverable 
} from '../services/contract-service.js';

const router = Router();

// POST /api/contracts - Créer un contrat
router.post('/', async (req, res) => {
  try {
    const { mission_id, bid_id, provider_id, terms, deliverables } = req.body;
    const client_id = req.user?.id;

    if (!client_id) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const contract = await createContract({
      mission_id,
      bid_id,
      client_id,
      provider_id,
      terms,
      deliverables
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error('Erreur création contrat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/contracts - Liste des contrats de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userContracts = await db.query.contracts.findMany({
      where: or(
        eq(contracts.client_id, userId),
        eq(contracts.provider_id, userId)
      ),
      with: {
        mission: {
          columns: { id: true, title: true }
        },
        client: {
          columns: { id: true, name: true, avatar_url: true }
        },
        provider: {
          columns: { id: true, name: true, avatar_url: true }
        },
        deliverables: true
      },
      orderBy: [contracts.created_at]
    });

    res.json(userContracts);
  } catch (error) {
    console.error('Erreur récupération contrats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/contracts/:id - Détail d'un contrat
router.get('/:id', async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const contract = await db.query.contracts.findFirst({
      where: and(
        eq(contracts.id, contractId),
        or(
          eq(contracts.client_id, userId),
          eq(contracts.provider_id, userId)
        )
      ),
      with: {
        mission: true,
        bid: true,
        client: {
          columns: { id: true, name: true, avatar_url: true }
        },
        provider: {
          columns: { id: true, name: true, avatar_url: true }
        },
        deliverables: true
      }
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    res.json(contract);
  } catch (error) {
    console.error('Erreur récupération contrat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/contracts/:id/sign - Signer un contrat
router.post('/:id/sign', async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await signContract(contractId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur signature contrat:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// PATCH /api/contracts/:id/status - Changer le statut
router.patch('/:id/status', async (req, res) => {
  try {
    const contractId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await transitionContract(contractId, status, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur changement statut:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/deliverables/:id/submit - Soumettre un livrable
router.post('/deliverables/:id/submit', async (req, res) => {
  try {
    const deliverableId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { file_urls, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await submitDeliverable(deliverableId, userId, { file_urls, description });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur soumission livrable:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/deliverables/:id/review - Valider/Rejeter un livrable
router.post('/deliverables/:id/review', async (req, res) => {
  try {
    const deliverableId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { approved, feedback } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    await reviewDeliverable(deliverableId, userId, { approved, feedback });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur validation livrable:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
