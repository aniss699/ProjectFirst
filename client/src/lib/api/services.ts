import type { 
  FlashDealRequest, 
  ReverseSubscriptionRequest, 
  GroupRequest, 
  IaHumanRequest,
  AIDraftBrief,
  LiveSlot,
  OpportunityFilters 
} from '../types/services';
import { mapToMissionView, mapToAnnouncementView, mapToBidView, mapMissionFromApi } from '@shared/mappers';
import type { MissionView, AnnouncementView, BidView } from '@shared/types';

// Simulation de délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const servicesApi = {
  async createFlashDeal(data: FlashDealRequest): Promise<{ success: boolean; id: string }> {
    const response = await fetch('/api/services/flash-deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du flash deal');
    }

    return await response.json();
  },

  async createReverseSubscription(data: ReverseSubscriptionRequest): Promise<{ success: boolean; id: string }> {
    const response = await fetch('/api/services/subscriptions/reverse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'abonnement inversé');
    }

    return await response.json();
  },

  async createGroupRequest(data: GroupRequest): Promise<{ success: boolean; id: string }> {
    const response = await fetch('/api/services/group-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la demande groupée');
    }

    return await response.json();
  },

  async getGroupInterest(location: string, category: string): Promise<{ count: number }> {
    const response = await fetch(`/api/services/group-requests/interest?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'intérêt');
    }

    return await response.json();
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
    const response = await fetch('/api/services/ia-human-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(brief),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du job IA+Humain');
    }

    return await response.json();
  },

  async getLiveSlots(filters: OpportunityFilters = {}): Promise<LiveSlot[]> {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.location) queryParams.append('location', filters.location);

    const response = await fetch(`/api/services/opportunities/live-slots?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des créneaux');
    }

    return await response.json();
  },

  async reserveSlot(slotId: string): Promise<{ success: boolean }> {
    const response = await fetch('/api/services/opportunities/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la réservation du créneau');
    }

    return await response.json();
  }
};

// Services API avec mappers pour la normalisation des données
export const dataApi = {
  availability: {
    get: async (userId: number, startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/availability/${userId}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },
    save: async (availability: any[]) => {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      });
      if (!response.ok) throw new Error('Failed to save availability');
      return response.json();
    },
    getSlots: async (userId: number, date: string) => {
      const response = await fetch(`/api/availability/slots/${userId}/${date}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
    deleteSlot: async (availabilityId: number) => {
      const response = await fetch(`/api/availability/${availabilityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete slot');
      return response.json();
    },
    getRecurring: async (userId: number) => {
      const response = await fetch(`/api/availability/recurring/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch recurring availability');
      return response.json();
    },
    saveRecurring: async (pattern: any) => {
      const response = await fetch('/api/availability/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pattern),
      });
      if (!response.ok) throw new Error('Failed to save recurring pattern');
      return response.json();
    },
  },
  feed: {
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
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
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
  async getMissionById(id: string): Promise<MissionView> {
    console.log('🔍 API Service - getMissionById appelé avec ID:', id);

    // Validation préalable de l'ID
    if (!id || id === 'undefined' || id === 'null') {
      console.error('❌ API Service - ID invalide:', id);
      throw new Error('ID de mission invalide');
    }

    const response = await fetch(`/api/missions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 API Service - Réponse reçue:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API mission:', response.status, errorText);
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const missionData = await response.json();
    console.log('🔍 API Service - Données brutes reçues:', {
      id: missionData.id,
      title: missionData.title,
      hasBids: !!missionData.bids
    });

    const normalizedMission = mapMissionFromApi(missionData);
    console.log('✅ Mission normalisée:', normalizedMission.title, 'avec', normalizedMission.bids?.length || 0, 'offres');
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