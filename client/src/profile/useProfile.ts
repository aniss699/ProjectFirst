
import { useState, useEffect } from 'react';
import { AnyProfile, ClientProfile, ProviderProfile } from '../../shared/types/profile';
import { computeProfileCompleteness } from '../../shared/utils/profileScore';

// Simulation stockage local en attendant l'API
const STORAGE_KEY = 'appels_pro_profile';

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<AnyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Tentative API d'abord
      try {
        const response = await fetch(`/api/profile/${userId || 'me'}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          return;
        }
      } catch (e) {
        console.log('API profile non disponible, utilisation du stockage local');
      }
      
      // Fallback stockage local
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId || 'current'}`);
      if (stored) {
        const parsedProfile = JSON.parse(stored);
        parsedProfile.completeness = computeProfileCompleteness(parsedProfile);
        setProfile(parsedProfile);
      } else {
        // Profil par défaut
        const defaultProfile: Partial<AnyProfile> = {
          userId: userId || 'current',
          role: 'provider',
          displayName: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completeness: 0
        };
        setProfile(defaultProfile as AnyProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AnyProfile>) => {
    if (!profile) return;

    try {
      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
        completeness: computeProfileCompleteness({ ...profile, ...updates })
      };

      // Tentative API d'abord
      try {
        const response = await fetch(`/api/profile/${profile.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile)
        });
        
        if (response.ok) {
          setProfile(updatedProfile);
          return;
        }
      } catch (e) {
        console.log('API profile non disponible, sauvegarde locale');
      }

      // Fallback stockage local
      localStorage.setItem(
        `${STORAGE_KEY}_${profile.userId}`, 
        JSON.stringify(updatedProfile)
      );
      setProfile(updatedProfile);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    }
  };

  const saveStep = async (stepData: Partial<AnyProfile>) => {
    await updateProfile(stepData);
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    saveStep,
    refreshProfile: loadProfile
  };
}

export function usePublicProfile(userId: string) {
  const [profile, setProfile] = useState<AnyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicProfile();
  }, [userId]);

  const loadPublicProfile = async () => {
    try {
      setLoading(true);
      
      // Tentative API d'abord
      try {
        const response = await fetch(`/api/profile/${userId}/public`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          return;
        }
      } catch (e) {
        console.log('API profile public non disponible');
      }
      
      // Fallback stockage local (pour démo)
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (stored) {
        const parsedProfile = JSON.parse(stored);
        
        // Respecter les préférences de visibilité
        if (parsedProfile.preferences?.visibility === 'private') {
          setError('Profil privé');
          return;
        }
        
        if (parsedProfile.preferences?.visibility === 'anonymized') {
          // Anonymiser certaines données
          parsedProfile.displayName = parsedProfile.displayName.charAt(0) + '***';
          delete parsedProfile.location;
          delete parsedProfile.portfolio;
        }
        
        setProfile(parsedProfile);
      } else {
        setError('Profil non trouvé');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error
  };
}
