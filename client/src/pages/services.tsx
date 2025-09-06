
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  Briefcase, 
  GraduationCap, 
  HeadphonesIcon, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Award
} from 'lucide-react';

export default function Services() {
  const [, setLocation] = useLocation();

  const services = [
    {
      id: 'consultation',
      title: 'Services de Consultation',
      description: 'Expertise et conseil personnalisé pour vos projets',
      icon: Briefcase,
      features: [
        'Audit technique complet',
        'Stratégie digitale',
        'Architecture système',
        'Optimisation performance'
      ],
      pricing: 'À partir de 150€/jour',
      duration: '1-5 jours',
      providers: 85,
      rating: 4.8
    },
    {
      id: 'formation',
      title: 'Formation Professionnelle',
      description: 'Programmes de formation adaptés à vos besoins',
      icon: GraduationCap,
      features: [
        'Formation sur mesure',
        'Certifications reconnues',
        'Support continu',
        'Suivi personnalisé'
      ],
      pricing: 'À partir de 80€/heure',
      duration: '1-30 jours',
      providers: 42,
      rating: 4.9
    },
    {
      id: 'support',
      title: 'Support Technique',
      description: 'Assistance et maintenance continue',
      icon: HeadphonesIcon,
      features: [
        'Support 24/7',
        'Résolution rapide',
        'Maintenance préventive',
        'Documentation complète'
      ],
      pricing: 'À partir de 50€/heure',
      duration: 'Continu',
      providers: 67,
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Nos Services Professionnels
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez notre gamme complète de services pour accompagner 
              votre croissance et optimiser vos projets
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {service.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {service.providers} experts
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {service.rating}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Pricing & Duration */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tarif:</span>
                      <Badge variant="secondary">{service.pricing}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Durée:</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">{service.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    onClick={() => setLocation(`/marketplace?service=${service.id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Voir les experts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="py-12 px-8">
              <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Besoin d'un service sur mesure ?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Notre équipe d'experts peut vous accompagner dans la création 
                d'une solution parfaitement adaptée à vos besoins spécifiques.
              </p>
              <Button 
                onClick={() => setLocation('/create-mission')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Créer une mission personnalisée
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { ServiceModeCard } from '@/components/ServiceModeCard';
import type { ServiceMode } from '@/lib/types/services';

const serviceModes: ServiceMode[] = [
  {
    id: 'flash',
    title: 'Flash Deals Services',
    description: 'Besoin urgent ? Obtenez des devis en temps record avec nos prestataires disponibles immédiatement.',
    emoji: '⚡',
    href: '/services/flash',
    color: 'text-orange-600'
  },
  {
    id: 'abonnement',
    title: 'Abonnement Inversé',
    description: 'Définissez votre besoin récurrent et laissez les experts se positionner sur votre planning.',
    emoji: '📅',
    href: '/services/abonnement',
    color: 'text-green-600'
  },
  {
    id: 'groupe',
    title: 'Demandes Groupées',
    description: 'Mutualisez vos besoins avec d\'autres clients pour obtenir des tarifs préférentiels.',
    emoji: '🤝',
    href: '/services/groupe',
    color: 'text-blue-600'
  },
  {
    id: 'ia',
    title: 'IA + Humain',
    description: 'Notre IA analyse votre besoin et le transforme en brief expert pour les meilleurs prestataires.',
    emoji: '🤖',
    href: '/services/ia',
    color: 'text-purple-600'
  },
  {
    id: 'opportunites',
    title: 'Opportunités Locales',
    description: 'Découvrez les créneaux libres près de chez vous et réservez instantanément.',
    emoji: '⏳',
    href: '/services/opportunites',
    color: 'text-indigo-600'
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-white text-2xl">🚀</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre mode de service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            5 façons révolutionnaires de trouver et collaborer avec les meilleurs prestataires
          </p>
        </div>

        {/* Service modes grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {serviceModes.map((mode) => (
            <ServiceModeCard 
              key={mode.id} 
              mode={mode}
              className="w-full"
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-white rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pas sûr de votre choix ?
          </h3>
          <p className="text-gray-600 mb-6">
            Notre équipe peut vous conseiller le mode le plus adapté à votre projet
          </p>
          <button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
            💬 Discuter avec un expert
          </button>
        </div>
      </div>
    </div>
  );
}
