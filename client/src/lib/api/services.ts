
import type { 
  FlashDealRequest, 
  ReverseSubscriptionRequest, 
  GroupRequest, 
  IaHumanRequest,
  AIDraftBrief,
  LiveSlot,
  OpportunityFilters 
} from '../types/services';

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
