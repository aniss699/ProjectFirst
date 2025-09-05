import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewSystem } from '@/components/reviews/review-system';
import { InteractiveMap } from '@/components/location/interactive-map';
import { BadgeSystem } from '@/components/reputation/badge-system';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  CheckCircle, 
  Users,
  Phone,
  Mail,
  MessageCircle,
  Share,
  Heart
} from 'lucide-react';

export default function ProviderProfile() {
  const [, setLocation] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data pour le prestataire
  const provider = {
    id: 'provider1',
    name: 'Sophie Dubois',
    title: 'Développeuse Web Senior',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    completedProjects: 89,
    memberSince: '2022-03-15',
    location: {
      city: 'Paris',
      country: 'France',
      lat: 48.8566,
      lng: 2.3522
    },
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'Docker'],
    badges: ['Expert vérifié', 'Top performer', 'Réponse rapide', 'Projet complexe'],
    description: `Développeuse full-stack passionnée avec plus de 8 ans d'expérience dans la création d'applications web modernes. 
    
    Je me spécialise dans l'écosystème React/Node.js et j'accompagne mes clients de la conception à la mise en production. Mon approche privilégie la qualité du code, les bonnes pratiques et la communication transparente.
    
    **Mes domaines d'expertise :**
    - Applications web React/Next.js avec TypeScript
    - APIs REST et GraphQL avec Node.js
    - Bases de données PostgreSQL et MongoDB
    - Déploiement cloud (AWS, Vercel, Digital Ocean)
    - Tests automatisés et intégration continue
    
    **Pourquoi travailler avec moi :**
    - Code de qualité professionnelle, documenté et maintenable
    - Respect strict des délais et communication régulière
    - Approche collaborative et pédagogique
    - Support post-livraison inclus
    
    N'hésitez pas à me contacter pour discuter de votre projet !`,
    hourlyRate: '65-85',
    responseTime: '< 2h',
    languages: ['Français (natif)', 'Anglais (courant)', 'Espagnol (notions)'],
    certifications: [
      'AWS Certified Developer',
      'React Professional Certification',
      'Node.js Certified Developer'
    ],
    portfolio: [
      {
        title: 'Plateforme E-commerce',
        description: 'Application complète avec paiement Stripe',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop'
      },
      {
        title: 'Dashboard Analytics',
        description: 'Interface de visualisation de données en temps réel',
        technologies: ['Next.js', 'D3.js', 'WebSocket'],
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
      },
      {
        title: 'Application Mobile',
        description: 'App React Native pour gestion de tâches',
        technologies: ['React Native', 'Firebase', 'Redux'],
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profil principal */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                      <p className="text-lg text-gray-600">{provider.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{provider.rating}</span>
                          <span className="text-gray-500">({provider.reviewCount} avis)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{provider.location.city}, {provider.location.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={isFavorite ? 'text-red-600 border-red-200' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-600' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Système de badges complet */}
                <div className="mb-6">
                  <BadgeSystem userId={provider.id} compact={true} showProgress={false} />
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">À propos</h3>
                  <div className="prose prose-sm max-w-none">
                    {provider.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Compétences */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Portfolio */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.portfolio.map((project, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{project.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Système d'évaluations */}
            <ReviewSystem
              targetUserId={provider.id}
              showForm={false}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tarif horaire</span>
                    <p className="font-semibold">{provider.hourlyRate}€/h</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Réponse</span>
                    <p className="font-semibold">{provider.responseTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Projets</span>
                    <p className="font-semibold">{provider.completedProjects}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Membre depuis</span>
                    <p className="font-semibold">
                      {new Date(provider.memberSince).getFullYear()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Programmer un appel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Langues */}
            <Card>
              <CardHeader>
                <CardTitle>Langues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {provider.languages.map((language, index) => (
                    <div key={index} className="text-sm">
                      {language}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {provider.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {cert}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Localisation */}
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveMap
                  center={[provider.location.lat, provider.location.lng]}
                  zoom={12}
                  showProviders={false}
                  className="h-48"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Basé à {provider.location.city}, {provider.location.country}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}