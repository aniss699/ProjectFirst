import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Navigation, Star, Award } from 'lucide-react';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Provider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  distance: number;
  lat: number;
  lng: number;
  badges: string[];
  responseTime: string;
  completedProjects: number;
}

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  radius?: number;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  showProviders?: boolean;
  providers?: Provider[];
  selectedCategory?: string;
  className?: string;
}

export function InteractiveMap({
  center = [48.8566, 2.3522], // Paris par défaut
  zoom = 12,
  radius = 10,
  onLocationSelect,
  showProviders = true,
  providers = [],
  selectedCategory,
  className = ''
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Mock data pour les prestataires si aucune donnée fournie
  const mockProviders: Provider[] = providers.length > 0 ? providers : [
    {
      id: '1',
      name: 'Sophie Dubois',
      rating: 4.9,
      reviewCount: 127,
      category: 'Développement Web',
      distance: 2.5,
      lat: 48.8566 + (Math.random() - 0.5) * 0.02,
      lng: 2.3522 + (Math.random() - 0.5) * 0.02,
      badges: ['expert', 'verified'],
      responseTime: '2h',
      completedProjects: 89
    },
    {
      id: '2',
      name: 'Marc Rodriguez',
      rating: 4.8,
      reviewCount: 93,
      category: 'Design UI/UX',
      distance: 4.2,
      lat: 48.8566 + (Math.random() - 0.5) * 0.02,
      lng: 2.3522 + (Math.random() - 0.5) * 0.02,
      badges: ['top_rated', 'local_hero'],
      responseTime: '1h',
      completedProjects: 156
    },
    {
      id: '3',
      name: 'Julie Chen',
      rating: 4.7,
      reviewCount: 78,
      category: 'Marketing Digital',
      distance: 6.8,
      lat: 48.8566 + (Math.random() - 0.5) * 0.02,
      lng: 2.3522 + (Math.random() - 0.5) * 0.02,
      badges: ['reliable'],
      responseTime: '4h',
      completedProjects: 62
    }
  ];

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstance.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    // Ajouter le cercle de rayon
    if (radius > 0) {
      radiusCircleRef.current = L.circle(center, {
        radius: radius * 1000, // Convertir km en mètres
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        color: '#3b82f6',
        opacity: 0.3,
        weight: 2
      }).addTo(map);
    }

    // Gestionnaire de clic sur la carte
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        // Géocodage inversé simulé
        const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationSelect(lat, lng, address);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs des prestataires
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;

    // Nettoyer les marqueurs existants
    markersRef.current.clearLayers();

    // Filtrer les prestataires par catégorie si spécifiée
    const filteredProviders = selectedCategory 
      ? mockProviders.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()))
      : mockProviders;

    // Ajouter les nouveaux marqueurs
    filteredProviders.forEach(provider => {
      // Icône personnalisée selon le rating
      const iconColor = provider.rating >= 4.8 ? 'green' : provider.rating >= 4.5 ? 'orange' : 'red';
      
      const marker = L.marker([provider.lat, provider.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative">
              <div class="w-10 h-10 bg-${iconColor}-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
                ${provider.rating.toFixed(1)}
              </div>
              <div class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs">⭐</span>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      });

      // Popup avec informations du prestataire
      marker.bindPopup(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-lg">${provider.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${provider.category}</p>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-yellow-500">⭐</span>
            <span class="font-medium">${provider.rating}</span>
            <span class="text-gray-500 text-sm">(${provider.reviewCount} avis)</span>
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Distance:</span>
              <span>${provider.distance} km</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Réponse:</span>
              <span>${provider.responseTime}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Projets:</span>
              <span>${provider.completedProjects}</span>
            </div>
          </div>
          <div class="flex gap-1 mt-2">
            ${provider.badges.map(badge => `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">${badge}</span>`).join('')}
          </div>
          <button 
            onclick="window.selectProvider('${provider.id}')"
            class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Contacter
          </button>
        </div>
      `);

      marker.on('click', () => {
        setSelectedProvider(provider);
      });

      markersRef.current?.addLayer(marker);
    });
  }, [selectedCategory, showProviders]);

  // Recherche d'adresse
  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    try {
      // API de géocodage (Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        
        mapInstance.current?.setView(newCenter, 14);
        
        // Mettre à jour le cercle de rayon
        if (radiusCircleRef.current) {
          radiusCircleRef.current.setLatLng(newCenter);
        }
        
        if (onLocationSelect) {
          onLocationSelect(parseFloat(lat), parseFloat(lon), display_name);
        }
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction globale pour sélectionner un prestataire
  useEffect(() => {
    (window as any).selectProvider = (providerId: string) => {
      const provider = mockProviders.find(p => p.id === providerId);
      if (provider) {
        setSelectedProvider(provider);
      }
    };
    
    return () => {
      delete (window as any).selectProvider;
    };
  }, [mockProviders]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            Localisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher une adresse..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              className="flex-1"
            />
            <Button
              onClick={searchLocation}
              disabled={isSearching}
              size="sm"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {showProviders && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Navigation className="w-4 h-4" />
              <span>Rayon de recherche: {radius} km</span>
              <Badge variant="secondary">
                {mockProviders.length} prestataires trouvés
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carte */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-200 shadow-sm"
          style={{ minHeight: '400px' }}
        />
        
        {/* Légende */}
        {showProviders && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2 text-sm">
            <h4 className="font-semibold text-gray-900">Légende</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Excellent (4.8+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Très bien (4.5+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Bien (&lt;4.5)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informations du prestataire sélectionné */}
      {selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {selectedProvider.name}
              </span>
              <Badge variant="outline">
                {selectedProvider.distance} km
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Informations</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catégorie:</span>
                    <span>{selectedProvider.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Note:</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {selectedProvider.rating} ({selectedProvider.reviewCount} avis)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temps de réponse:</span>
                    <span>{selectedProvider.responseTime}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Badges</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedProvider.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-3">
                  <Button className="w-full" size="sm">
                    Contacter ce prestataire
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}