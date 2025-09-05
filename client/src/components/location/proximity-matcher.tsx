
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Users } from 'lucide-react';

interface ProximityProvider {
  id: string;
  name: string;
  distance: number;
  rating: number;
  specialties: string[];
  responseTime: string;
}

export function ProximityMatcher() {
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [nearbyProviders, setNearbyProviders] = useState<ProximityProvider[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(position);
        findNearbyProviders(position);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
      }
    );
  };

  const findNearbyProviders = async (position: GeolocationPosition) => {
    // Simulation - à remplacer par appel API réel
    setTimeout(() => {
      const mockProviders: ProximityProvider[] = [
        {
          id: '1',
          name: 'Jean Développeur',
          distance: 2.3,
          rating: 4.8,
          specialties: ['React', 'Node.js'],
          responseTime: '< 1h'
        },
        {
          id: '2',
          name: 'Marie Designer',
          distance: 4.1,
          rating: 4.9,
          specialties: ['UI/UX', 'Figma'],
          responseTime: '< 2h'
        },
        {
          id: '3',
          name: 'Pierre Plombier',
          distance: 1.8,
          rating: 4.7,
          specialties: ['Plomberie', 'Chauffage'],
          responseTime: '< 30min'
        }
      ];
      setNearbyProviders(mockProviders);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Prestataires à proximité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!userLocation ? (
          <div className="text-center">
            <Button onClick={getCurrentLocation} disabled={loading}>
              <MapPin className="w-4 h-4 mr-2" />
              {loading ? 'Localisation...' : 'Activer géolocalisation'}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Trouvez les meilleurs prestataires près de chez vous
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <MapPin className="w-4 h-4" />
              Position activée - {nearbyProviders.length} prestataires trouvés
            </div>
            
            {nearbyProviders.map((provider) => (
              <div key={provider.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-sm text-gray-600">
                      {provider.distance}km • ⭐ {provider.rating} • {provider.responseTime}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {provider.specialties.map((skill) => (
                        <span key={skill} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button size="sm">Contacter</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
