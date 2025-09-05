
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Key, 
  CheckCircle, 
  XCircle, 
  Settings,
  Info,
  Zap
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  enabled: boolean;
  hasCredentials: boolean;
  description: string;
  setupUrl: string;
  pricing: string;
}

export function ExternalServicesSetup() {
  const [servicesStatus, setServicesStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServicesStatus();
  }, []);

  const fetchServicesStatus = async () => {
    try {
      const response = await fetch('/api/external/status');
      const data = await response.json();
      setServicesStatus(data);
    } catch (error) {
      console.error('Erreur status services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const services: ServiceStatus[] = [
    {
      name: 'OpenAI GPT-4',
      enabled: servicesStatus?.available_services?.includes('openai') || false,
      hasCredentials: !servicesStatus?.missing_credentials?.includes('openai'),
      description: 'Analyse sémantique avancée et génération de contenu',
      setupUrl: 'https://platform.openai.com/api-keys',
      pricing: 'Pay-per-use (~$0.03/1K tokens)'
    },
    {
      name: 'Freelancer API',
      enabled: servicesStatus?.available_services?.includes('freelancer') || false,
      hasCredentials: !servicesStatus?.missing_credentials?.includes('freelancer'),
      description: 'Données de marché et prix réels des projets',
      setupUrl: 'https://developers.freelancer.com/',
      pricing: 'Gratuit avec limitations'
    },
    {
      name: 'Clearbit',
      enabled: servicesStatus?.available_services?.includes('clearbit') || false,
      hasCredentials: !servicesStatus?.missing_credentials?.includes('clearbit'),
      description: 'Enrichissement profils entreprises',
      setupUrl: 'https://clearbit.com/pricing',
      pricing: 'Freemium (50 recherches/mois)'
    },
    {
      name: 'Hunter.io',
      enabled: servicesStatus?.available_services?.includes('hunter') || false,
      hasCredentials: !servicesStatus?.missing_credentials?.includes('hunter'),
      description: 'Validation emails et contacts',
      setupUrl: 'https://hunter.io/api',
      pricing: 'Freemium (25 recherches/mois)'
    },
    {
      name: 'Google Trends',
      enabled: servicesStatus?.available_services?.includes('googleTrends') || false,
      hasCredentials: !servicesStatus?.missing_credentials?.includes('googleTrends'),
      description: 'Tendances de recherche et demande marché',
      setupUrl: 'https://console.cloud.google.com/',
      pricing: 'Gratuit avec quotas'
    },
    {
      name: 'Upwork API',
      enabled: servicesStatus?.available_services?.includes('upwork') || false,
      hasCredentials: !servicesStatus?.missing_credentials?.includes('upwork'),
      description: 'Intelligence de marché freelance',
      setupUrl: 'https://developers.upwork.com/',
      pricing: 'Gratuit avec limitations'
    }
  ];

  if (isLoading) {
    return <div className="text-center p-8">Chargement du status des services...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Configuration des Services Externes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>Services Actifs:</strong> {servicesStatus?.active_services || 0}/{servicesStatus?.total_services || 10}
              <br />
              {servicesStatus?.fallback_mode && 
                <span className="text-orange-600">Mode dégradé activé - Fonctionnalités limitées</span>
              }
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <Card key={index} className={`border-2 ${
                service.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.enabled ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactif
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tarification:</span>
                      <span className="font-medium">{service.pricing}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Clés API:</span>
                      {service.hasCredentials ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Key className="w-3 h-3 mr-1" />
                          Configurées
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Manquantes
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    asChild
                  >
                    <a href={service.setupUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Obtenir les clés API
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="mt-6">
            <Zap className="w-4 h-4" />
            <AlertDescription>
              <strong>Instructions de configuration:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Créez des comptes sur les services souhaités</li>
                <li>Obtenez vos clés API depuis leurs portails développeurs</li>
                <li>Ajoutez-les dans votre fichier .env (voir .env.example)</li>
                <li>Activez les services avec ENABLE_[SERVICE]=true</li>
                <li>Redémarrez l'application</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
