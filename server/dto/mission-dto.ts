// ============================================
// DTO MAPPER SÉCURISÉ POUR MISSIONS
// ============================================

export interface MissionRow {
  id: number;
  title: string;
  description?: string;
  excerpt?: string;
  category?: string;
  budget_value_cents?: number;
  currency?: string;
  location_data?: any; // JSONB field - peut être null
  location_raw?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  remote_allowed?: boolean;
  user_id?: number;
  client_id?: number;
  status?: string;
  urgency?: string;
  deadline?: Date;
  tags?: string[];
  skills_required?: string[];
  requirements?: string;
  is_team_mission?: boolean;
  team_size?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface LocationData {
  raw?: string;
  address?: string;
  city?: string;
  country?: string;
  remote_allowed?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Extrait et normalise les données de localisation de manière sécurisée
 * @param mission - Objet mission avec potentiel location_data JSONB
 * @returns Objet location normalisé
 */
function extractLocationSafely(mission: MissionRow): {
  location: string;
  location_raw: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  remote_allowed: boolean;
  location_data: any;
} {
  // Valeurs par défaut sûres
  const defaults = {
    location: 'Remote',
    location_raw: null,
    postal_code: null,
    city: null,
    country: 'France',
    remote_allowed: true,
    location_data: { remote_allowed: true }
  };

  try {
    // 1. Essayer d'extraire depuis location_data (JSONB)
    if (mission.location_data && typeof mission.location_data === 'object') {
      const locationData = mission.location_data;

      return {
        location: locationData.raw || locationData.city || locationData.address || 'Remote',
        location_raw: locationData.raw || mission.location_raw || null,
        postal_code: locationData.postal_code || mission.postal_code || null,
        city: locationData.city || mission.city || null,
        country: locationData.country || mission.country || 'France',
        remote_allowed: locationData.remote_allowed !== undefined ? locationData.remote_allowed : true,
        location_data: locationData
      };
    }

    // 2. Fallback sur les colonnes directes
    return {
      location: mission.location_raw || mission.city || 'Remote',
      location_raw: mission.location_raw || null,
      postal_code: mission.postal_code || null,
      city: mission.city || null,
      country: mission.country || 'France',
      remote_allowed: mission.remote_allowed !== undefined ? mission.remote_allowed : true,
      location_data: {
        raw: mission.location_raw || null,
        city: mission.city || null,
        country: mission.country || 'France',
        remote_allowed: mission.remote_allowed !== undefined ? mission.remote_allowed : true
      }
    };

  } catch (error) {
    console.warn('⚠️ Erreur extraction location, utilisation des valeurs par défaut:', error);
    return defaults;
  }
}

/**
 * Formate le budget de manière sécurisée
 * @param mission - Objet mission
 * @returns Budget formaté en string
 */
function extractBudgetSafely(mission: MissionRow): {
  budget: string;
  budget_value_cents: number;
  currency: string;
  budget_display: string;
} {
  const budgetCents = mission.budget_value_cents || 0;
  const currency = mission.currency || 'EUR';
  const budgetEuros = Math.round(budgetCents / 100);

  return {
    budget: budgetEuros.toString(),
    budget_value_cents: budgetCents,
    currency: currency,
    budget_display: budgetCents > 0 ? `${budgetEuros}€` : 'À négocier'
  };
}

/**
 * Extrait les métadonnées de manière sécurisée
 * @param mission - Objet mission
 * @returns Métadonnées normalisées
 */
function extractMetadataSafely(mission: MissionRow): {
  tags: string[];
  skills_required: string[];
  requirements: string | null;
} {
  return {
    tags: Array.isArray(mission.tags) ? mission.tags : [],
    skills_required: Array.isArray(mission.skills_required) ? mission.skills_required : [],
    requirements: mission.requirements || null
  };
}

/**
 * Mappe une mission de la DB vers le format API de manière sécurisée
 * @param mission - Ligne de mission depuis la DB
 * @returns Mission formatée pour l'API
 */
export function mapMission(mission: MissionRow): any {
  if (!mission || !mission.id) {
    console.error('❌ DTO Mapper: Mission invalide reçue:', mission);
    throw new Error('Mission data is invalid or missing required fields');
  }

  try {
    // Extraction sécurisée des différentes parties
    const location = extractLocationSafely(mission);
    const budget = extractBudgetSafely(mission);
    const metadata = extractMetadataSafely(mission);

    // Construction de l'objet final
    const mappedMission = {
      // Identifiants
      id: mission.id,

      // Contenu
      title: mission.title || 'Mission sans titre',
      description: mission.description || '',
      excerpt: mission.excerpt || (mission.description ?
        (mission.description.length > 200 ?
          mission.description.substring(0, 200) + '...' :
          mission.description
        ) :
        'Description non disponible'
      ),
      category: mission.category || 'general',

      // Budget
      ...budget,

      // Localisation
      ...location,

      // Relations utilisateur
      user_id: mission.user_id,
      client_id: mission.client_id || mission.user_id,
      userId: mission.user_id?.toString(),
      clientId: (mission.client_id || mission.user_id)?.toString(),
      clientName: 'Client', // TODO: Récupérer le vrai nom depuis une jointure

      // Statut et timing
      status: mission.status || 'open',
      urgency: mission.urgency || 'medium',
      deadline: mission.deadline?.toISOString(),

      // Métadonnées
      ...metadata,

      // Équipe
      is_team_mission: mission.is_team_mission || false,
      team_size: mission.team_size || 1,

      // Timestamps
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),

      // Champs pour compatibilité frontend
      bids: [] // Sera rempli par les routes qui récupèrent les bids
    };

    console.log('✅ DTO Mapper: Mission mappée avec succès:', mappedMission.id, mappedMission.title);
    return mappedMission;

  } catch (error) {
    console.error('❌ DTO Mapper: Erreur lors du mapping de la mission:', mission.id, error);
    console.error('❌ DTO Mapper: Données mission problématiques:', JSON.stringify(mission, null, 2));

    // Retourner un objet minimal en cas d'erreur pour éviter le crash
    return {
      id: mission.id,
      title: mission.title || 'Mission avec erreur',
      description: mission.description || '',
      excerpt: 'Erreur lors du chargement des détails',
      category: 'general',
      budget: '0',
      budget_value_cents: 0,
      currency: 'EUR',
      budget_display: 'Non disponible',
      location: 'Remote',
      location_raw: null,
      postal_code: null,
      city: null,
      country: 'France',
      remote_allowed: true,
      location_data: { remote_allowed: true },
      user_id: mission.user_id,
      client_id: mission.client_id || mission.user_id,
      userId: mission.user_id?.toString(),
      clientId: (mission.client_id || mission.user_id)?.toString(),
      clientName: 'Client',
      status: 'open',
      urgency: 'medium',
      deadline: null,
      tags: [],
      skills_required: [],
      requirements: null,
      is_team_mission: false,
      team_size: 1,
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      bids: []
    };
  }
}

/**
 * Mappe plusieurs missions de manière sécurisée
 * @param rows - Tableau de missions depuis la DB
 * @returns Tableau de missions mappées
 */
export function mapMissions(rows: MissionRow[]): any[] {
  if (!Array.isArray(rows)) {
    console.warn('⚠️ DTO Mapper: Input n\'est pas un tableau, retour tableau vide');
    return [];
  }

  const mappedMissions = [];
  let errorCount = 0;

  for (const mission of rows) {
    try {
      const mapped = mapMission(mission);
      mappedMissions.push(mapped);
    } catch (error) {
      errorCount++;
      console.error('❌ DTO Mapper: Échec du mapping pour mission:', mission?.id, error);
      // Continuer avec les autres missions au lieu de tout arrêter
    }
  }

  if (errorCount > 0) {
    console.warn(`⚠️ DTO Mapper: ${errorCount} missions n'ont pas pu être mappées correctement sur ${rows.length}`);
  } else {
    console.log(`✅ DTO Mapper: ${mappedMissions.length} missions mappées avec succès`);
  }

  return mappedMissions;
}

/**
 * Valide qu'une mission a les champs requis avant mapping
 * @param mission - Mission à valider
 * @returns true si valide
 */
export function validateMissionData(mission: any): boolean {
  return !!(
    mission?.id &&
    mission?.title &&
    typeof mission.title === 'string' &&
    mission.title.trim().length > 0
  );
}

/**
 * Fonction utilitaire pour nettoyer les objets JSONB problématiques
 * @param obj - Objet potentiellement problématique
 * @returns Objet nettoyé ou null
 */
export function sanitizeJSONB(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj === 'string') {
    try {
      return JSON.parse(obj);
    } catch {
      return null;
    }
  }

  if (typeof obj === 'object') {
    return obj;
  }

  return null;
}