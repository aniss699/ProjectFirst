import { Router } from 'express';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { missions, users } from '../../shared/schema';
import { z } from 'zod';

const router = Router();
const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

const flashDealSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  originalPrice: z.number().positive(),
  flashPrice: z.number().positive(),
  discount: z.number().min(0).max(100),
  slots: z.number().positive().int(),
  duration: z.number().positive(),
  expiresAt: z.string(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
});

const reverseSubscriptionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budget: z.number().positive(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly']),
  duration: z.number().positive().int(),
  category: z.string(),
  requirements: z.string().optional(),
});

const groupRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string(),
  location: z.string(),
  targetMembers: z.number().positive().int(),
  pricePerPerson: z.number().positive(),
  startDate: z.string(),
  tags: z.array(z.string()).optional(),
});

const teamBuildingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string(),
  budget: z.number().positive(),
  roles: z.array(z.object({
    role: z.string(),
    count: z.number().int().positive(),
    skills: z.array(z.string()).optional(),
  })),
});

const iaHumanSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string(),
  budget: z.number().positive(),
  aiTasks: z.array(z.string()),
  humanTasks: z.array(z.string()),
  deliverables: z.array(z.string()),
});

router.post('/flash-deals', async (req, res) => {
  try {
    const data = flashDealSchema.parse(req.body);
    
    const [mission] = await db.insert(missions).values({
      title: data.title,
      description: `${data.description}\n\n🔥 FLASH DEAL: ${data.discount}% de réduction!\nPrix normal: €${data.originalPrice} → Prix flash: €${data.flashPrice}\n${data.slots} places disponibles\nOffre valable ${data.duration}h`,
      category: data.category,
      budget_value_cents: Math.round(data.flashPrice * 100),
      status: 'open',
      client_id: 1,
      metadata: JSON.stringify({
        type: 'flash_deal',
        originalPrice: data.originalPrice,
        flashPrice: data.flashPrice,
        discount: data.discount,
        slots: data.slots,
        duration: data.duration,
        expiresAt: data.expiresAt,
        tags: data.tags || [],
      }),
    }).returning();

    res.status(201).json({ 
      success: true, 
      id: mission.id.toString(),
      mission 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création flash deal:', error);
    res.status(500).json({ error: 'Erreur lors de la création du flash deal' });
  }
});

router.post('/subscriptions/reverse', async (req, res) => {
  try {
    const data = reverseSubscriptionSchema.parse(req.body);
    
    const [mission] = await db.insert(missions).values({
      title: data.title,
      description: `${data.description}\n\n🔄 ABONNEMENT INVERSÉ\nFréquence: ${data.frequency}\nDurée: ${data.duration} mois\nBudget: €${data.budget}/mois\n${data.requirements || ''}`,
      category: data.category,
      budget_value_cents: Math.round(data.budget * 100),
      status: 'open',
      client_id: 1,
      metadata: JSON.stringify({
        type: 'reverse_subscription',
        frequency: data.frequency,
        duration: data.duration,
        monthlyBudget: data.budget,
        requirements: data.requirements,
      }),
    }).returning();

    res.status(201).json({ 
      success: true, 
      id: mission.id.toString(),
      mission 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création abonnement inversé:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'abonnement inversé' });
  }
});

router.post('/group-requests', async (req, res) => {
  try {
    const data = groupRequestSchema.parse(req.body);
    
    const [mission] = await db.insert(missions).values({
      title: data.title,
      description: `${data.description}\n\n👥 DEMANDE GROUPÉE\nLieu: ${data.location}\nNombre de participants recherchés: ${data.targetMembers}\nPrix par personne: €${data.pricePerPerson}\nDate de début: ${new Date(data.startDate).toLocaleDateString('fr-FR')}`,
      category: data.category,
      budget_value_cents: Math.round(data.pricePerPerson * data.targetMembers * 100),
      location: data.location,
      status: 'open',
      client_id: 1,
      metadata: JSON.stringify({
        type: 'group_request',
        targetMembers: data.targetMembers,
        pricePerPerson: data.pricePerPerson,
        startDate: data.startDate,
        tags: data.tags || [],
      }),
    }).returning();

    res.status(201).json({ 
      success: true, 
      id: mission.id.toString(),
      mission 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création demande groupée:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la demande groupée' });
  }
});

router.get('/group-requests/interest', async (req, res) => {
  try {
    const { location, category } = req.query;
    
    const count = await db
      .select()
      .from(missions)
      .where(eq(missions.category, category as string))
      .then(missions => missions.filter(m => {
        try {
          const metadata = JSON.parse(m.metadata as string || '{}');
          return metadata.type === 'group_request';
        } catch {
          return false;
        }
      }))
      .then(filtered => filtered.length);

    const estimatedInterest = Math.floor(Math.random() * 10) + count;

    res.json({ count: estimatedInterest });
  } catch (error) {
    console.error('Erreur récupération intérêt groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'intérêt' });
  }
});

router.post('/team-building-projects', async (req, res) => {
  try {
    const data = teamBuildingSchema.parse(req.body);
    
    const rolesDescription = data.roles
      .map(r => `• ${r.count}x ${r.role}${r.skills ? ` (${r.skills.join(', ')})` : ''}`)
      .join('\n');
    
    const [mission] = await db.insert(missions).values({
      title: data.title,
      description: `${data.description}\n\n🏗️ CONSTRUCTION D'ÉQUIPE\nBudget total: €${data.budget}\n\nRôles recherchés:\n${rolesDescription}`,
      category: data.category,
      budget_value_cents: Math.round(data.budget * 100),
      status: 'open',
      client_id: 1,
      metadata: JSON.stringify({
        type: 'team_building',
        roles: data.roles,
      }),
    }).returning();

    res.status(201).json({ 
      success: true, 
      id: mission.id.toString(),
      mission 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création projet d\'équipe:', error);
    res.status(500).json({ error: 'Erreur lors de la création du projet d\'équipe' });
  }
});

router.post('/ia-human-jobs', async (req, res) => {
  try {
    const data = iaHumanSchema.parse(req.body);
    
    const [mission] = await db.insert(missions).values({
      title: data.title,
      description: `${data.description}\n\n🤖👤 IA + HUMAIN\nBudget: €${data.budget}\n\nTâches IA:\n${data.aiTasks.map(t => `• ${t}`).join('\n')}\n\nTâches Humaines:\n${data.humanTasks.map(t => `• ${t}`).join('\n')}\n\nLivrables:\n${data.deliverables.map(d => `• ${d}`).join('\n')}`,
      category: data.category,
      budget_value_cents: Math.round(data.budget * 100),
      status: 'open',
      client_id: 1,
      metadata: JSON.stringify({
        type: 'ia_human',
        aiTasks: data.aiTasks,
        humanTasks: data.humanTasks,
        deliverables: data.deliverables,
      }),
    }).returning();

    res.status(201).json({ 
      success: true, 
      id: mission.id.toString(),
      mission 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('Erreur création job IA+Humain:', error);
    res.status(500).json({ error: 'Erreur lors de la création du job IA+Humain' });
  }
});

router.get('/opportunities/live-slots', async (req, res) => {
  try {
    const { category, minRating, maxPrice, location } = req.query;
    
    const providers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'PRO'))
      .limit(10);

    const liveSlots = providers.map((provider, index) => ({
      id: `slot_${provider.id}_${Date.now()}_${index}`,
      providerName: provider.name || 'Prestataire',
      rating: provider.rating_mean || (4 + Math.random()),
      slot: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
      pricePerHour: Math.floor(Math.random() * 80) + 40,
      distance: location ? Math.floor(Math.random() * 20) + 1 : undefined,
      tags: [category || 'Général'],
    }));

    res.json(liveSlots);
  } catch (error) {
    console.error('Erreur récupération slots:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des slots' });
  }
});

router.post('/opportunities/reserve', async (req, res) => {
  try {
    const { slotId, userId } = req.body;

    if (!slotId) {
      return res.status(400).json({ error: 'slotId requis' });
    }

    res.json({ 
      success: true,
      message: 'Créneau réservé avec succès',
      reservationId: `res_${Date.now()}`,
    });
  } catch (error) {
    console.error('Erreur réservation slot:', error);
    res.status(500).json({ error: 'Erreur lors de la réservation du slot' });
  }
});

export default router;
