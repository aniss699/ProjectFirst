
import type { 
  FlashDealRequest, 
  ReverseSubscriptionRequest, 
  GroupRequest, 
  IaHumanRequest,
  AIDraftBrief,
  LiveSlot,
  OpportunityFilters 
} from '../types/services';
import { mapToMissionView, mapToAnnouncementView, mapToBidView } from '@shared/mappers';
import type { MissionView, AnnouncementView, BidView } from '@shared/types';

// Simulation de délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const servicesApi = {
  async createFlashDeal(data: FlashDealRequest): Promise<{ success: boolean; id: string }> {
    await delay(400);
    // TODO: wire to backend - POST /api/flash-deals
    console.log('Creating flash deal:', data);
    return { success: true, id: `flash_${Date.now()}` };
  },

  async createReverseSubscription(data: ReverseSubscriptionRequest): Promise<{ success: boolean; id: string }> {
    await delay(500);
    // TODO: wire to backend - POST /api/subscriptions/reverse
    console.log('Creating reverse subscription:', data);
    return { success: true, id: `sub_${Date.now()}` };
  },

  async createGroupRequest(data: GroupRequest): Promise<{ success: boolean; id: string }> {
    await delay(350);
    // TODO: wire to backend - POST /api/group-requests
    console.log('Creating group request:', data);
    return { success: true, id: `group_${Date.now()}` };
  },

  async getGroupInterest(location: string, category: string): Promise<{ count: number }> {
    await delay(300);
    // TODO: wire to backend - GET /api/group-requests/interest
    return { count: Math.floor(Math.random() * 15) + 1 };
  },

  async aiDraftBrief(description: string): Promise<AIDraftBrief> {
    await delay(600);
    // TODO: wire to backend - POST /api/ai/draft-brief
    console.log('AI drafting brief for:', description);
    return {
      scope: `Analyse du besoin : ${description.substring(0, 100)}...`,
      deliverables: [
        'Cahier des charges détaillé',
        'Maquettes fonctionnelles',
        'Planning de réalisation',
        'Estimation budgétaire précise'
      ],
      risks: [
        'Délais serrés potentiels',
        'Complexité technique à évaluer',
        'Besoin de clarifications complémentaires'
      ],
      checklist: [
        'Validation du périmètre fonctionnel',
        'Définition des critères d\'acceptation',
        'Planification des points de contrôle',
        'Mise en place des outils de suivi'
      ]
    };
  },

  async createIaHumanJob(brief: AIDraftBrief): Promise<{ success: boolean; id: string }> {
    await delay(400);
    // TODO: wire to backend - POST /api/ia-human-jobs
    console.log('Creating IA+Human job with brief:', brief);
    return { success: true, id: `ia_${Date.now()}` };
  },

  async getLiveSlots(filters: OpportunityFilters = {}): Promise<LiveSlot[]> {
    await delay(450);
    // TODO: wire to backend - GET /api/opportunities/live-slots
    console.log('Fetching live slots with filters:', filters);
    
    // Mock data
    const providers = ['Alice M.', 'Thomas B.', 'Sophie L.', 'Marc D.', 'Emma P.'];
    const categories = ['Développement', 'Design', 'Marketing', 'Conseil', 'Formation'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `slot_${i}_${Date.now()}`,
      providerName: providers[Math.floor(Math.random() * providers.length)],
      rating: 4 + Math.random(),
      slot: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
      pricePerHour: Math.floor(Math.random() * 80) + 40,
      distance: Math.floor(Math.random() * 20) + 1,
      tags: categories.slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  },

  async reserveSlot(slotId: string): Promise<{ success: boolean }> {
    await delay(300);
    // TODO: wire to backend - POST /api/opportunities/reserve
    console.log('Reserving slot:', slotId);
    return { success: true };
  }
};

// Services API avec mappers pour la normalisation des données
export const dataApi = {
  /**
   * Récupère toutes les missions du marketplace et les normalise
   */
  async getMissions(): Promise<{ missions: MissionView[]; metadata?: any }> {
    const response = await fetch('/api/missions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API missions:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normaliser la réponse et appliquer les mappers
    let missions = [];
    let metadata = { total: 0 };

    if (data.missions && Array.isArray(data.missions)) {
      missions = data.missions;
      metadata = data.metadata || { total: data.missions.length };
    } else if (Array.isArray(data)) {
      missions = data;
      metadata = { total: data.length };
    }

    // Appliquer le mapper à chaque mission
    const normalizedMissions = missions.map(mission => mapToMissionView(mission));
    
    console.log('✅ Missions normalisées avec mappers:', normalizedMissions.length);
    return { missions: normalizedMissions, metadata };
  },

  /**
   * Récupère les missions d'un utilisateur avec leurs bids
   */
  async getUserMissions(userId: string | number): Promise<MissionView[]> {
    const response = await fetch(`/api/missions/users/${userId}/missions`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API missions utilisateur:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }
    
    const missionsData = await response.json();
    
    // Appliquer le mapper à chaque mission
    const normalizedMissions = missionsData.map((mission: any) => mapToMissionView(mission));
    
    console.log('✅ Missions utilisateur normalisées:', normalizedMissions.length);
    return normalizedMissions;
  },

  /**
   * Récupère les bids d'un utilisateur 
   */
  async getUserBids(userId: string | number): Promise<BidView[]> {
    const response = await fetch(`/api/missions/users/${userId}/bids`);
    if (!response.ok) {
      throw new Error('Failed to fetch user bids');
    }
    
    const bidsData = await response.json();
    
    // Appliquer le mapper à chaque bid
    const normalizedBids = bidsData.map((bid: any) => mapToBidView(bid));
    
    console.log('✅ Bids utilisateur normalisés:', normalizedBids.length);
    return normalizedBids;
  },

  /**
   * Récupère une mission spécifique par ID
   */
  async getMissionById(missionId: string | number): Promise<MissionView> {
    const response = await fetch(`/api/missions/${missionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API mission:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const missionData = await response.json();
    
    // Appliquer le mapper
    const normalizedMission = mapToMissionView(missionData);
    
    console.log('✅ Mission normalisée:', normalizedMission.title);
    return normalizedMission;
  },

  /**
   * Récupère le feed d'annonces
   */
  async getFeed(cursor?: string, limit = 10): Promise<{ items: AnnouncementView[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (cursor) queryParams.append('cursor', cursor);
    
    const response = await fetch(`/api/feed?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement du feed');
    }

    const data = await response.json();
    const rawItems = data.items || [];

    // Appliquer le mapper à chaque annonce
    const normalizedItems = rawItems.map((item: any) => mapToAnnouncementView(item));
    
    console.log('✅ Feed normalisé:', normalizedItems.length, 'annonces');
    return {
      items: normalizedItems,
      hasMore: normalizedItems.length === limit
    };
  },

  /**
   * Récupère les favoris d'un utilisateur
   */
  async getFavorites(userId: string | number): Promise<AnnouncementView[]> {
    const response = await fetch(`/api/favorites?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des favoris');
    }

    const data = await response.json();
    const rawFavorites = data.favorites || [];

    // Appliquer le mapper à chaque favori
    const normalizedFavorites = rawFavorites.map((favorite: any) => mapToAnnouncementView(favorite));
    
    console.log('✅ Favoris normalisés:', normalizedFavorites.length);
    return normalizedFavorites;
  }
};
