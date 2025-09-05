import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { announcements } from '../shared/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const sampleAnnouncements = [
  {
    title: "Développement d'une application mobile de fitness",
    description: "Recherche développeur React Native expérimenté pour créer une app de suivi fitness avec fonctionnalités IA, géolocalisation, et intégration avec wearables. Interface moderne, notifications push, système de gamification.",
    category: "developpement",
    tags: ["React Native", "IA", "Mobile", "Fitness", "API"],
    city: "Paris",
    budget_min: 8000,
    budget_max: 15000,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 jours
    media: { image: "/api/placeholder/400/300", video: null },
    quality_score: 0.92,
    user_id: 1,
    sponsored: false
  },
  {
    title: "Refonte complète site e-commerce bio",
    description: "Modernisation de notre boutique en ligne de produits bio. Design responsive, optimisation SEO, intégration paiement sécurisé, gestion stock avancée. Expertise WooCommerce requise.",
    category: "web",
    tags: ["E-commerce", "WooCommerce", "SEO", "Bio"],
    city: "Lyon",
    budget_min: 5000,
    budget_max: 8000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.88,
    user_id: 2,
    sponsored: true
  },
  {
    title: "Campagne marketing digital startup fintech",
    description: "Lancement produit innovant dans la fintech. Besoin stratégie marketing 360°: content marketing, réseaux sociaux, SEA, influenceurs. Objectif: 10K utilisateurs en 3 mois.",
    category: "marketing",
    tags: ["Fintech", "SEA", "Social Media", "Growth Hacking"],
    city: "Bordeaux",
    budget_min: 12000,
    budget_max: 20000,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.95,
    user_id: 3,
    sponsored: false
  },
  {
    title: "Intelligence artificielle pour analyse prédictive",
    description: "Développement système IA pour prédiction tendances marché immobilier. Machine Learning, traitement données massives, API temps réel. Stack: Python, TensorFlow, FastAPI.",
    category: "ia",
    tags: ["IA", "Machine Learning", "Python", "TensorFlow", "Immobilier"],
    city: "Toulouse",
    budget_min: 25000,
    budget_max: 40000,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.97,
    user_id: 4,
    sponsored: false
  },
  {
    title: "Design UX/UI application de méditation",
    description: "Création interface intuitive pour app de méditation guidée. Design zen, parcours utilisateur fluide, dark mode, animations subtiles. Portfolio apps wellness requis.",
    category: "design",
    tags: ["UX/UI", "Mobile Design", "Meditation", "Wellness"],
    city: "Nice",
    budget_min: 3500,
    budget_max: 6000,
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.91,
    user_id: 5,
    sponsored: false
  },
  {
    title: "Développement plateforme SaaS collaborative",
    description: "Création plateforme collaborative pour équipes distributed. Temps réel, video calls intégrés, gestion projets, facturation. Stack moderne: Next.js, Node.js, PostgreSQL.",
    category: "developpement",
    tags: ["SaaS", "Next.js", "Collaboration", "Video", "PostgreSQL"],
    city: "Nantes",
    budget_min: 18000,
    budget_max: 30000,
    deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.94,
    user_id: 6,
    sponsored: true
  },
  {
    title: "Traduction technique multilingue",
    description: "Traduction documentation technique API fintech en 5 langues. Expertise finance obligatoire. Livraison formats multiples, révisions incluses. Urgence client international.",
    category: "redaction",
    tags: ["Traduction", "Finance", "Technique", "Multilingue"],
    city: "Remote",
    budget_min: 2500,
    budget_max: 4000,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    media: {},
    quality_score: 0.85,
    user_id: 7,
    sponsored: false
  },
  {
    title: "Audit cybersécurité infrastructure cloud",
    description: "Audit sécurité complet infrastructure AWS. Pentesting, analyse vulnérabilités, recommandations, formation équipes. Certifications CISSP/CEH requises.",
    category: "securite",
    tags: ["Cybersécurité", "AWS", "Pentesting", "Audit"],
    city: "Paris",
    budget_min: 15000,
    budget_max: 25000,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.96,
    user_id: 8,
    sponsored: false
  },
  {
    title: "Animation 3D pour campagne publicitaire",
    description: "Création animations 3D haut de gamme pour campagne TV/digital. Style réaliste, 30sec spot + variations réseaux sociaux. Expérience automotive requise.",
    category: "animation",
    tags: ["3D", "Animation", "Publicité", "Automotive"],
    city: "Marseille",
    budget_min: 8000,
    budget_max: 12000,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300", video: "/api/placeholder/video" },
    quality_score: 0.89,
    user_id: 9,
    sponsored: false
  },
  {
    title: "Optimisation SEO site e-commerce mode",
    description: "Audit SEO complet + optimisations boutique mode en ligne. Amélioration positions Google, architecture site, maillage interne, contenu optimisé. ROI garanti.",
    category: "seo",
    tags: ["SEO", "E-commerce", "Mode", "Google"],
    city: "Lille",
    budget_min: 3000,
    budget_max: 5500,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.87,
    user_id: 10,
    sponsored: true
  },
  {
    title: "Data Science pour retail intelligence",
    description: "Analyse comportement clients retail, recommandations personnalisées, optimisation pricing dynamique. Python, Pandas, Scikit-learn. Dashboard interactif inclus.",
    category: "data",
    tags: ["Data Science", "Retail", "Python", "IA", "Dashboard"],
    city: "Strasbourg",
    budget_min: 12000,
    budget_max: 18000,
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.93,
    user_id: 11,
    sponsored: false
  },
  {
    title: "Formation React avancé équipe interne",
    description: "Formation intensive React/TypeScript pour 8 développeurs. Hooks avancés, performance, tests, architecture. 3 jours présentiel + suivi 1 mois. Expérience formation requise.",
    category: "formation",
    tags: ["React", "TypeScript", "Formation", "Équipe"],
    city: "Rennes",
    budget_min: 6000,
    budget_max: 9000,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    media: {},
    quality_score: 0.90,
    user_id: 12,
    sponsored: false
  },
  {
    title: "Architecture microservices scalable",
    description: "Conception architecture microservices pour scale-up fintech. Docker, Kubernetes, API Gateway, monitoring. Documentation complète, migration plan inclus.",
    category: "architecture",
    tags: ["Microservices", "Docker", "Kubernetes", "Fintech"],
    city: "Montpellier",
    budget_min: 20000,
    budget_max: 35000,
    deadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.95,
    user_id: 13,
    sponsored: false
  },
  {
    title: "Podcast série tech entrepreneuriat",
    description: "Production 12 épisodes podcast tech/business. Interview entrepreneurs, montage pro, promotion multicanal. Expertise audio & storytelling indispensable.",
    category: "audio",
    tags: ["Podcast", "Tech", "Entrepreneuriat", "Audio"],
    city: "Remote",
    budget_min: 4500,
    budget_max: 7500,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    media: {},
    quality_score: 0.86,
    user_id: 14,
    sponsored: false
  },
  {
    title: "Application IoT smart building",
    description: "Développement solution IoT gestion intelligent bâtiments. Capteurs, dashboard temps réel, IA optimisation énergétique. Stack: Node.js, InfluxDB, Grafana.",
    category: "iot",
    tags: ["IoT", "Smart Building", "Node.js", "InfluxDB", "IA"],
    city: "Grenoble",
    budget_min: 22000,
    budget_max: 32000,
    deadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.94,
    user_id: 15,
    sponsored: true
  },
  {
    title: "Stratégie contenu LinkedIn B2B",
    description: "Développement stratégie contenu LinkedIn pour cabinet conseil. Content planning 6 mois, posts engageants, lead generation. Growth LinkedIn prouvé requis.",
    category: "social",
    tags: ["LinkedIn", "B2B", "Content", "Lead Generation"],
    city: "Paris",
    budget_min: 3500,
    budget_max: 5000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.88,
    user_id: 16,
    sponsored: false
  },
  {
    title: "Migration legacy vers cloud native",
    description: "Migration application legacy .NET vers architecture cloud native. Modernisation code, CI/CD, monitoring, sécurité. Expertise Azure DevOps requise.",
    category: "cloud",
    tags: [".NET", "Azure", "Migration", "DevOps", "Cloud"],
    city: "Nancy",
    budget_min: 16000,
    budget_max: 24000,
    deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.91,
    user_id: 17,
    sponsored: false
  },
  {
    title: "Copywriting landing pages conversion",
    description: "Rédaction 10 landing pages haute conversion SaaS B2B. A/B testing, psychologie persuasion, CRO. Portfolio conversions mesurées obligatoire.",
    category: "copywriting",
    tags: ["Copywriting", "Landing Page", "Conversion", "SaaS"],
    city: "Remote",
    budget_min: 2800,
    budget_max: 4500,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    media: {},
    quality_score: 0.89,
    user_id: 18,
    sponsored: false
  },
  {
    title: "Application mobile réalité augmentée",
    description: "Développement app mobile AR pour essayage virtuel lunettes. ARKit/ARCore, reconnaissance faciale, try-on réaliste. Portfolio AR retail requis.",
    category: "ar",
    tags: ["AR", "Mobile", "ARKit", "ARCore", "Retail"],
    city: "Sophia Antipolis",
    budget_min: 20000,
    budget_max: 30000,
    deadline: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300", video: "/api/placeholder/video" },
    quality_score: 0.96,
    user_id: 19,
    sponsored: false
  },
  {
    title: "Blockchain DeFi smart contracts",
    description: "Développement smart contracts protocole DeFi. Solidity, tests sécurisés, audit code, déploiement mainnet. Expertise DeFi et sécurité obligatoire.",
    category: "blockchain",
    tags: ["Blockchain", "DeFi", "Solidity", "Smart Contracts"],
    city: "Remote",
    budget_min: 30000,
    budget_max: 45000,
    deadline: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000),
    media: { image: "/api/placeholder/400/300" },
    quality_score: 0.98,
    user_id: 20,
    sponsored: true
  }
];

export async function seedFeedData() {
  try {
    console.log('🌱 Seeding feed data...');
    
    // Insérer les annonces
    for (const announcement of sampleAnnouncements) {
      await db.insert(announcements).values(announcement);
    }
    
    console.log(`✅ Successfully seeded ${sampleAnnouncements.length} announcements`);
  } catch (error) {
    console.error('❌ Error seeding feed data:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFeedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}