// Types pour une meilleure type safety
export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

// Routes principales
export const ROUTES = {
  // Routes publiques
  HOME: '/',
  SERVICES: '/services',
  FEATURES: '/features',
  NOTRE_CONCEPT: '/notre-concept',
  LEGAL: '/legal',

  // Routes authentifiées
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CREATE_MISSION: '/create-mission',
  MESSAGES: '/messages',

  // Routes AI - Consolidées vers AI Hub
  AI: {
    HUB: '/ai-hub',
    // Routes héritées (pour compatibilité)
    FEATURES: '/ai-features',
    DASHBOARD: '/ai-dashboard',
    ADVANCED: '/ai-advanced',
    TEST: '/ai-test',
  },

  // Routes API
  API: {
    BASE: '/api',
    HEALTH: '/api/health',
    AUTH: '/api/auth',
    MISSIONS: '/api/missions',
    AI: '/api/ai',
  }
} as const;

// Configuration des routes avec métadonnées
export const routeConfigs: Record<string, RouteConfig> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    title: 'Accueil - AppelsPro',
    description: 'Plateforme d\'appels d\'offres inversés'
  },
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    title: 'Tableau de bord - AppelsPro',
    requiresAuth: true
  },
  [ROUTES.PROFILE]: {
    path: ROUTES.PROFILE,
    title: 'Mon profil - AppelsPro',
    requiresAuth: true
  },
  [ROUTES.CREATE_MISSION]: {
    path: ROUTES.CREATE_MISSION,
    title: 'Créer une mission - AppelsPro',
    requiresAuth: true
  },
  [ROUTES.AI.HUB]: {
    path: ROUTES.AI.HUB,
    title: 'Hub Intelligence Artificielle - Swideal',
    description: 'Centre unifié des fonctionnalités IA : démonstrations, algorithmes, tableaux de bord et documentation',
    requiresAuth: false
  },
  [ROUTES.AI.DASHBOARD]: {
    path: ROUTES.AI.DASHBOARD,
    title: 'Dashboard IA - Swideal',
    requiresAuth: true
  },
  [ROUTES.NOTRE_CONCEPT]: {
    path: ROUTES.NOTRE_CONCEPT,
    title: 'Notre concept - Swideal',
    description: 'Découvrez la vision et la philosophie derrière Swideal, la révolution des enchères inversées intelligentes'
  }
};

// Helpers
export const isAuthRoute = (path: string): boolean => {
  const config = routeConfigs[path];
  return config?.requiresAuth ?? false;
};

export const getRouteTitle = (path: string): string => {
  return routeConfigs[path]?.title ?? 'AppelsPro';
};

export const buildApiUrl = (endpoint: string): string => {
  return `${ROUTES.API.BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Navigation groups pour le menu
export const navigationGroups = {
  main: [
    { path: ROUTES.HOME, label: 'Accueil' },
    { path: ROUTES.SERVICES, label: 'Services' },
    { path: ROUTES.FEATURES, label: 'Fonctionnalités' }
  ],
  user: [
    { path: ROUTES.DASHBOARD, label: 'Dashboard' },
    { path: ROUTES.PROFILE, label: 'Profil' },
    { path: ROUTES.MESSAGES, label: 'Messages' }
  ],
  ai: [
    { path: ROUTES.AI.HUB, label: 'Hub IA' },
    // Routes héritées - conservées pour navigation existante
    { path: ROUTES.AI.FEATURES, label: 'IA Features' },
    { path: ROUTES.AI.DASHBOARD, label: 'Dashboard IA' },
    { path: ROUTES.AI.ADVANCED, label: 'IA Avancée' }
  ]
};

export const paths = {
  home: '/',
  login: '/login',
  createMission: '/create-mission',
  editMission: (id: string) => `/edit-mission/${id}`,
  profile: '/profile',
  dashboard: '/dashboard',
  messages: '/messages',
  favorites: '/favorites',
  features: '/features',
  legal: '/legal',
  services: '/services',
  feed: '/feed',
  availableProviders: '/available-providers',
  aiHub: '/ai-hub',
  aiMonitoring: '/ai-monitoring',
  adminFeedMetrics: '/admin-feed-metrics',
  demoMissions: '/demo-missions',
  providerProfile: (id: string) => `/provider/${id}`,
  sitemap: '/sitemap',
  projectImprove: '/project-improve',
  flashDeal: '/services/flash-deal',
  groupRequest: '/services/group-request',
  reverseSubscription: '/services/reverse-subscription',
  opportunities: '/services/opportunities',
  iaHuman: '/services/ia-human',
  notFound: '/404',
  notreConcept: '/notre-concept'
};