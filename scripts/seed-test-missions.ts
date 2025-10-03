import { db } from '../server/database.js';
import { missions } from '../shared/schema.js';

const testMissions = [
  {
    title: "Développement d'une application mobile de fitness",
    description: "Nous recherchons un développeur mobile expérimenté pour créer une application de suivi fitness avec fonctionnalités de tracking GPS, planification d'entraînements et synchronisation cloud. L'application doit être disponible sur iOS et Android avec une interface moderne et intuitive.",
    category: 'mobile-development',
    budget_value_cents: 800000,
    currency: 'EUR',
    location_data: {
      raw: 'Paris, France',
      city: 'Paris',
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'high',
    is_team_mission: false,
    team_size: 1,
    tags: ['mobile', 'fitness', 'react-native'],
    skills_required: ['React Native', 'TypeScript', 'Firebase']
  },
  {
    title: "Refonte complète d'un site e-commerce",
    description: "Site e-commerce de vêtements nécessitant une refonte complète : nouveau design moderne, intégration de Stripe, système de panier amélioré, espace client avec historique de commandes. Stack technique : React, Node.js, PostgreSQL.",
    category: 'web-development',
    budget_value_cents: 1200000,
    currency: 'EUR',
    location_data: {
      raw: 'Lyon, France',
      city: 'Lyon',
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'medium',
    is_team_mission: true,
    team_size: 3,
    tags: ['e-commerce', 'react', 'full-stack'],
    skills_required: ['React', 'Node.js', 'PostgreSQL', 'Stripe']
  },
  {
    title: "Design UI/UX pour application de réservation",
    description: "Création de l'identité visuelle et des maquettes UI/UX pour une application de réservation de salles de sport. Livrable : charte graphique, wireframes, prototypes interactifs sur Figma, design system complet.",
    category: 'design',
    budget_value_cents: 350000,
    currency: 'EUR',
    location_data: {
      raw: 'Remote',
      city: null,
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'medium',
    is_team_mission: false,
    team_size: 1,
    tags: ['ui/ux', 'figma', 'design-system'],
    skills_required: ['Figma', 'UI/UX Design', 'Adobe XD']
  },
  {
    title: "Développement d'un dashboard analytics en temps réel",
    description: "Création d'un tableau de bord analytics avec visualisations en temps réel pour une plateforme SaaS. Doit inclure des graphiques interactifs, export de données, alertes personnalisables et API REST pour l'intégration.",
    category: 'web-development',
    budget_value_cents: 600000,
    currency: 'EUR',
    location_data: {
      raw: 'Marseille, France',
      city: 'Marseille',
      country: 'France',
      remote_allowed: false
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'high',
    is_team_mission: false,
    team_size: 1,
    tags: ['dashboard', 'analytics', 'real-time'],
    skills_required: ['React', 'D3.js', 'WebSocket', 'Node.js']
  },
  {
    title: "Migration d'infrastructure vers le cloud",
    description: "Migration complète de notre infrastructure on-premise vers AWS. Inclut la containerisation avec Docker, mise en place de CI/CD, monitoring et optimisation des coûts. Documentation complète requise.",
    category: 'devops',
    budget_value_cents: 1500000,
    currency: 'EUR',
    location_data: {
      raw: 'Toulouse, France',
      city: 'Toulouse',
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'medium',
    is_team_mission: true,
    team_size: 2,
    tags: ['devops', 'aws', 'docker'],
    skills_required: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
  },
  {
    title: "Création d'un chatbot intelligent pour service client",
    description: "Développement d'un chatbot avec IA pour automatiser le support client. Doit comprendre le langage naturel, gérer les FAQs, transférer vers un agent humain si nécessaire. Intégration avec système CRM existant.",
    category: 'data-science',
    budget_value_cents: 900000,
    currency: 'EUR',
    location_data: {
      raw: 'Bordeaux, France',
      city: 'Bordeaux',
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'low',
    is_team_mission: false,
    team_size: 1,
    tags: ['ai', 'chatbot', 'nlp'],
    skills_required: ['Python', 'NLP', 'Machine Learning', 'API Integration']
  },
  {
    title: "Développement d'une API REST pour plateforme collaborative",
    description: "Création d'une API REST complète pour une plateforme de travail collaboratif. Authentification JWT, gestion des permissions, webhooks, documentation OpenAPI, tests unitaires et d'intégration.",
    category: 'web-development',
    budget_value_cents: 550000,
    currency: 'EUR',
    location_data: {
      raw: 'Nantes, France',
      city: 'Nantes',
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'medium',
    is_team_mission: false,
    team_size: 1,
    tags: ['api', 'backend', 'rest'],
    skills_required: ['Node.js', 'Express', 'PostgreSQL', 'JWT']
  },
  {
    title: "Optimisation SEO et performance d'un site corporate",
    description: "Audit complet et optimisation SEO d'un site corporate. Amélioration des performances (Core Web Vitals), restructuration du contenu, optimisation technique, mise en place de balises schema.org, stratégie de contenu.",
    category: 'marketing',
    budget_value_cents: 280000,
    currency: 'EUR',
    location_data: {
      raw: 'Strasbourg, France',
      city: 'Strasbourg',
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'low',
    is_team_mission: false,
    team_size: 1,
    tags: ['seo', 'performance', 'marketing'],
    skills_required: ['SEO', 'Google Analytics', 'Performance Optimization']
  },
  {
    title: "Développement d'une Progressive Web App (PWA)",
    description: "Transformation d'un site web existant en PWA complète avec fonctionnement offline, notifications push, installation sur mobile, synchronisation en arrière-plan. Compatible iOS et Android.",
    category: 'web-development',
    budget_value_cents: 450000,
    currency: 'EUR',
    location_data: {
      raw: 'Remote',
      city: null,
      country: 'France',
      remote_allowed: true
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'high',
    is_team_mission: false,
    team_size: 1,
    tags: ['pwa', 'offline-first', 'mobile'],
    skills_required: ['JavaScript', 'Service Workers', 'IndexedDB', 'Web App Manifest']
  },
  {
    title: "Création d'un système de recommandation personnalisé",
    description: "Développement d'un moteur de recommandation basé sur machine learning pour suggérer des produits aux utilisateurs. Analyse comportementale, filtrage collaboratif, algorithmes de clustering.",
    category: 'data-science',
    budget_value_cents: 750000,
    currency: 'EUR',
    location_data: {
      raw: 'Paris, France',
      city: 'Paris',
      country: 'France',
      remote_allowed: false
    },
    user_id: 1,
    client_id: 1,
    status: 'open',
    urgency: 'medium',
    is_team_mission: true,
    team_size: 2,
    tags: ['ml', 'recommendation', 'data-science'],
    skills_required: ['Python', 'TensorFlow', 'Scikit-learn', 'Data Analysis']
  }
];

async function seedMissions() {
  console.log('🌱 Début du seeding des missions de test...');

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const missionData of testMissions) {
      try {
        const [insertedMission] = await db
          .insert(missions)
          .values({
            ...missionData,
            excerpt: missionData.description.substring(0, 200) + '...',
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning();

        console.log(`✅ Mission créée: ${insertedMission.title} (ID: ${insertedMission.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Erreur lors de la création de "${missionData.title}":`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Résumé du seeding:');
    console.log(`   ✅ Missions créées avec succès: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📝 Total: ${testMissions.length}`);

    console.log('\n🎯 Les missions sont maintenant visibles dans:');
    console.log('   - Le marketplace: /marketplace');
    console.log('   - Le feed: / (page d\'accueil)');
    console.log('   - Mes missions: /missions');

  } catch (error) {
    console.error('💥 Erreur fatale lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le seeding
seedMissions()
  .then(() => {
    console.log('\n✨ Seeding terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec du seeding:', error);
    process.exit(1);
  });