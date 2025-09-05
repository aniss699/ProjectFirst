import express from 'express';
import { Mission } from '../types/mission.js';

const router = express.Router();

// Demo missions data
const getDemoMissions = (): Mission[] => [
  {
    id: "mission1",
    title: "Développement d'une application mobile de e-commerce",
    description: "Je recherche un développeur expérimenté pour créer une application mobile complète de vente en ligne avec système de paiement intégré.",
    category: "developpement",
    budget: "5000",
    location: "Paris, France",
    clientId: "client1",
    clientName: "Marie Dubois",
    status: "open",
    createdAt: new Date("2024-01-15").toISOString(),
    bids: []
  },
  {
    id: "mission2",
    title: "Refonte complète du site web d'entreprise",
    description: "Modernisation du site vitrine de notre entreprise avec nouveau design responsive et optimisation SEO.",
    category: "design",
    budget: "3000",
    location: "Lyon, France",
    clientId: "client2",
    clientName: "Pierre Martin",
    status: "open",
    createdAt: new Date("2024-01-18").toISOString(),
    bids: []
  },
  {
    id: "mission3",
    title: "Campagne marketing digital et réseaux sociaux",
    description: "Lancement d'une campagne complète sur les réseaux sociaux pour augmenter la notoriété de notre marque.",
    category: "marketing",
    budget: "2000",
    location: "Marseille, France",
    clientId: "client3",
    clientName: "Sophie Leclerc",
    status: "open",
    createdAt: new Date("2024-01-20").toISOString(),
    bids: []
  },
  {
    id: "mission4",
    title: "Développement d'une plateforme SaaS",
    description: "Création d'une plateforme SaaS complète avec tableau de bord, API, authentification et facturation.",
    category: "developpement",
    budget: "15000",
    location: "Remote",
    clientId: "client4",
    clientName: "Tech Startup",
    status: "open",
    createdAt: new Date("2024-01-22").toISOString(),
    bids: []
  },
  {
    id: "mission5",
    title: "Application mobile React Native",
    description: "Développement d'une application mobile cross-platform avec React Native pour la gestion de tâches.",
    category: "mobile",
    budget: "8000",
    location: "Lille, France",
    clientId: "client5",
    clientName: "Productivity Corp",
    status: "open",
    createdAt: new Date("2024-01-25").toISOString(),
    bids: []
  },
  {
    id: "mission6",
    title: "Intégration IA et Machine Learning",
    description: "Intégration d'intelligence artificielle dans une plateforme existante pour l'analyse prédictive.",
    category: "ai",
    budget: "12000",
    location: "Paris, France",
    clientId: "client6",
    clientName: "AI Solutions",
    status: "open",
    createdAt: new Date("2024-01-28").toISOString(),
    bids: []
  }
];

router.get('/missions-demo', (req, res) => {
  res.json(getDemoMissions());
});

export default router;