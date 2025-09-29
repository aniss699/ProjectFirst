import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import type { MissionView } from '@shared/types';
import { dataApi } from '@/lib/api/services';
import { MissionCard } from '@/components/missions/mission-card';
import { SystemStatusBanner } from '@/components/ui/system-status-banner';
import { categories } from '@/lib/categories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import MissionMatchingEngine from '@/components/ai/mission-matching-engine';
import { useAuth } from '@/hooks/use-auth';

// Utiliser le type normalisé MissionView qui inclut déjà les bids
type MissionWithBids = MissionView;

export default function Marketplace() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAIMatching, setShowAIMatching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState<number>(0);
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    location: '',
    sort: 'newest',
  });

  const { data: missionsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/missions'],
    queryFn: async () => {
      console.log('🔄 Début requête missions API avec mappers...');
      
      try {
        // Utiliser le service API centralisé avec mappers
        const result = await dataApi.getMissions();
        console.log('✅ Missions normalisées récupérées:', result.missions.length);
        return result;
      } catch (networkError) {
        console.error('❌ Erreur réseau:', networkError);
        // Retourner des données de fallback au lieu de throw
        return {
          missions: [],
          metadata: {
            total: 0,
            has_errors: true,
            error_message: `Erreur réseau: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`,
            fallback_mode: true
          }
        };
      }
    },
    refetchInterval: 120000, // 2 minutes pour réduire la charge
    retry: (failureCount, error) => {
      console.log(`🔄 Tentative ${failureCount + 1}/3 après erreur:`, error);
      return failureCount < 2; // Maximum 3 tentatives
    },
    retryDelay: attemptIndex => {
      const delay = Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      console.log(`⏳ Retry dans ${delay}ms`);
      return delay;
    },
    staleTime: 60000, // Cache valide 1 minute
    gcTime: 300000, // Garder en cache 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      errorPolicy: 'soft' // Ne pas propager les erreurs, utiliser les fallbacks
    }
  });

  // Extraire les missions et métadonnées de manière sécurisée
  const missions = missionsResponse?.missions || [];
  const metadata = missionsResponse?.metadata || { total: 0 };
  const isFallbackMode = metadata.fallback_mode || false;

  console.log('🏪 Marketplace - État actuel:', { 
    missionsCount: missions.length, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message 
  });

  // Retry automatique intelligent
  useEffect(() => {
    if (error && !isLoading && retryCount < 3) {
      const now = Date.now();
      const timeSinceLastRetry = now - lastRetryTime;
      const minRetryInterval = 5000; // 5 secondes minimum entre les tentatives

      if (timeSinceLastRetry > minRetryInterval) {
        const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 10000); // Backoff exponentiel
        
        console.log(`🔄 Retry automatique #${retryCount + 1} dans ${retryDelay}ms`);
        
        const timeoutId = setTimeout(() => {
          console.log(`🔄 Exécution retry automatique #${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
          setLastRetryTime(Date.now());
          refetch();
        }, retryDelay);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [error, isLoading, retryCount, lastRetryTime, refetch]);

  // Reset retry counter en cas de succès
  useEffect(() => {
    if (!error && !isLoading && missions.length > 0) {
      setRetryCount(0);
    }
  }, [error, isLoading, missions.length]);

  const filteredAndSortedMissions = missions
    .filter((mission: MissionWithBids) => {
      if (filters.category && filters.category !== 'all' && mission.category !== filters.category) return false;
      if (filters.location && !mission.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.budget && filters.budget !== 'all') {
        const budget = mission.budget; // Déjà normalisé en nombre par le mapper
        switch (filters.budget) {
          case '0-500':
            return budget >= 0 && budget <= 500;
          case '500-2000':
            return budget > 500 && budget <= 2000;
          case '2000-5000':
            return budget > 2000 && budget <= 5000;
          case '5000+':
            return budget > 5000;
          default:
            return true;
        }
      }
      return true;
    })
    .sort((a: MissionWithBids, b: MissionWithBids) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case 'budget-high':
          return b.budget - a.budget; // Déjà normalisés en nombre par le mapper
        case 'budget-low':
          return a.budget - b.budget; // Déjà normalisés en nombre par le mapper
        case 'bids':
          return b.bids.length - a.bids.length;
        default:
          return 0;
      }
    });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
          {t('marketplace.title')}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-4">
          {t('marketplace.subtitle')}
        </p>
        
        {/* Bannière de statut système */}
        <SystemStatusBanner
          isLoading={isLoading}
          hasError={!!error && !isFallbackMode}
          isFallbackMode={isFallbackMode}
          errorMessage={metadata?.error_message}
          onRetry={() => {
            console.log('🔄 Retry depuis la bannière');
            refetch();
          }}
          className="mb-4"
        />
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-3xl shadow-xl border border-blue-100/50 p-6 sm:p-8 sticky top-24 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('marketplace.filterTitle')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {t('marketplace.category')}
              </Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="bg-white/80 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder={t('marketplace.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('marketplace.allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t('marketplace.budget')}
              </Label>
              <Select value={filters.budget} onValueChange={(value) => handleFilterChange('budget', value)}>
                <SelectTrigger className="bg-white/80 border-gray-200 hover:border-green-400 transition-colors">
                  <SelectValue placeholder={t('marketplace.allBudgets')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('marketplace.allBudgets')}</SelectItem>
                  <SelectItem value="0-500">{t('budget.range.0-500')}</SelectItem>
                  <SelectItem value="500-2000">{t('budget.range.500-2000')}</SelectItem>
                  <SelectItem value="2000-5000">{t('budget.range.2000-5000')}</SelectItem>
                  <SelectItem value="5000+">{t('budget.range.5000+')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {t('marketplace.location')}
              </Label>
              <Input
                type="text"
                placeholder={t('marketplace.locationPlaceholder')}
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="bg-white/80 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <Button
            onClick={() => setFilters({ category: 'all', budget: 'all', location: '', sort: 'newest' })}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
          >
            {t('marketplace.resetFilters')}
          </Button>
        </div>
      </div>

      <div className="lg:w-3/4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('marketplace.allMissions')} ({filteredAndSortedMissions.length})
            </h2>
            
            {/* Indicateurs de santé du système */}
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  {t('marketplace.serviceStatus.loading')}
                </div>
              )}
              
              {!isLoading && !error && !isFallbackMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {t('marketplace.serviceStatus.active')}
                </div>
              )}
              
              {isFallbackMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  {t('marketplace.serviceStatus.degraded')}
                </div>
              )}
              
              {metadata?.total !== undefined && (
                <div className="text-sm text-gray-500">
                  {metadata.total} {t('marketplace.total')}{metadata.has_errors && ` ${t('marketplace.withErrors')}`}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {user?.type === 'provider' && (
              <Button
                onClick={() => setShowAIMatching(!showAIMatching)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
              >
                🤖 Matching IA
              </Button>
            )}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-gray-500 whitespace-nowrap">{t('marketplace.sortBy')}</span>
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('marketplace.newest')}</SelectItem>
                  <SelectItem value="budget-high">{t('marketplace.budgetHigh')}</SelectItem>
                  <SelectItem value="budget-low">{t('marketplace.budgetLow')}</SelectItem>
                  <SelectItem value="bids">{t('marketplace.bidsCount')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showAIMatching && user?.type === 'provider' && (
          <div className="mb-8">
            <MissionMatchingEngine
              providerProfile={{
                id: user.id,
                skills: ['React', 'Node.js', 'TypeScript', 'Python'],
                location: 'Paris',
                rating: 4.7,
                completedProjects: 28,
                portfolio: [],
                hourlyRate: 65,
                categories: ['web-development', 'mobile-development']
              }}
              missions={filteredAndSortedMissions}
              onMissionRecommended={(mission: any) => {
                setLocation(`/missions/${mission.missionId}`);
                setShowAIMatching(false);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading && (
            <div className="text-center py-12 sm:col-span-2 lg:col-span-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des missions...</p>
            </div>
          )}

          {/* Mode dégradé avec messages d'erreur améliorés */}
          {(error || isFallbackMode) && !isLoading && (
            <div className="text-center py-12 sm:col-span-2 lg:col-span-3">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-8 mx-auto max-w-2xl">
                <div className="text-orange-500 mb-4">
                  {isFallbackMode ? '⚠️' : '❌'}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {isFallbackMode ? 'Mode dégradé activé' : 'Problème de chargement'}
                </h3>
                
                <p className="text-gray-700 text-base mb-4">
                  {isFallbackMode 
                    ? 'Les missions ne peuvent pas être chargées normalement. Le système fonctionne en mode dégradé.'
                    : 'Impossible de charger les missions pour le moment.'
                  }
                </p>

                {metadata.error_message && (
                  <div className="bg-white/70 rounded-lg p-4 mb-4 text-sm text-gray-600">
                    <span className="font-medium">Détail:</span> {metadata.error_message}
                  </div>
                )}

                {process.env.NODE_ENV === 'development' && error && (
                  <details className="mt-4 text-left bg-white/50 p-4 rounded-lg text-xs">
                    <summary className="cursor-pointer font-medium text-gray-700">Informations de debug</summary>
                    <div className="mt-3 space-y-2">
                      <div><strong>Message:</strong> {error?.message}</div>
                      <div><strong>Metadata:</strong> {JSON.stringify(metadata, null, 2)}</div>
                      <div><strong>isFallbackMode:</strong> {isFallbackMode ? 'Oui' : 'Non'}</div>
                    </div>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <button 
                    onClick={() => {
                      console.log('🔄 Retry manuel déclenché');
                      refetch();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    🔄 Réessayer
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('🏠 Retour accueil');
                      window.location.href = '/';
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    🏠 Retour accueil
                  </button>
                </div>

                {/* Suggestions d'action */}
                <div className="mt-6 text-sm text-gray-600">
                  <p className="mb-2">💡 <strong>Suggestions:</strong></p>
                  <ul className="text-left space-y-1 max-w-md mx-auto">
                    <li>• Vérifiez votre connexion internet</li>
                    <li>• Essayez de recharger dans quelques minutes</li>
                    <li>• Contactez le support si le problème persiste</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Mode dégradé avec missions de démonstration */}
          {isFallbackMode && !isLoading && missions.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">🎯 Missions de démonstration</h4>
                <p className="text-blue-800 mb-4">
                  En attendant le retour du service, voici quelques exemples de missions typiques :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'demo-1',
                      title: 'Développement site e-commerce',
                      description: 'Création d\'un site e-commerce moderne avec React et Node.js',
                      category: 'developpement',
                      budget: '3500',
                      location: 'Remote',
                      status: 'open',
                      createdAt: new Date().toISOString(),
                      bids: []
                    },
                    {
                      id: 'demo-2', 
                      title: 'Design d\'application mobile',
                      description: 'Design UI/UX pour une application de fitness',
                      category: 'design',
                      budget: '2200',
                      location: 'Paris',
                      status: 'open',
                      createdAt: new Date().toISOString(),
                      bids: []
                    }
                  ].map((demoMission, index) => (
                    <div key={index} className="bg-white/80 rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-gray-900 mb-2">{demoMission.title}</h5>
                      <p className="text-gray-600 text-sm mb-3">{demoMission.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">{demoMission.budget}€</span>
                        <span className="text-gray-500">{demoMission.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredAndSortedMissions.map((mission: MissionWithBids) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClick={() => setLocation(`/missions/${mission.id}`)}
            />
          ))}

          {!isLoading && !error && filteredAndSortedMissions.length === 0 && (
            <div className="text-center py-12 sm:col-span-2 lg:col-span-3">
              <div className="text-gray-300 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Aucune mission trouvée ({missions.length} missions totales)</p>
              <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}