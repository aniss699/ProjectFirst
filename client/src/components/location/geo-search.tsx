
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  postalCode: string;
  distance?: number;
}

interface GeoSearchProps {
  onLocationSelect: (location: Location) => void;
  currentLocation?: Location;
}

export function GeoSearch({ onLocationSelect, currentLocation }: GeoSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Obtenir la position de l'utilisateur
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Simuler une API de géocodage inverse
          const location: Location = {
            lat: latitude,
            lng: longitude,
            address: 'Votre position actuelle',
            city: 'Ville actuelle',
            postalCode: '00000'
          };
          
          setUserLocation(location);
          onLocationSelect(location);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  // Simuler une recherche d'adresses
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    
    // Simuler des résultats d'API
    setTimeout(() => {
      const mockResults: Location[] = [
        {
          lat: 48.8566,
          lng: 2.3522,
          address: `${query} - Paris Centre`,
          city: 'Paris',
          postalCode: '75001'
        },
        {
          lat: 45.764,
          lng: 4.8357,
          address: `${query} - Lyon`,
          city: 'Lyon',
          postalCode: '69000'
        },
        {
          lat: 43.2965,
          lng: 5.3698,
          address: `${query} - Marseille`,
          city: 'Marseille',
          postalCode: '13000'
        }
      ];

      setSuggestions(mockResults);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    searchAddresses(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={getCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Ma position
        </Button>
      </div>

      {userLocation && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-sm">Position actuelle détectée</span>
              <Badge variant="secondary">GPS</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-2">
            {suggestions.map((location, index) => (
              <div
                key={index}
                onClick={() => onLocationSelect(location)}
                className="p-3 hover:bg-gray-50 cursor-pointer rounded flex items-center gap-3"
              >
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{location.address}</div>
                  <div className="text-sm text-gray-500">
                    {location.city}, {location.postalCode}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
