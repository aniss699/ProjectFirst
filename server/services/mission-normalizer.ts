
import { CreateMissionInput, BudgetInput, LocationInput, TeamInput } from '../validation/mission-schemas.js';
import { NewMission } from '../../shared/schema.js';

// ============================================
// FONCTION DE NORMALISATION SÉCURISÉE
// ============================================

interface NormalizedMission extends Omit<NewMission, 'id' | 'created_at' | 'updated_at'> {
  // Type sûr pour insertion DB
}

export interface NormalizeMissionOptions {
  authUserId: number;
  forceStatus?: 'draft' | 'published';
  validateBusinessRules?: boolean;
}

/**
 * Normalise et valide une mission pour insertion sécurisée en base
 * @param rawData - Données reçues du frontend (déjà validées par Zod)
 * @param options - Options de normalisation (userId auth obligatoire)
 * @returns Objet prêt pour insertion DB avec vérifications métier
 */
export function normalizeMission(
  rawData: CreateMissionInput,
  options: NormalizeMissionOptions
): NormalizedMission {
  
  const { authUserId, forceStatus, validateBusinessRules = true } = options;
  
  // === 1. SÉCURITÉ : Forcer l'ownership ===
  if (!authUserId || authUserId <= 0) {
    throw new Error('Auth user ID is required and must be positive');
  }
  
  // === 2. NORMALISER LE BUDGET ===
  const budgetNormalized = normalizeBudget(rawData.budget);
  
  // === 3. NORMALISER LA LOCALISATION ===
  const locationNormalized = normalizeLocation(rawData.location);
  
  // === 4. NORMALISER L'ÉQUIPE ===
  const teamNormalized = normalizeTeam(rawData.team);
  
  // === 5. NORMALISER LES DATES ===
  const deadlineNormalized = normalizeDeadline(rawData.deadline);
  
  // === 6. RÈGLES MÉTIER ===
  if (validateBusinessRules) {
    validateBusinessRules_internal(rawData, budgetNormalized, teamNormalized);
  }
  
  // === 7. CONSTRUIRE L'OBJET FINAL ===
  const normalized: NormalizedMission = {
    // Contenu (sanitisé par Zod)
    title: rawData.title,
    description: rawData.description,
    // excerpt sera généré par la DB (GENERATED column)
    
    // Catégorisation
    category: rawData.category,
    tags: rawData.tags || [],
    skills_required: rawData.skillsRequired || [],
    
    // Budget (centimes + type)
    budget_type: budgetNormalized.type,
    budget_value_cents: budgetNormalized.valueCents || null,
    budget_min_cents: budgetNormalized.minCents || null,
    budget_max_cents: budgetNormalized.maxCents || null,
    currency: budgetNormalized.currency,
    
    // Localisation
    location_raw: locationNormalized.raw || null,
    city: locationNormalized.city || null,
    postal_code: locationNormalized.postalCode || null,
    country: locationNormalized.country,
    latitude: locationNormalized.latitude || null,
    longitude: locationNormalized.longitude || null,
    remote_allowed: locationNormalized.remoteAllowed,
    
    // Ownership (SÉCURISÉ)
    user_id: authUserId,
    client_id: authUserId, // Par défaut, client = user
    provider_id: null, // Sera assigné plus tard
    
    // Statut et timing
    status: forceStatus || rawData.status || 'draft',
    urgency: rawData.urgency || 'medium',
    deadline: deadlineNormalized,
    
    // Équipe
    is_team_mission: teamNormalized.isTeamMission,
    team_size: teamNormalized.teamSize,
    
    // Métadonnées
    requirements: rawData.requirements || null,
    deliverables: rawData.deliverables || [],
    
    // Audit (timestamps gérés par DB)
    published_at: null, // Sera set par trigger si status = published
    expires_at: null    // Sera calculé par logique métier
  };
  
  return normalized;
}

// ============================================
// FONCTIONS UTILITAIRES DE NORMALISATION
// ============================================

function normalizeBudget(budget: BudgetInput): {
  valueCents: number;
  currency: string;
} {
  return {
    valueCents: budget.valueCents,
    currency: budget.currency
  };
}

function normalizeLocation(location?: LocationInput): {
  raw?: string;
  city?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  remoteAllowed: boolean;
} {
  if (!location) {
    return {
      country: 'France',
      remoteAllowed: true
    };
  }
  
  return {
    raw: location.raw?.trim() || undefined,
    city: location.city?.trim() || undefined,
    postalCode: location.postalCode?.trim() || undefined,
    country: location.country || 'France',
    latitude: location.latitude || undefined,
    longitude: location.longitude || undefined,
    remoteAllowed: location.remoteAllowed
  };
}

function normalizeTeam(team?: TeamInput): {
  isTeamMission: boolean;
  teamSize: number;
} {
  if (!team) {
    return {
      isTeamMission: false,
      teamSize: 1
    };
  }
  
  return {
    isTeamMission: team.isTeamMission,
    teamSize: team.teamSize
  };
}

function normalizeDeadline(deadline?: Date): string | null {
  if (!deadline) return null;
  
  // Vérifier que la deadline est dans le futur
  if (deadline <= new Date()) {
    throw new Error('Deadline must be in the future');
  }
  
  // Vérifier que la deadline n'est pas trop lointaine (1 an max)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (deadline > oneYearFromNow) {
    throw new Error('Deadline cannot be more than 1 year in the future');
  }
  
  return deadline.toISOString();
}

// ============================================
// VALIDATION DES RÈGLES MÉTIER
// ============================================

function validateBusinessRules_internal(
  rawData: CreateMissionInput,
  budget: ReturnType<typeof normalizeBudget>,
  team: ReturnType<typeof normalizeTeam>
): void {
  
  // Règle 1: Mission d'équipe doit avoir team_size > 1
  if (team.isTeamMission && team.teamSize <= 1) {
    throw new Error('Team mission must have team size greater than 1');
  }
  
  // Règle 2: Budget minimum absolu (10€)
  const minBudgetCents = 1000; // 10€
  if (budget.valueCents < minBudgetCents) {
    throw new Error(`Minimum budget is ${minBudgetCents / 100}€`);
  }
  
  // Règle 4: Description et titre cohérents
  if (rawData.title.toLowerCase() === rawData.description.toLowerCase()) {
    throw new Error('Title and description cannot be identical');
  }
  
  // Règle 5: Tags uniques
  const uniqueTags = new Set(rawData.tags?.map(tag => tag.toLowerCase()));
  if (rawData.tags && uniqueTags.size !== rawData.tags.length) {
    throw new Error('Tags must be unique');
  }
  
  // Règle 6: Skills uniques
  const uniqueSkills = new Set(rawData.skillsRequired?.map(skill => skill.toLowerCase()));
  if (rawData.skillsRequired && uniqueSkills.size !== rawData.skillsRequired.length) {
    throw new Error('Required skills must be unique');
  }
}

// ============================================
// FONCTIONS UTILITAIRES EXPORT
// ============================================

/**
 * Convertit des euros en centimes
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convertit des centimes en euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Formate un montant en centimes pour affichage
 */
export function formatAmount(cents: number, currency: string = 'EUR'): string {
  const euros = centsToEuros(cents);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency
  }).format(euros);
}

/**
 * Génère un excerpt sûr
 */
export function generateExcerpt(description: string, maxLength: number = 200): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  return description.substring(0, maxLength - 3).trim() + '...';
}
