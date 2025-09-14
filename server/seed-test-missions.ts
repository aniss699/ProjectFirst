import { db } from './database.js';
import { missions, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const TEST_MISSIONS = [
  {
    title: "Application mobile de livraison rapide",
    description: "Développement d'une app mobile native (iOS/Android) pour service de livraison en 30min. Interface utilisateur intuitive, géolocalisation temps réel, système de paiement intégré, notifications push. Technologies: React Native ou Flutter, Firebase, Stripe.",
    category: "developpement",
    budget_value_cents: 800000, // 8000€
    location_data: {
      address: "Paris, France",
      city: "Paris",
      country: "France",
      remote_allowed: true
    },
    urgency: "high" as const,
    status: "open" as const,
    quality_target: "premium" as const,
    tags: ["React Native", "Flutter", "Mobile", "Livraison", "GPS", "Paiement"],
    skills_required: ["React Native", "Firebase", "API REST", "Stripe", "UX/UI"],
    requirements: "Portfolio mobile obligatoire, disponibilité 25h/semaine minimum, expérience paiements en ligne",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 jours
    is_team_mission: false,
    team_size: 1
  },
  {
    title: "Refonte complète site e-commerce mode",
    description: "Modernisation boutique en ligne 100% mobile-first. Design tendance, UX optimisée, performances élevées. Intégration Instagram Shopping, réalité augmentée pour essayage virtuel, programme fidélité gamifié.",
    category: "web",
    budget_value_cents: 1200000, // 12000€
    location_data: {
      address: "Lyon, France", 
      city: "Lyon",
      country: "France",
      remote_allowed: false
    },
    urgency: "medium" as const,
    status: "open" as const,
    quality_target: "luxury" as const,
    tags: ["E-commerce", "Mode", "Shopify", "AR", "Mobile-first"],
    skills_required: ["Shopify", "JavaScript", "CSS3", "AR/VR", "Instagram API"],
    requirements: "Expérience mode/luxe exigée, portfolio e-commerce récent, maîtrise Shopify Plus",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
    is_team_mission: true,
    team_size: 3
  },
  {
    title: "Stratégie marketing digital startup fintech",
    description: "Lancement produit révolutionnaire dans la fintech. Stratégie 360° : content marketing viral, LinkedIn B2B, SEA Google/Facebook, partenariats influenceurs finance. Objectif: 50K early adopters en 3 mois.",
    category: "marketing",
    budget_value_cents: 1500000, // 15000€
    location_data: {
      address: "Bordeaux, France",
      city: "Bordeaux", 
      country: "France",
      remote_allowed: true
    },
    urgency: "urgent" as const,
    status: "open" as const,
    quality_target: "premium" as const,
    tags: ["Fintech", "Growth Hacking", "SEA", "LinkedIn", "B2B"],
    skills_required: ["Growth Marketing", "SEA", "Content Marketing", "LinkedIn Ads", "Analytics"],
    requirements: "ROI prouvé en fintech, certification Google Ads, réseau influenceurs finance",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    is_team_mission: false,
    team_size: 1
  },
  {
    title: "Système IA prédiction immobilier",
    description: "Développement algorithme IA pour prédiction prix immobilier. Machine Learning avancé, traitement données massives, API temps réel. Stack moderne: Python, TensorFlow, FastAPI, PostgreSQL, Docker.",
    category: "ia",
    budget_value_cents: 3500000, // 35000€
    location_data: {
      address: "Toulouse, France",
      city: "Toulouse",
      country: "France", 
      remote_allowed: true
    },
    urgency: "medium" as const,
    status: "open" as const,
    quality_target: "luxury" as const,
    tags: ["IA", "Machine Learning", "Python", "TensorFlow", "Immobilier", "Big Data"],
    skills_required: ["Python", "TensorFlow", "FastAPI", "PostgreSQL", "Docker", "MLOps"],
    requirements: "PhD/Master IA souhaité, expérience production ML, références projets similaires",
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
    is_team_mission: true,
    team_size: 4
  },
  {
    title: "Formation cybersécurité équipes IT",
    description: "Programme formation cybersécurité sur-mesure pour PME tech. Ateliers pratiques, simulations d'attaques, certifications ANSSI. Format hybride présentiel/distanciel, support pédagogique interactif.",
    category: "formation",
    budget_value_cents: 450000, // 4500€
    location_data: {
      address: "Lille, France",
      city: "Lille",
      country: "France",
      remote_allowed: false
    },
    urgency: "low" as const,
    status: "open" as const,
    quality_target: "standard" as const,
    tags: ["Cybersécurité", "Formation", "ANSSI", "PME", "IT"],
    skills_required: ["Cybersécurité", "Pédagogie", "ANSSI", "Ethical Hacking", "Communication"],
    requirements: "Certification CISSP/CISM, expérience formation min 3 ans, agrément organisme",
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 jours
    is_team_mission: false,
    team_size: 1
  },
  {
    title: "Audit UX/UI application mobile banking",
    description: "Audit complet expérience utilisateur app banking existante. Analyse parcours clients, tests utilisabilité, benchmark concurrence, recommandations d'amélioration. Livrable: guide UX actionnable.",
    category: "design",
    budget_value_cents: 650000, // 6500€
    location_data: {
      address: "Nice, France",
      city: "Nice", 
      country: "France",
      remote_allowed: true
    },
    urgency: "medium" as const,
    status: "open" as const,
    quality_target: "premium" as const,
    tags: ["UX/UI", "Audit", "Banking", "Mobile", "Tests utilisateurs"],
    skills_required: ["UX Research", "UI Design", "Tests utilisabilité", "Figma", "Banking"],
    requirements: "Expérience secteur bancaire obligatoire, certification UX, outils de testing",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 jours
    is_team_mission: false,
    team_size: 1
  }
];

export async function seedTestMissions() {
  console.log('🎯 Création des missions de test...');

  try {
    // Récupérer les utilisateurs démo existants
    const demoUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, 'demo@swideal.com'))
      .limit(1);

    if (demoUsers.length === 0) {
      console.log('⚠️ Utilisateur démo non trouvé. Exécutez d\'abord le seed des utilisateurs démo.');
      return;
    }

    const demoClientId = demoUsers[0].id;

    // Insérer les missions de test
    for (const mission of TEST_MISSIONS) {
      const [createdMission] = await db
        .insert(missions)
        .values({
          ...mission,
          user_id: demoClientId,
          client_id: demoClientId
        })
        .returning();

      console.log(`✅ Mission créée: "${createdMission.title}" (ID: ${createdMission.id})`);
    }

    console.log(`🎉 ${TEST_MISSIONS.length} missions de test créées avec succès !`);
    console.log('📋 Ces missions couvrent différentes catégories et niveaux de complexité pour tester l\'application.');

  } catch (error) {
    console.error('❌ Erreur lors de la création des missions de test:', error);
    throw error;
  }
}

// Fonction pour nettoyer les missions de test (utile pour les tests)
export async function cleanTestMissions() {
  console.log('🧹 Nettoyage des missions de test...');
  
  try {
    // Supprimer toutes les missions créées par l'utilisateur démo
    const demoUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, 'demo@swideal.com'))
      .limit(1);

    if (demoUsers.length > 0) {
      const deletedMissions = await db
        .delete(missions)
        .where(eq(missions.user_id, demoUsers[0].id))
        .returning();

      console.log(`🗑️ ${deletedMissions.length} missions de test supprimées.`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Exécution directe si appelé en tant que script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestMissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}