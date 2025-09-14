import { create } from 'zustand';
import type { AnnouncementView } from '@shared/types';
import { dataApi } from '@/lib/api/services';

interface FavoritesState {
  favorites: AnnouncementView[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addToFavorites: (announcement: AnnouncementView) => Promise<void>;
  removeFromFavorites: (announcementId: number) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isFavorite: (announcementId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  loading: false,
  error: null,

  addToFavorites: async (announcement: AnnouncementView) => {
    const state = get();
    
    // Éviter les doublons
    if (state.favorites.some(fav => fav.id === announcement.id)) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // TODO: récupérer depuis auth
          announcement_id: announcement.id
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout aux favoris');
      }

      // Ajouter localement
      set({
        favorites: [...state.favorites, announcement],
        loading: false
      });

    } catch (error) {
      console.error('Erreur addToFavorites:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  },

  removeFromFavorites: async (announcementId: number) => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const response = await fetch(`/api/favorites/${announcementId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 }) // TODO: récupérer depuis auth
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression des favoris');
      }

      // Supprimer localement
      set({
        favorites: state.favorites.filter(fav => fav.id !== announcementId),
        loading: false
      });

    } catch (error) {
      console.error('Erreur removeFromFavorites:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  },

  loadFavorites: async () => {
    set({ loading: true, error: null });

    try {
      console.log('🔄 Chargement favoris avec mappers...');
      
      // Utiliser le service API centralisé avec mappers
      const normalizedFavorites = await dataApi.getFavorites(1); // TODO: récupérer user ID depuis auth
      
      set({
        favorites: normalizedFavorites,
        loading: false
      });

      console.log('✅ Favoris normalisés chargés:', normalizedFavorites.length);

    } catch (error) {
      console.error('Erreur loadFavorites:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        favorites: [] 
      });
    }
  },

  isFavorite: (announcementId: number) => {
    return get().favorites.some(fav => fav.id === announcementId);
  }
}));