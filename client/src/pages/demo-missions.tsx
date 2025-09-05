
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Target, Clock, Euro, MapPin, Star } from 'lucide-react';

export default function DemoMissions() {
  const demoMissions = [
    {
      id: 1,
      title: "Développement d'une application mobile e-commerce",
      description: "Nous recherchons un développeur expérimenté pour créer une application mobile iOS/Android pour notre boutique en ligne.",
      budget: "15000-25000€",
      duration: "3-4 mois",
      location: "Paris, France",
      skills: ["React Native", "JavaScript", "API REST", "UI/UX"],
      urgency: "Haute",
      applicants: 12
    },
    {
      id: 2,
      title: "Refonte complète d'un site web WordPress",
      description: "Modernisation d'un site web existant avec amélioration des performances et du design.",
      budget: "8000-12000€",
      duration: "2-3 mois",
      location: "Lyon, France",
      skills: ["WordPress", "PHP", "CSS", "SEO"],
      urgency: "Moyenne",
      applicants: 8
    },
    {
      id: 3,
      title: "Intégration IA pour chatbot client",
      description: "Développement d'un chatbot intelligent pour améliorer l'expérience client sur notre plateforme.",
      budget: "20000-30000€",
      duration: "4-6 mois",
      location: "Remote",
      skills: ["Intelligence Artificielle", "Python", "NLP", "TensorFlow"],
      urgency: "Haute",
      applicants: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Mode Démo - Missions</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explorez nos missions d'exemple pour découvrir comment fonctionne notre plateforme.
            Toutes ces missions sont fictives et à des fins de démonstration.
          </p>
        </div>

        {/* Demo Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🎯 Mode Démonstration Actif</h2>
              <p className="opacity-90">
                Ces missions sont des exemples pour tester nos fonctionnalités IA avancées
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Passer en mode réel
            </Button>
          </div>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {demoMissions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {mission.title}
                  </CardTitle>
                  <Badge 
                    variant={mission.urgency === 'Haute' ? 'destructive' : 'secondary'}
                    className="ml-2"
                  >
                    {mission.urgency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {mission.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Euro className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">{mission.budget}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{mission.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-red-600" />
                    <span>{mission.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{mission.applicants} candidatures</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Compétences requises :</h4>
                  <div className="flex flex-wrap gap-1">
                    {mission.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Brain className="w-4 h-4 mr-2" />
                    Analyser avec l'IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyse IA</h3>
            <p className="text-gray-600 text-sm">
              Notre IA analyse chaque mission pour vous donner les meilleures recommandations
            </p>
          </Card>
          <Card className="text-center p-6">
            <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Matching Intelligent</h3>
            <p className="text-gray-600 text-sm">
              Trouvez automatiquement les missions qui correspondent parfaitement à votre profil
            </p>
          </Card>
          <Card className="text-center p-6">
            <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Propositions Optimisées</h3>
            <p className="text-gray-600 text-sm">
              L'IA vous aide à rédiger des propositions plus convaincantes et compétitives
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
