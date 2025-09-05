
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Navigation, Calculator } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  distance?: number;
}

interface MapComponentProps {
  onProviderSelect?: (provider: Provider) => void;
}

export function MapComponent({ onProviderSelect }: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(10);
  
  // Données exemple de prestataires
  const mockProviders: Provider[] = [
    { id: '1', name: 'Jean Développeur', lat: 48.8566, lng: 2.3522, category: 'Développement', rating: 4.8 },
    { id: '2', name: 'Marie Designer', lat: 48.8606, lng: 2.3376, category: 'Design', rating: 4.9 },
    { id: '3', name: 'Pierre Marketing', lat: 48.8534, lng: 2.3488, category: 'Marketing', rating: 4.7 },
  ];

  useEffect(() => {
    // Géolocalisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          calculateDistances(location);
        },
        (error) => {
          console.log('Erreur géolocalisation:', error);
          // Position par défaut (Paris)
          const defaultLocation = { lat: 48.8566, lng: 2.3522 };
          setUserLocation(defaultLocation);
          calculateDistances(defaultLocation);
        }
      );
    }
  }, []);

  const calculateDistances = (userPos: {lat: number, lng: number}) => {
    const providersWithDistance = mockProviders.map(provider => {
      const distance = calculateDistance(userPos, provider);
      return { ...provider, distance };
    }).filter(provider => provider.distance <= selectedRadius);
    
    setProviders(providersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
  };

  const calculateDistance = (pos1: {lat: number, lng: number}, pos2: {lat: number, lng: number}) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const searchLocation = async () => {
    // Simulation d'une recherche d'adresse
    if (searchAddress.toLowerCase().includes('paris')) {
      const newLocation = { lat: 48.8566, lng: 2.3522 };
      setUserLocation(newLocation);
      calculateDistances(newLocation);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <MapPin className="w-5 h-5 mr-2" />
            Localisation et Prestataires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher une adresse..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <Button onClick={searchLocation} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Rayon de recherche:</span>
            <select 
              value={selectedRadius} 
              onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 h-64 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-700 font-medium">Carte interactive</p>
              <p className="text-blue-600 text-sm">
                {userLocation ? 
                  `Position: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
                  'Localisation en cours...'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Prestataires à proximité ({providers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">{provider.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{provider.category}</Badge>
                    <span className="text-sm text-blue-600">⭐ {provider.rating}</span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calculator className="w-3 h-3 mr-1" />
                      {provider.distance?.toFixed(1)} km
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onProviderSelect?.(provider)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Contacter
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
