
import type { Location } from '../../shared/schema.js';

// Interface pour les données de mission brutes de la DB
export interface MissionRow {
  id: number;
  title: string;
  description: string | null;
  excerpt: string | null;
  category: string | null;
  budget_value_cents: number | null;
  currency: string | null;
  location_raw: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  remote_allowed: boolean | null;
  user_id: number | null;
  client_id: number | null;
  status: string | null;
  urgency: string | null;
  deadline: Date | null;
  tags: string[] | null;
  skills_required: string[] | null;
  requirements: string | null;
  is_team_mission: boolean | null;
  team_size: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Interface pour les données de localisation
export interface LocationData {
  raw?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  remote_allowed?: boolean;
}

/**
 * Génère un excerpt à partir de la description si absent
 */
function generateExcerpt(description: string | null, maxLength: number = 200): string {
  if (!description) return '';
  
  if (description.length <= maxLength) {
    return description;
  }

  // Chercher la fin de phrase la plus proche
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // Sinon, couper au dernier espace
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  return truncated.trim() + '...';
}

/**
 * Formate le budget pour l'affichage
 */
function formatBudget(budgetValueCents: number | null, currency: string | null = 'EUR'): string {
  if (!budgetValueCents) return '0';
  
  const budgetEuros = Math.round(budgetValueCents / 100);
  return budgetEuros.toString();
}

/**
 * Construit l'objet location à partir des champs disponibles
 */
function buildLocationData(row: MissionRow): LocationData {
  return {
    raw: row.location_raw || undefined,
    city: row.city || undefined,
    country: row.country || 'France',
    postal_code: row.postal_code || undefined,
    remote_allowed: row.remote_allowed ?? true
  };
}

/**
 * Formate la localisation pour l'affichage
 */
function formatLocation(locationData: LocationData): string {
  if (locationData.city && locationData.country) {
    return `${locationData.city}, ${locationData.country}`;
  }
  
  if (locationData.city) return locationData.city;
  if (locationData.raw) return locationData.raw;
  if (locationData.remote_allowed) return 'Remote';
  
  return 'Non spécifié';
}

/**
 * Mappe une mission de la DB vers le format API
 */
export function mapMission(row: MissionRow): any {
  const locationData = buildLocationData(row);
  
  return {
    // Identifiants
    id: row.id,
    
    // Contenu principal
    title: row.title || 'Mission sans titre',
    description: row.description || '',
    excerpt: row.excerpt || generateExcerpt(row.description),
    category: row.category || 'general',
    
    // Budget
    budget_value_cents: row.budget_value_cents,
    budget: formatBudget(row.budget_value_cents, row.currency),
    currency: row.currency || 'EUR',
    
    // Location - formats multiples pour compatibilité
    location_data: locationData,
    location: formatLocation(locationData),
    location_raw: row.location_raw,
    postal_code: row.postal_code,
    city: row.city,
    country: row.country,
    remote_allowed: row.remote_allowed,
    
    // Relations utilisateur
    user_id: row.user_id,
    client_id: row.client_id,
    userId: row.user_id?.toString(),
    clientId: row.client_id?.toString(),
    clientName: 'Client', // Par défaut, sera remplacé par la vraie valeur si disponible
    
    // Statut et priorité
    status: row.status || 'open',
    urgency: row.urgency || 'medium',
    deadline: row.deadline?.toISOString(),
    
    // Métadonnées projet
    tags: row.tags || [],
    skills_required: row.skills_required || [],
    requirements: row.requirements,
    
    // Équipe
    is_team_mission: row.is_team_mission || false,
    team_size: row.team_size || 1,
    
    // Timestamps
    created_at: row.created_at,
    updated_at: row.updated_at,
    createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: row.updated_at?.toISOString(),
    
    // Champs calculés/par défaut pour compatibilité frontend
    bids: [], // Sera populé séparément si nécessaire
    teamRequirements: [], // Pour les missions d'équipe
  };
}

/**
 * Mappe plusieurs missions
 */
export function mapMissions(rows: MissionRow[]): any[] {
  return rows.map(mapMission);
}

/**
 * Valide qu'une mission a les champs requis
 */
export function validateMissionData(mission: any): boolean {
  return !!(
    mission.id &&
    mission.title &&
    mission.description
  );
}
