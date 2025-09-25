
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Zap, MessageSquare, Star, Users, Clock, Sparkles, Target, Shield, Rocket, Brain, 
  ArrowRight, CheckCircle, TrendingUp, Globe, Play, ChevronDown, ChevronUp, 
  Award, Lightbulb, Eye, Coffee, Timer, DollarSign, Gauge, BarChart3, 
  Heart, ThumbsUp, Calendar, MapPin, Phone, Mail, Briefcase, Building2,
  ArrowDown, ArrowUp, Minus, Plus, Quote, User, Camera, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NotreConcept() {
  const [, setLocation] = useLocation();
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeComparison, setActiveComparison] = useState('traditional');

  // Statistiques en temps réel (simulées)
  const [stats, setStats] = useState({
    matchingAccuracy: 87,
    avgTimeReduction: 76,
    userSatisfaction: 94,
    projectsCompleted: 1247
  });

  useEffect(() => {
    // Animation des statistiques au chargement
    const interval = setInterval(() => {
      setStats(prev => ({
        matchingAccuracy: prev.matchingAccuracy + Math.random() * 0.2 - 0.1,
        avgTimeReduction: prev.avgTimeReduction + Math.random() * 0.3 - 0.15,
        userSatisfaction: prev.userSatisfaction + Math.random() * 0.1 - 0.05,
        projectsCompleted: prev.projectsCompleted + Math.floor(Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Données de démonstration
  const demoSteps = [
    {
      title: "1. Vous décrivez votre projet",
      description: "En quelques mots, décrivez ce dont vous avez besoin",
      visual: "🎯",
      details: "Notre IA analyse automatiquement votre demande et l'optimise pour attirer les meilleurs prestataires."
    },
    {
      title: "2. L'IA trouve les experts",
      description: "Notre algorithme identifie les prestataires parfaits",
      visual: "🧠",
      details: "Matching intelligent basé sur 50+ critères : compétences, localisation, disponibilité, tarifs, réputation."
    },
    {
      title: "3. Les offres arrivent",
      description: "Recevez des propositions personnalisées",
      visual: "📧",
      details: "Les prestataires viennent à vous avec leurs meilleures offres, créant une compétition naturelle."
    },
    {
      title: "4. Vous choisissez",
      description: "Comparez et sélectionnez la meilleure offre",
      visual: "✨",
      details: "Interface de comparaison intelligente avec scoring automatique et recommandations personnalisées."
    }
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Directrice Marketing",
      company: "TechStart",
      avatar: "SM",
      rating: 5,
      text: "SWIDEAL a révolutionné notre façon de trouver des prestataires. En 2 heures, j'avais 5 propositions qualifiées au lieu de chercher pendant des semaines !",
      savings: "85% de temps économisé",
      project: "Refonte site web"
    },
    {
      name: "Marc Dubois",
      role: "Entrepreneur",
      company: "Innov Solutions",
      avatar: "MD",
      rating: 5,
      text: "L'IA de SWIDEAL a identifié des prestataires que je n'aurais jamais trouvés seul. Le résultat final dépassait mes attentes !",
      savings: "30% d'économies",
      project: "Application mobile"
    },
    {
      name: "Claire Rousseau",
      role: "Chef de projet",
      company: "Digital Corp",
      avatar: "CR",
      rating: 5,
      text: "La qualité des matchs est impressionnante. Plus besoin de passer des heures à éplucher les profils !",
      savings: "50% budget optimisé",
      project: "Campagne digitale"
    }
  ];

  const comparisonData = {
    traditional: {
      title: "Méthode traditionnelle",
      color: "red",
      items: [
        { label: "Recherche manuelle", value: "2-3 semaines", icon: Clock },
        { label: "Nombre de candidats", value: "3-5 profils", icon: Users },
        { label: "Taux de matching", value: "40-60%", icon: Target },
        { label: "Transparence prix", value: "Faible", icon: Eye },
        { label: "Risque qualité", value: "Élevé", icon: Shield },
        { label: "Support", value: "Limité", icon: MessageSquare }
      ]
    },
    swideal: {
      title: "Avec SWIDEAL",
      color: "green",
      items: [
        { label: "Analyse IA", value: "< 1 heure", icon: Clock },
        { label: "Nombre de candidats", value: "8-12 profils", icon: Users },
        { label: "Taux de matching", value: "85-95%", icon: Target },
        { label: "Transparence prix", value: "Totale", icon: Eye },
        { label: "Risque qualité", value: "Minimal", icon: Shield },
        { label: "Support", value: "IA + Humain", icon: MessageSquare }
      ]
    }
  };

  const faqData = [
    {
      question: "Comment l'IA de SWIDEAL fonctionne-t-elle ?",
      answer: "Notre IA analyse votre projet selon 50+ critères (compétences requises, complexité, budget, délais, localisation) puis compare avec notre base de 10,000+ prestataires vérifiés. L'algorithme utilise du machine learning pour s'améliorer en permanence."
    },
    {
      question: "Que sont les 'enchères inversées' ?",
      answer: "Contrairement aux enchères classiques, ce sont les prestataires qui viennent à vous avec leurs meilleures offres. Vous publiez votre projet, et les experts qualifiés vous proposent leurs services avec des tarifs compétitifs."
    },
    {
      question: "Comment garantissez-vous la qualité ?",
      answer: "Triple vérification : (1) Validation des compétences, (2) Système de notation blockchain infalsifiable, (3) Détection anti-fraude par IA. Seuls les prestataires avec un score de confiance élevé peuvent soumissionner."
    },
    {
      question: "Combien ça coûte ?",
      answer: "Gratuit pour les clients ! Vous payez uniquement le prestataire choisi. Les prestataires paient une commission uniquement en cas de mission réalisée (pas d'abonnement, pas de frais cachés)."
    },
    {
      question: "Dans quels domaines travaillez-vous ?",
      answer: "Plus de 20 catégories : Développement web/mobile, Design, Marketing digital, Rédaction, Traduction, Conseil, Formation, et bien plus. Notre IA s'adapte à tous les secteurs."
    },
    {
      question: "Combien de temps pour avoir des propositions ?",
      answer: "En moyenne 2-4 heures pour les premières propositions, 24-48h pour avoir un panel complet. Les projets urgents peuvent être traités en mode 'Flash' (réponse en 1h)."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - Version améliorée */}
        <div className="relative text-center py-16 px-2 sm:px-0 overflow-hidden">
          {/* Effets de fond animés */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-blue-200/20 rounded-3xl transform rotate-1"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-8 animate-bounce">
              <Sparkles className="w-4 h-4 mr-2" />
              Révolution en cours
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-800 mb-6 leading-tight">
              L'IA qui révolutionne la mise en relation
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
              Fini les recherches fastidieuses ! SWIDEAL utilise l'intelligence artificielle pour vous connecter 
              instantanément avec les meilleurs prestataires.
            </p>

            {/* Statistiques en temps réel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(stats.matchingAccuracy)}%</div>
                <div className="text-sm text-gray-600">Précision IA</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-emerald-600">{Math.round(stats.avgTimeReduction)}%</div>
                <div className="text-sm text-gray-600">Temps économisé</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.userSatisfaction)}%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.projectsCompleted}+</div>
                <div className="text-sm text-gray-600">Projets réalisés</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setLocation('/marketplace')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Essayer gratuitement
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/ai-hub')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-4 rounded-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Voir l'IA en action
              </Button>
            </div>
          </div>
        </div>

        {/* Démonstration interactive */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
              <p className="text-xl text-gray-600">4 étapes simples pour transformer votre projet en succès</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contrôles de démonstration */}
              <div className="space-y-6">
                {demoSteps.map((step, index) => (
                  <div 
                    key={index}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      activeDemo === index 
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDemo(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{step.visual}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        {activeDemo === index && (
                          <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg animate-fadeIn">
                            {step.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualisation */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4 animate-bounce">
                  {demoSteps[activeDemo].visual}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {demoSteps[activeDemo].title}
                </h3>
                <p className="text-gray-700 mb-6">
                  {demoSteps[activeDemo].details}
                </p>
                <Button 
                  onClick={() => setLocation('/create-mission')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Commencer maintenant
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comparaison interactive */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Avant vs Après</h2>
              <p className="text-xl text-gray-600">Découvrez la différence SWIDEAL</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setActiveComparison('traditional')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeComparison === 'traditional' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Méthode traditionnelle
                </button>
                <button
                  onClick={() => setActiveComparison('swideal')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeComparison === 'swideal' 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Avec SWIDEAL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(comparisonData).map(([key, data]) => (
                <div 
                  key={key}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    activeComparison === key 
                      ? `border-${data.color}-500 bg-${data.color}-50 shadow-lg scale-105` 
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <h3 className={`text-xl font-bold mb-6 text-${data.color}-700`}>
                    {data.title}
                  </h3>
                  <div className="space-y-4">
                    {data.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <item.icon className={`w-5 h-5 text-${data.color}-600`} />
                          <span className="text-gray-700">{item.label}</span>
                        </div>
                        <span className={`font-semibold text-${data.color}-700`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Témoignages */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ils ont testé, ils approuvent</h2>
            <p className="text-xl text-gray-600">Découvrez leurs témoignages authentiques</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                        <div className="text-xs text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Quote className="w-6 h-6 text-gray-300 mb-2" />
                  <p className="text-gray-700 mb-4 italic">{testimonial.text}</p>
                  <div className="flex justify-between items-center text-sm">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {testimonial.savings}
                    </Badge>
                    <span className="text-gray-500">{testimonial.project}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technologies IA */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Notre arsenal technologique</h2>
              <p className="text-xl opacity-90">12+ algorithmes d'IA pour une performance maximale</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Neural Matching", accuracy: "94%", speed: "< 30ms", icon: Brain, color: "emerald" },
                { name: "Smart Pricing", accuracy: "91%", speed: "< 50ms", icon: TrendingUp, color: "blue" },
                { name: "Fraud Detection", accuracy: "97%", speed: "< 20ms", icon: Shield, color: "red" },
                { name: "Quality Scoring", accuracy: "89%", speed: "< 25ms", icon: Star, color: "purple" },
              ].map((tech, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <tech.icon className="w-8 h-8 text-white mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-3">{tech.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-80">Précision:</span>
                      <span className="font-semibold text-green-400">{tech.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Vitesse:</span>
                      <span className="font-semibold text-blue-400">{tech.speed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Interactive */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
              <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur SWIDEAL</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Final amélioré */}
        <div className="mb-12 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Effets de fond */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à révolutionner vos projets ?</h2>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez les 1000+ entreprises qui ont choisi l'intelligence artificielle
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  onClick={() => setLocation('/marketplace')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setLocation('/ai-hub')}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-8 py-4 rounded-full"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Tester l'IA maintenant
                </Button>
              </div>

              <p className="text-sm opacity-80">
                ✨ Gratuit • ⚡ Instantané • 🎯 Garanti efficace
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
