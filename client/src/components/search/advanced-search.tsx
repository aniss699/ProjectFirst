import { useState } from 'react';
import { Search, Filter, MapPin, Calendar, DollarSign, Star, Sliders, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CATEGORIES as categories, budgetRanges, urgencyLevels } from '@/lib/categories';

interface SearchFilters {
  query: string;
  categories: string[];
  budgetRange: [number, number];
  location: string;
  urgency: string[];
  rating: number;
  distance: number;
  dateRange: string;
  sortBy: string;
  availability: string;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export function AdvancedSearch({ onFiltersChange, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    budgetRange: [0, 10000],
    location: '',
    urgency: [],
    rating: 0,
    distance: 50,
    dateRange: 'all',
    sortBy: 'relevance',
    availability: 'all'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: newCategories });
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      categories: [],
      budgetRange: [0, 10000],
      location: '',
      urgency: [],
      rating: 0,
      distance: 50,
      dateRange: 'all',
      sortBy: 'relevance',
      availability: 'all'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    filters.categories.length > 0,
    filters.budgetRange[0] > 0 || filters.budgetRange[1] < 10000,
    filters.location,
    filters.urgency.length > 0,
    filters.rating > 0,
    filters.distance < 50,
    filters.dateRange !== 'all',
    filters.availability !== 'all'
  ].filter(Boolean).length;

  const handleSearchInput = (query: string) => {
    updateFilters({ query });

    // Simuler des suggestions de recherche
    if (query.length > 2) {
      const mockSuggestions = [
        'Développement web',
        'Design graphique',
        'Rénovation cuisine',
        'Transport meuble',
        'Formation Excel'
      ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    onFiltersChange({
      query: filters.query,
      categories: filters.categories,
      location: filters.location,
      budgetRange: filters.budgetRange,
      dateRange: filters.dateRange,
      urgency: filters.urgency,
      rating: filters.rating,
      distance: filters.distance,
      availability: filters.availability,
      sortBy: filters.sortBy
    });
  };

  const handleAISearch = async () => {
    if (!filters.query.trim()) return;

    try {
      const response = await fetch('/api/ai/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: filters.query })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('AI search error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des missions ou des prestataires..."
            value={filters.query}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="pl-10 pr-12"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={() => {
                updateFilters({ query: '' });
                setSuggestions([]);
                setAiSuggestions([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suggestions de recherche */}
        {suggestions.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-3 py-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    updateFilters({ query: suggestion });
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Suggestions IA */}
        {aiSuggestions.length > 0 && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold">Suggestions IA</h5>
                <Button variant="outline" size="sm" onClick={handleAISearch}>
                  Rafraîchir
                </Button>
              </div>
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-3 py-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => {
                    updateFilters({ query: suggestion });
                    setAiSuggestions([]);
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Bouton pour lancer la recherche IA */}
        {filters.query && (
          <Button onClick={handleAISearch} className="mt-2 w-full">
            Recherche IA
          </Button>
        )}
      </div>

      {/* Filtres rapides */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtres avancés</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Effacer
                </Button>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget (€)</label>
                <Slider
                  value={filters.budgetRange}
                  onValueChange={(value) => updateFilters({ budgetRange: value as [number, number] })}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{filters.budgetRange[0]}€</span>
                  <span>{filters.budgetRange[1]}€</span>
                </div>
              </div>

              {/* Note minimale */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Note minimale</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.rating >= rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ rating })}
                      className="w-8 h-8 p-0"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rayon ({filters.distance}km)</label>
                <Slider
                  value={[filters.distance]}
                  onValueChange={([value]) => updateFilters({ distance: value })}
                  max={100}
                  step={5}
                />
              </div>

              {/* Urgence */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Urgence</label>
                <div className="space-y-2">
                  {urgencyLevels.map((level) => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={level.id}
                        checked={filters.urgency.includes(level.id)}
                        onCheckedChange={(checked) => {
                          const newUrgency = checked
                            ? [...filters.urgency, level.id]
                            : filters.urgency.filter(u => u !== level.id);
                          updateFilters({ urgency: newUrgency });
                        }}
                      />
                      <label htmlFor={level.id} className="text-sm">
                        <span className={level.color}>{level.name}</span> ({level.days})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Catégories rapides */}
        <div className="flex gap-2 flex-wrap">
          {categories.slice(0, 5).map((category) => (
            <Badge
              key={category.id}
              variant={filters.categories.includes(category.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Tri */}
        <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Pertinence</SelectItem>
            <SelectItem value="date-desc">Plus récent</SelectItem>
            <SelectItem value="date-asc">Plus ancien</SelectItem>
            <SelectItem value="budget-desc">Budget décroissant</SelectItem>
            <SelectItem value="budget-asc">Budget croissant</SelectItem>
            <SelectItem value="rating">Note</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.categories.map((categoryId) => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <Badge key={categoryId} variant="secondary" className="gap-1">
                {category.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleCategory(categoryId)}
                />
              </Badge>
            ) : null;
          })}

          {(filters.budgetRange[0] > 0 || filters.budgetRange[1] < 10000) && (
            <Badge variant="secondary" className="gap-1">
              {filters.budgetRange[0]}€ - {filters.budgetRange[1]}€
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ budgetRange: [0, 10000] })}
              />
            </Badge>
          )}

          {filters.rating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.rating}+ étoiles
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ rating: 0 })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}