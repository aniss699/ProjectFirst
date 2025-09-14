// Types de vue pour l'interface utilisateur
// Séparés du schéma de base pour éviter les conflits

export interface BidView {
  id: string;
  providerId: string;
  providerName: string;
  amount: number; // Toujours en nombre pour les calculs
  price?: string; // Format string pour l'affichage
  message?: string;
  bid_type?: 'individual' | 'team' | 'open_team';
  timeline_days?: number;
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export interface MissionView {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number; // Standardisé en nombre
  budgetDisplay: string; // Format d'affichage
  location?: string;
  clientName: string;
  createdAt: string; // Toujours présent, format ISO
  status: string;
  urgency?: string;
  bids: BidView[];
  teamRequirements?: TeamRequirement[];
}

export interface AnnouncementView {
  id: number;
  title: string;
  description: string; // Mappé depuis 'content' en DB
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: Date;
  city?: string;
  userId: number; // Mappé depuis 'user_id'
  tags?: string[];
  sponsored?: boolean;
  qualityScore?: number;
}

// Ré-export du type existant pour compatibilité
export interface TeamRequirement {
  profession: string;
  description: string;
  required_skills: string[];
  estimated_budget: number;
  estimated_days: number;
  min_experience: number;
  is_lead_role: boolean;
  importance: 'high' | 'medium' | 'low';
}

// Types d'utilitaires pour les conversions
export interface MissionWithBids extends MissionView {
  // Alias pour la compatibilité existante
}

// Helper pour créer des objets de vue vides/par défaut
export const createEmptyMissionView = (): Partial<MissionView> => ({
  bids: [],
  createdAt: new Date().toISOString(),
  budgetDisplay: '0€'
});

export const createEmptyAnnouncementView = (): Partial<AnnouncementView> => ({
  tags: [],
  sponsored: false,
  qualityScore: 0.8
});