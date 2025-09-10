import { Mission, Bid, User } from '../../shared/schema.js';

// Utilitaire pour générer un excerpt à partir de la description
function generateExcerpt(description: string, maxLength: number = 200): string {
  if (!description || description.length <= maxLength) {
    return description || '';
  }

  // Chercher la fin de phrase la plus proche avant maxLength
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // Sinon, couper au dernier espace pour éviter de couper un mot
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  return truncated.trim() + '...';
}

// ============================================
// Types pour les réponses API - missions uniquement (terminologie unifiée)
// ============================================

export interface BidsSummary {
  count: number;
  lowestAmountCents: number | null;
  averageAmountCents: number | null;
  hasMyBid: boolean;
  myBidRank?: number; // 1 = meilleure offre
}

export interface BudgetResponse {
  type: 'fixed' | 'range' | 'negotiable';
  valueCents?: number;
  minCents?: number;
  maxCents?: number;
  currency: string;
  display: string; // "5000€", "2000-8000€", "À négocier"
}

export interface LocationResponse {
  raw?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  display: string; // "Paris, France" ou "Remote"
  remoteAllowed: boolean;
}

export interface ClientResponse {
  id: number;
  displayName: string;
  rating?: {
    mean: number;
    count: number;
  };
  isVerified: boolean;
}

export interface PermissionsResponse {
  canEdit: boolean;
  canApply: boolean;
  canView: boolean;
  canDelete: boolean;
  canAward: boolean;
}

export interface MissionDetailResponse {
  id: number;
  title: string;
  description: string;
  excerpt: string;

  // Catégorisation
  category: string;
  tags: string[];
  skillsRequired: string[];

  // Budget structuré
  budget: BudgetResponse;

  // Localisation structurée
  location: LocationResponse;

  // Client info (limitée)
  client: ClientResponse;

  // Statut et timing
  status: string;
  urgency: string;
  deadline?: string; // ISO 8601

  // Équipe
  isTeamMission: boolean;
  teamSize: number;

  // Métadonnées
  requirements?: string;
  deliverables: Array<{
    title: string;
    description?: string;
    dueDate?: string;
  }>;

  // Résumé des offres (pas la liste complète)
  bidsSummary: BidsSummary;

  // Permissions pour l'utilisateur connecté
  permissions: PermissionsResponse;

  // Audit
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  publishedAt?: string; // ISO 8601
  expiresAt?: string; // ISO 8601
}

// ============================================
// EXEMPLE CONCRET DE RÉPONSE
// ============================================

export const missionDetailResponseExample: MissionDetailResponse = {
  id: 123,
  title: "Développement d'une application mobile e-commerce",
  description: "Nous recherchons un développeur expérimenté pour créer une application mobile iOS/Android complète pour notre boutique en ligne. L'application doit inclure un catalogue produits, panier, paiement sécurisé, gestion des commandes et système de notifications push.",
  excerpt: "Nous recherchons un développeur expérimenté pour créer une application mobile iOS/Android complète pour notre boutique en ligne...",

  category: "developpement",
  tags: ["mobile", "e-commerce", "urgent"],
  skillsRequired: ["React Native", "TypeScript", "API REST", "Payment Gateway"],

  budget: {
    type: "range",
    minCents: 800000, // 8000€
    maxCents: 1200000, // 12000€
    currency: "EUR",
    display: "8000-12000€"
  },

  location: {
    city: "Paris",
    country: "France",
    coordinates: {
      lat: 48.8566,
      lon: 2.3522
    },
    display: "Paris, France",
    remoteAllowed: true
  },

  client: {
    id: 456,
    displayName: "TechStartup SAS",
    rating: {
      mean: 4.2,
      count: 15
    },
    isVerified: true
  },

  status: "published",
  urgency: "high",
  deadline: "2024-03-15T23:59:59.000Z",

  isTeamMission: false,
  teamSize: 1,

  requirements: "Expérience minimum 3 ans en React Native. Portfolio d'applications e-commerce obligatoire. Connaissance des APIs de paiement (Stripe, PayPal).",
  deliverables: [
    {
      title: "Maquettes et wireframes",
      description: "Prototypes interactifs validés par le client",
      dueDate: "2024-02-15T23:59:59.000Z"
    },
    {
      title: "Application iOS et Android",
      description: "Applications compilées et testées",
      dueDate: "2024-03-10T23:59:59.000Z"
    },
    {
      title: "Documentation technique",
      description: "Guide d'installation et maintenance"
    }
  ],

  bidsSummary: {
    count: 8,
    lowestAmountCents: 750000, // 7500€
    averageAmountCents: 950000, // 9500€
    hasMyBid: false,
    myBidRank: undefined
  },

  permissions: {
    canEdit: false,
    canApply: true,
    canView: true,
    canDelete: false,
    canAward: false
  },

  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-20T14:45:30.000Z",
  publishedAt: "2024-01-15T11:00:00.000Z",
  expiresAt: "2024-03-15T23:59:59.000Z"
};

// ============================================
// HELPER POUR CONSTRUIRE LA RÉPONSE
// ============================================

export function buildMissionDetailResponse(
  mission: Mission,
  bids: Bid[],
  client: User,
  currentUserId?: number
): MissionDetailResponse {

  // Calculer bidsSummary
  const bidsSummary: BidsSummary = {
    count: bids.length,
    lowestAmountCents: bids.length > 0 ? Math.min(...bids.map(b => b.amount_cents)) : null,
    averageAmountCents: bids.length > 0 ? Math.round(bids.reduce((sum, b) => sum + b.amount_cents, 0) / bids.length) : null,
    hasMyBid: currentUserId ? bids.some(b => b.provider_id === currentUserId) : false
  };

  // Calculer myBidRank si applicable
  if (bidsSummary.hasMyBid && currentUserId) {
    const sortedBids = [...bids].sort((a, b) => a.amount_cents - b.amount_cents);
    const myBidIndex = sortedBids.findIndex(b => b.provider_id === currentUserId);
    bidsSummary.myBidRank = myBidIndex + 1;
  }

  // Construire budget object
  const budget: BudgetResponse = {
    type: mission.budget_type as any, // TODO: cast temporaire, à typer correctement
    valueCents: mission.budget_value_cents,
    minCents: mission.budget_min_cents,
    maxCents: mission.budget_max_cents,
    currency: mission.currency,
    display: formatBudgetDisplay(mission)
  };

  // Construire location object
  const location: LocationResponse = {
    raw: mission.location_raw || undefined,
    city: mission.city || undefined,
    postalCode: mission.postal_code || undefined,
    country: mission.country || undefined,
    coordinates: (mission.latitude && mission.longitude) ? {
      lat: parseFloat(mission.latitude),
      lon: parseFloat(mission.longitude)
    } : undefined,
    display: formatLocationDisplay(mission),
    remoteAllowed: mission.remote_allowed || false
  };

  // Permissions
  const permissions: PermissionsResponse = {
    canEdit: currentUserId === mission.user_id,
    canApply: currentUserId !== mission.user_id && mission.status === 'published',
    canView: true,
    canDelete: currentUserId === mission.user_id && mission.status === 'draft',
    canAward: currentUserId === mission.user_id && mission.status === 'published' && bids.length > 0
  };

  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    excerpt: generateExcerpt(mission.description || ''),

    category: mission.category || 'general',
    tags: mission.tags || [],
    skillsRequired: mission.skills_required || [],

    budget,
    location,

    client: {
      id: client.id,
      displayName: client.name || 'Client anonyme',
      rating: client.rating_mean ? {
        mean: parseFloat(client.rating_mean),
        count: client.rating_count || 0
      } : undefined,
      isVerified: true // TODO: logique de vérification
    },

    status: mission.status,
    urgency: mission.urgency || 'medium',
    deadline: mission.deadline?.toISOString(),

    isTeamMission: mission.is_team_mission || false,
    teamSize: mission.team_size || 1,

    requirements: mission.requirements || undefined,
    deliverables: (mission.deliverables as any) || [],

    bidsSummary,
    permissions,

    createdAt: mission.created_at.toISOString(),
    updatedAt: mission.updated_at.toISOString(),
    publishedAt: mission.published_at?.toISOString(),
    expiresAt: mission.expires_at?.toISOString()
  };
}

function formatBudgetDisplay(mission: Mission): string {
  if (mission.budget_value_cents) {
    return `${mission.budget_value_cents / 100}€`;
  }
  return 'Budget non spécifié';
}

function formatLocationDisplay(mission: Mission): string {
  if (mission.city && mission.country) {
    return `${mission.city}, ${mission.country}`;
  }
  if (mission.city) return mission.city;
  if (mission.remote_allowed) return 'Remote';
  return 'Localisation non spécifiée';
}