
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SwipeDeck } from '@/components/swipe/SwipeDeck';
import { servicesApi } from '@/lib/api/services';
import type { LiveSlot, OpportunityFilters } from '@/lib/types/services';
import { Clock, Filter, RefreshCw } from 'lucide-react';

const categories = [
  'Tous',
  'Développement',
  'Design',
  'Marketing',
  'Conseil',
  'Formation'
];

const radiusOptions = [
  { value: '', label: 'Toutes distances' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '20', label: '20 km' },
  { value: '50', label: '50 km' }
];

export default function OpportunitiesPage() {
  const [slots, setSlots] = useState<LiveSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { toast } = useToast();

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const newSlots = await servicesApi.getLiveSlots(filters);
      setSlots(newSlots);
      setLastRefresh(Date.now());
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les opportunités.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchSlots();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSwipeRight = async (slot: LiveSlot) => {
    try {
      const result = await servicesApi.reserveSlot(slot.id);
      if (result.success) {
        toast({
          title: "Créneaux réservé !",
          description: `Vous avez réservé le créneau avec ${slot.providerName}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réserver ce créneau.",
        variant: "destructive",
      });
    }
  };

  const handleSwipeLeft = (slot: LiveSlot) => {
    // Just skip, no action needed
  };

  const updateFilter = (key: keyof OpportunityFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const formatLastRefresh = () => {
    const seconds = Math.floor((Date.now() - lastRefresh) / 1000);
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `il y a ${minutes}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunités Locales</h1>
          <p className="text-gray-600">Créneaux libres près de chez vous • Réservation instantanée</p>
        </div>

        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <span>Filtres</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4" />
                <span>Mis à jour {formatLastRefresh()}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Catégorie
                </label>
                <Select onValueChange={(value) => updateFilter('category', value === 'Tous' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rayon
                </label>
                <Select onValueChange={(value) => updateFilter('radiusKm', value ? Number(value) : '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes distances" />
                  </SelectTrigger>
                  <SelectContent>
                    {radiusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {Object.keys(filters).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="outline" className="text-indigo-600">
                    {filters.category}
                  </Badge>
                )}
                {filters.radiusKm && (
                  <Badge variant="outline" className="text-indigo-600">
                    {filters.radiusKm} km
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-indigo-600">{slots.length}</div>
              <div className="text-sm text-gray-600">Créneaux</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-green-600">
                {slots.length ? Math.min(...slots.map(s => s.pricePerHour)) : 0}€
              </div>
              <div className="text-sm text-gray-600">Prix min/h</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <div className="text-2xl font-bold text-purple-600">
                {slots.length ? Math.min(...slots.map(s => s.distance)) : 0}km
              </div>
              <div className="text-sm text-gray-600">Plus proche</div>
            </CardContent>
          </Card>
        </div>

        {/* SwipeDeck */}
        <SwipeDeck 
          slots={slots}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
