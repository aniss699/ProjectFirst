
import { useState, useEffect } from 'react';

interface MissionDraft {
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  lastSaved: string;
}

const DRAFT_KEY = 'mission_draft';

export function useMissionDraft() {
  const [draft, setDraft] = useState<MissionDraft | null>(null);

  // Charger le brouillon au démarrage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft));
      } catch (error) {
        console.warn('Erreur lors du chargement du brouillon:', error);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Sauvegarder automatiquement
  const saveDraft = (missionData: Partial<MissionDraft>) => {
    const newDraft = {
      title: '',
      description: '',
      category: 'developpement',
      budget: '',
      location: '',
      ...draft,
      ...missionData,
      lastSaved: new Date().toISOString()
    };

    setDraft(newDraft);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(newDraft));
  };

  // Supprimer le brouillon
  const clearDraft = () => {
    setDraft(null);
    localStorage.removeItem(DRAFT_KEY);
  };

  // Vérifier si il y a des changements non sauvegardés
  const hasDraft = () => {
    return draft && (draft.title || draft.description);
  };

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft: hasDraft()
  };
}
