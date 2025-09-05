import { create } from 'zustand';
import { Announcement } from '../../shared/schema';

interface FeedState {
  // État du feed
  items: Announcement[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  loadFeed: (reset?: boolean) => Promise<void>;
  handleAction: (action: 'save' | 'skip' | 'open', announcementId: number) => void;
  preloadNext: () => Promise<void>;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  // État initial
  items: [],
  currentIndex: 0,
  loading: false,
  error: null,
  hasMore: true,

  // Charger le feed
  loadFeed: async (reset = false) => {
    const state = get();
    
    if (state.loading) return;
    
    set({ loading: true, error: null });

    try {
      const cursor = reset ? undefined : (state.items.length > 0 ? state.items[state.items.length - 1]?.id : undefined);
      const queryParams = new URLSearchParams({ limit: '10' });
      if (cursor) queryParams.append('cursor', cursor.toString());
      const response = await fetch(`/api/feed?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du feed');
      }

      const data = await response.json();
      const newItems = data.items || [];

      set({
        items: reset ? newItems : [...state.items, ...newItems],
        currentIndex: reset ? 0 : state.currentIndex,
        hasMore: newItems.length === 10,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erreur loadFeed:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  },

  // Gérer les actions utilisateur
  handleAction: async (action: 'save' | 'skip' | 'open', announcementId: number) => {
    const state = get();
    
    try {
      // Envoyer le feedback à l'API
      await fetch('/api/feed/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // TODO: récupérer depuis auth
          announcement_id: announcementId,
          action: action,
          dwell_ms: Math.random() * 5000 + 1000 // Simulation
        })
      });

      // Passer à l'annonce suivante
      set({ currentIndex: state.currentIndex + 1 });

      // Précharger si nécessaire
      if (state.currentIndex + 1 >= state.items.length - 2) {
        get().preloadNext();
      }

      console.log(`Action ${action} sur annonce:`, announcementId);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }
  },

  // Précharger les annonces suivantes
  preloadNext: async () => {
    const state = get();
    
    if (state.loading || !state.hasMore) return;
    
    await get().loadFeed(false);
  },

  // Réinitialiser
  reset: () => {
    set({
      items: [],
      currentIndex: 0,
      loading: false,
      error: null,
      hasMore: true
    });
  }
}));