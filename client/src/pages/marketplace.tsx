import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MissionWithBids } from '@shared/schema';
import { MissionCard } from '@/components/missions/mission-card';
import { MissionDetailModal } from '@/components/missions/mission-detail-modal';
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

export default function Marketplace() {
  const { user } = useAuth();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [showAIMatching, setShowAIMatching] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    location: '',
    sort: 'newest',
  });

  const { data: missions = [] } = useQuery<MissionWithBids[]>({
    queryKey: ['/api/missions'],
  });

  const filteredAndSortedMissions = missions
    .filter((mission) => {
      if (filters.category && filters.category !== 'all' && mission.category !== filters.category) return false;
      if (filters.location && !mission.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.budget && filters.budget !== 'all') {
        const budget = parseFloat(mission.budget || '0');
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
    .sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        case 'budget-high':
          return parseFloat(b.budget || '0') - parseFloat(a.budget || '0');
        case 'budget-low':
          return parseFloat(a.budget || '0') - parseFloat(b.budget || '0');
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
          Marketplace des Projets
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Découvrez et soumissionnez sur les projets disponibles
        </p>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-3xl shadow-xl border border-blue-100/50 p-6 sm:p-8 sticky top-24 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Filtrer les projets</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Catégorie
              </Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="bg-white/80 border-gray-200 hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
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
                Budget
              </Label>
              <Select value={filters.budget} onValueChange={(value) => handleFilterChange('budget', value)}>
                <SelectTrigger className="bg-white/80 border-gray-200 hover:border-green-400 transition-colors">
                  <SelectValue placeholder="Tous les budgets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les budgets</SelectItem>
                  <SelectItem value="0-500">0 - 500€</SelectItem>
                  <SelectItem value="500-2000">500 - 2 000€</SelectItem>
                  <SelectItem value="2000-5000">2 000 - 5 000€</SelectItem>
                  <SelectItem value="5000+">5 000€+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Localisation
              </Label>
              <Input
                type="text"
                placeholder="Ville, région..."
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
            🔄 Réinitialiser les filtres
          </Button>
        </div>
      </div>

      <div className="lg:w-3/4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Toutes les missions ({filteredAndSortedMissions.length})
          </h2>
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
              <span className="text-sm text-gray-500 whitespace-nowrap">Trier par:</span>
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="budget-high">Budget décroissant</SelectItem>
                  <SelectItem value="budget-low">Budget croissant</SelectItem>
                  <SelectItem value="bids">Nombre d'offres</SelectItem>
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
              onMissionRecommended={(mission) => {
                setSelectedMissionId(mission.missionId);
                setShowAIMatching(false);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClick={() => setSelectedMissionId(mission.id)}
            />
          ))}

          {filteredAndSortedMissions.length === 0 && (
            <div className="text-center py-12 sm:col-span-2 lg:col-span-3">
              <div className="text-gray-300 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Aucune mission trouvée</p>
              <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos filtres</p>
            </div>
          )}
        </div>
      </div>

      <MissionDetailModal
        missionId={selectedMissionId}
        isOpen={!!selectedMissionId}
        onClose={() => setSelectedMissionId(null)}
      />
    </div>
  );
}