
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeComparison, setActiveComparison] = useState('traditional');

  // Données de démonstration
  const demoSteps = [
    {
      title: "1. Vous décrivez votre projet",
      description: "En quelques mots, décrivez ce dont vous avez besoin",
      visual: "🎯",
      details: "Notre système analyse automatiquement votre demande pour attirer les meilleurs prestataires qui correspondent vraiment à votre projet."
    },
    {
      title: "2. Les experts vous trouvent",
      description: "Les prestataires qualifiés viennent à vous",
      visual: "🧠",
      details: "Plus besoin de chercher ! Les professionnels adaptés à votre projet vous contactent directement avec leurs propositions."
    },
    {
      title: "3. Vous recevez des propositions",
      description: "Comparez les offres personnalisées",
      visual: "📧",
      details: "Recevez plusieurs devis adaptés à votre besoin, créant une émulation naturelle entre les prestataires."
    },
    {
      title: "4. Vous choisissez facilement",
      description: "Sélectionnez la meilleure offre en toute transparence",
      visual: "✨",
      details: "Interface claire pour comparer les propositions avec toutes les informations nécessaires pour faire le bon choix."
    }
  ];

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Directrice Marketing",
      company: "TechStart",
      avatar: "SM",
      rating: 5,
      text: "SWIDEAL a complètement changé ma façon de trouver des prestataires. En quelques heures, j'avais plusieurs propositions de qualité au lieu de chercher pendant des semaines !",
      project: "Refonte site web"
    },
    {
      name: "Marc Dubois",
      role: "Entrepreneur",
      company: "Innov Solutions",
      avatar: "MD",
      rating: 5,
      text: "J'ai découvert des prestataires excellents que je n'aurais jamais trouvés seul. Le résultat final a dépassé mes attentes !",
      project: "Application mobile"
    },
    {
      name: "Claire Rousseau",
      role: "Chef de projet",
      company: "Digital Corp",
      avatar: "CR",
      rating: 5,
      text: "Fini le temps perdu à éplucher des profils ! Les prestataires qui me contactent correspondent vraiment à mes besoins.",
      project: "Campagne digitale"
    }
  ];

  const comparisonData = {
    traditional: {
      title: "Méthode traditionnelle",
      color: "red",
      items: [
        { label: "Recherche manuelle", value: "Plusieurs semaines", icon: Clock },
        { label: "Nombre de candidats", value: "Quelques profils", icon: Users },
        { label: "Qualité des matchs", value: "Aléatoire", icon: Target },
        { label: "Transparence prix", value: "Limitée", icon: Eye },
        { label: "Risque qualité", value: "Élevé", icon: Shield },
        { label: "Support", value: "Basique", icon: MessageSquare }
      ]
    },
    swideal: {
      title: "Avec SWIDEAL",
      color: "green",
      items: [
        { label: "Analyse intelligente", value: "Quelques heures", icon: Clock },
        { label: "Nombre de candidats", value: "Sélection qualifiée", icon: Users },
        { label: "Qualité des matchs", value: "Optimisée", icon: Target },
        { label: "Transparence prix", value: "Totale", icon: Eye },
        { label: "Risque qualité", value: "Minimal", icon: Shield },
        { label: "Support", value: "Accompagnement complet", icon: MessageSquare }
      ]
    }
  };

  const faqData = [
    {
      question: "Comment SWIDEAL améliore-t-il la mise en relation ?",
      answer: "SWIDEAL inverse le processus traditionnel : au lieu de chercher des prestataires, ce sont eux qui viennent à vous avec des propositions adaptées. Notre système analyse votre projet et le présente aux professionnels les plus qualifiés de notre réseau."
    },
    {
      question: "Que sont les 'enchères inversées' ?",
      answer: "Contrairement aux enchères classiques, ce sont les prestataires qui viennent à vous avec leurs meilleures offres. Vous publiez votre projet, et les experts qualifiés vous proposent leurs services avec des tarifs compétitifs."
    },
    {
      question: "Comment garantissez-vous la qualité ?",
      answer: "Nous vérifions les compétences de tous nos prestataires et utilisons un système de notation transparent. Seuls les professionnels avec une bonne réputation peuvent soumettre des propositions sur votre projet."
    },
    {
      question: "Combien ça coûte ?",
      answer: "Gratuit pour les clients ! Vous payez uniquement le prestataire choisi. Les prestataires paient une commission uniquement en cas de mission réalisée (pas d'abonnement, pas de frais cachés)."
    },
    {
      question: "Dans quels domaines travaillez-vous ?",
      answer: "Plus de 20 catégories : Développement web/mobile, Design, Marketing digital, Rédaction, Traduction, Conseil, Formation, et bien plus. Notre plateforme s'adapte à tous les secteurs."
    },
    {
      question: "Combien de temps pour avoir des propositions ?",
      answer: "En moyenne quelques heures pour les premières propositions, 1-2 jours pour avoir un panel complet. Les projets urgents peuvent être traités en mode prioritaire."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - Version simplifiée et humaine */}
        <div className="relative text-center py-16 px-2 sm:px-0 overflow-hidden">
          {/* Effets de fond animés */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-blue-200/20 rounded-3xl transform rotate-1"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Une nouvelle façon de trouver des prestataires
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-800 mb-6 leading-tight">
              Ils viennent à vous, pas l'inverse
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
              Fini les recherches fastidieuses ! SWIDEAL connecte automatiquement votre projet 
              avec les meilleurs prestataires qui vous contactent directement.
            </p>

            {/* Avantages clés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
              <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="font-bold text-lg mb-2">Gain de temps</div>
                <div className="text-sm text-gray-600">Plus de recherche manuelle</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
                <Star className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="font-bold text-lg mb-2">Qualité garantie</div>
                <div className="text-sm text-gray-600">Prestataires vérifiés</div>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-lg">
                <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="font-bold text-lg mb-2">Prix compétitifs</div>
                <div className="text-sm text-gray-600">Émulation naturelle</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setLocation('/marketplace')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Publier mon projet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/demo-missions')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-4 rounded-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Voir des exemples
              </Button>
            </div>
          </div>
        </div>

        {/* Démonstration simple du processus */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
              <p className="text-xl text-gray-600">4 étapes simples pour réussir votre projet</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Étapes du processus */}
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

        {/* Comparaison Avant/Après */}
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

        {/* Témoignages authentiques */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ils ont testé, ils recommandent</h2>
            <p className="text-xl text-gray-600">Des témoignages authentiques d'utilisateurs satisfaits</p>
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
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {testimonial.project}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pourquoi choisir SWIDEAL */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Pourquoi choisir SWIDEAL ?</h2>
              <p className="text-xl opacity-90">Les avantages qui font la différence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Gain de temps", description: "Plus de recherche manuelle", icon: Clock, color: "emerald" },
                { name: "Qualité assurée", description: "Prestataires vérifiés", icon: Star, color: "blue" },
                { name: "Sécurité", description: "Paiements protégés", icon: Shield, color: "red" },
                { name: "Support", description: "Accompagnement personnalisé", icon: Heart, color: "purple" },
              ].map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-3">{feature.name}</h3>
                  <p className="text-sm opacity-90">{feature.description}</p>
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

        {/* Call to Action Final */}
        <div className="mb-12 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Effets de fond */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à transformer vos projets ?</h2>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez les entreprises qui ont choisi la simplicité et l'efficacité
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  onClick={() => setLocation('/marketplace')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Publier mon projet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setLocation('/available-providers')}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-8 py-4 rounded-full"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Découvrir les prestataires
                </Button>
              </div>

              <p className="text-sm opacity-80">
                ✨ Gratuit • ⚡ Simple • 🎯 Efficace
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
