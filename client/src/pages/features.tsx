
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  MessageSquare, 
  Award, 
  Search, 
  MapPin, 
  TrendingUp,
  Bell,
  Shield,
  Star,
  Zap,
  Users,
  Target,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function Features() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Brain,
      title: "IA Recommendations",
      description: "Intelligence artificielle pour matcher parfaitement clients et prestataires",
      color: "from-purple-500 to-indigo-600",
      status: "Nouveau",
      benefits: ["Matching précis à 95%", "Suggestions intelligentes", "Optimisation continue"]
    },
    {
      icon: MessageSquare,
      title: "Chat Intégré",
      description: "Système de messagerie temps réel avec notifications push",
      color: "from-green-500 to-emerald-600",
      status: "Populaire",
      benefits: ["Messages instantanés", "Notifications push", "Historique complet"]
    },
    {
      icon: Award,
      title: "Système de Badges",
      description: "Récompenses et certifications pour motiver la communauté",
      color: "from-yellow-500 to-orange-600",
      status: "Gamification",
      benefits: ["Badges de qualité", "Niveaux de progression", "Récompenses exclusives"]
    },
    {
      icon: Search,
      title: "Recherche Avancée",
      description: "Filtres intelligents et recherche sémantique",
      color: "from-blue-500 to-cyan-600",
      status: "Pro",
      benefits: ["Filtres multicritères", "Recherche géolocalisée", "Sauvegarde de recherches"]
    },
    {
      icon: MapPin,
      title: "Géolocalisation",
      description: "Trouvez des prestataires près de chez vous",
      color: "from-red-500 to-pink-600",
      status: "Local",
      benefits: ["Proximité garantie", "Coûts réduits", "Rencontres facilitées"]
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Tableau de bord avec métriques et insights",
      color: "from-indigo-500 to-purple-600",
      status: "Business",
      benefits: ["Métriques détaillées", "ROI tracking", "Insights personnalisés"]
    }
  ];

  const stats = [
    { label: "Utilisateurs actifs", value: "12,547", icon: Users, color: "text-blue-600" },
    { label: "Projets complétés", value: "3,891", icon: CheckCircle, color: "text-green-600" },
    { label: "Taux de satisfaction", value: "98.5%", icon: Star, color: "text-yellow-600" },
    { label: "Temps de réponse moyen", value: "2h 15m", icon: Clock, color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-lg">
            🚀 Nouvelles Fonctionnalités
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Découvrez tout ce qu'AppelsPro
            <br />peut faire pour vous
          </h1>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Une plateforme complète avec des fonctionnalités avancées pour optimiser 
            vos collaborations et maximiser votre réussite.
          </p>
          <Button 
            onClick={() => setLocation('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Commencer maintenant
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-xl border-0 bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Fonctionnalités qui font la différence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-xl border-0 bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à révolutionner votre façon de travailler ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à AppelsPro 
            pour leurs projets les plus importants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setLocation('/')}
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
            >
              <Target className="w-5 h-5 mr-2" />
              Créer mon projet
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation('/marketplace')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
            >
              <Users className="w-5 h-5 mr-2" />
              Explorer les talents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
