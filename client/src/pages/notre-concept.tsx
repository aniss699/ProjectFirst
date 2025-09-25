

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Zap, MessageSquare, Star, Users, Clock, Sparkles, Target, Shield, Rocket, Brain, 
  ArrowRight, CheckCircle, TrendingUp, Globe, Play, ChevronDown, ChevronUp, 
  Award, Lightbulb, Eye, Coffee, Timer, DollarSign, Gauge, BarChart3, 
  Heart, ThumbsUp, Calendar, MapPin, Phone, Mail, Briefcase, Building2,
  ArrowDown, ArrowUp, Minus, Plus, Quote, User, Camera, Video, Smile, 
  Handshake, Megaphone, Gift, Compass, Zap as Lightning, PartyPopper
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
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  // Animation pour les étapes
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Données de démonstration avec un ton plus humain
  const demoSteps = [
    {
      title: "Racontez-nous votre idée",
      subtitle: "Comme à un ami au café",
      description: "Décrivez simplement ce dont vous rêvez, sans jargon technique",
      visual: "☕",
      emotion: "Simple et détendu",
      details: "Pas de formulaires compliqués ! Parlez-nous de votre projet comme si on se connaissait depuis longtemps."
    },
    {
      title: "Ils se bousculent pour vous aider",
      subtitle: "Les meilleurs talents vous contactent",
      description: "Recevez des propositions personnalisées d'experts motivés",
      visual: "🙋‍♂️",
      emotion: "Valorisant et motivant",
      details: "C'est magique ! Les professionnels qui vous correspondent parfaitement viennent à vous avec leurs meilleures idées."
    },
    {
      title: "Choisissez en toute tranquillité",
      subtitle: "Comparez sans stress",
      description: "Toutes les infos claires pour décider l'esprit serein",
      visual: "🤔",
      emotion: "Confiant et zen",
      details: "Prix, délais, références... Tout est transparent. Prenez le temps qu'il faut, on est là pour vous accompagner."
    },
    {
      title: "Voyez votre rêve prendre forme",
      subtitle: "Collaboration magique",
      description: "Travaillez avec votre expert pour créer quelque chose d'extraordinaire",
      visual: "✨",
      emotion: "Épanoui et fier",
      details: "C'est là que la magie opère ! Votre vision devient réalité grâce à un professionnel qui vous comprend vraiment."
    }
  ];

  // Témoignages plus authentiques et humains
  const testimonials = [
    {
      name: "Sophie Lemaire",
      role: "Passionnée de déco",
      company: "Chez Sophie",
      avatar: "SL",
      rating: 5,
      text: "Honnêtement, je ne pensais pas que c'était possible ! J'avais cette idée folle pour ma boutique en ligne... En quelques heures, j'avais des propositions géniales. Aujourd'hui, mon site cartonne et je n'en reviens toujours pas !",
      project: "Site e-commerce créatif",
      emotion: "🤩",
      before: "Rêvait en secret",
      after: "Entrepreneure accomplie"
    },
    {
      name: "Marc Dupont",
      role: "Papa bricoleur",
      company: "Atelier Marc & Fils",
      avatar: "MD",
      rating: 5,
      text: "Ma femme me disait toujours 'Tu devrais te lancer !' Grâce à SWIDEAL, j'ai trouvé un expert marketing qui m'a aidé à transformer ma passion en vrai business. Mes enfants sont fiers de papa maintenant !",
      project: "Stratégie marketing local",
      emotion: "😊",
      before: "Bricoleur du dimanche",
      after: "Patron de famille"
    },
    {
      name: "Julie Martin",
      role: "Créatrice de contenu",
      company: "Julie Partage",
      avatar: "JM",
      rating: 5,
      text: "J'étais complètement perdue avec ma charte graphique... Un designer formidable m'a trouvée et a créé exactement ce que j'avais dans la tête ! Mes followers adorent mon nouveau look !",
      project: "Identité visuelle moderne",
      emotion: "💕",
      before: "Créatrice invisible",
      after: "Marque reconnue"
    }
  ];

  // Bénéfices plus humains et émotionnels
  const emotionalBenefits = [
    {
      icon: Coffee,
      title: "Plus de galères à chercher",
      subtitle: "Détendez-vous, on s'occupe de tout",
      description: "Fini les soirées à écumer Google sans rien trouver. Posez les pieds sous la table !",
      color: "amber",
      stat: "Des heures de gagnées"
    },
    {
      icon: Heart,
      title: "Des rencontres qui comptent",
      subtitle: "Trouvez votre âme sœur pro",
      description: "Connectez-vous avec des gens qui vibrent pour votre projet autant que vous.",
      color: "red",
      stat: "Des relations durables"
    },
    {
      icon: Rocket,
      title: "De l'idée au succès, vite fait",
      subtitle: "Votre projet sur orbite",
      description: "Plus besoin d'attendre des mois. Votre rêve devient réalité à la vitesse de l'éclair.",
      color: "blue",
      stat: "Résultats express"
    },
    {
      icon: Shield,
      title: "Dormez tranquille",
      subtitle: "On veille au grain",
      description: "Tous nos pros sont triés sur le volet. Votre projet est choyé comme notre bébé.",
      color: "green",
      stat: "Sérénité garantie"
    }
  ];

  const successStories = [
    {
      client: "Pizza Enzo (Toulouse)",
      challenge: "Pas assez de clients le soir",
      solution: "App de livraison + réseaux sociaux",
      result: "Commandes x3 en 2 mois",
      icon: "🍕"
    },
    {
      client: "Claire, prof de yoga",
      challenge: "Cours annulés après Covid",
      solution: "Plateforme cours en ligne",
      result: "150 élèves fidèles online",
      icon: "🧘‍♀️"
    },
    {
      client: "Les frères Tec (startup)",
      challenge: "App trop compliquée à développer",
      solution: "Équipe dev sur-mesure",
      result: "Rachat par une grande boîte",
      icon: "📱"
    }
  ];

  const faqData = [
    {
      question: "Sérieusement, ça marche vraiment ?",
      answer: "On comprend vos doutes ! Mais oui, ça marche vraiment. Plus de 1000 projets réussis, des clients qui reviennent nous voir pour leurs nouveaux défis... La preuve par les faits ! Et si ça ne marche pas, on vous accompagne jusqu'à ce que ça marche."
    },
    {
      question: "Pourquoi les pros seraient meilleurs ici qu'ailleurs ?",
      answer: "Parce qu'ici, ils sont motivés ! Ils savent qu'ils vont travailler avec des gens qui apprécient leur travail. Plus de clients difficiles ou de projets sous-payés. Résultat : ils donnent le meilleur d'eux-mêmes pour vous."
    },
    {
      question: "Mon projet est bizarre, ça marchera quand même ?",
      answer: "Plus c'est original, plus on adore ! Que vous vouliez créer une app pour les amoureux de cactus ou organiser des mariages sous l'eau, notre réseau regorge de pros créatifs qui adorent les défis uniques."
    },
    {
      question: "Combien ça coûte ? Y'a un piège ?",
      answer: "Zéro euro pour vous ! Pas d'inscription, pas d'abonnement, pas de commission cachée. Vous payez juste votre prestataire, comme d'habitude. Nous, on gagne notre vie grâce aux pros qui nous font confiance."
    },
    {
      question: "Et si ça tourne mal ?",
      answer: "On est là ! Notre équipe vous accompagne du début à la fin. Si un problème survient, on trouve une solution ensemble : médiation, changement de prestataire, ou remboursement. Votre succès, c'est notre réputation !"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section plus humain et moins encombré */}
        <div className="relative text-center py-12 px-2 sm:px-0 overflow-hidden">
          {/* Effets de fond plus subtils */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-500/10 to-purple-600/10 rounded-2xl blur-2xl"></div>
          <div className="absolute top-6 left-10 text-2xl opacity-60">✨</div>
          <div className="absolute top-8 right-16 text-2xl opacity-50">💫</div>
          <div className="absolute bottom-10 left-1/4 text-2xl opacity-40">⭐</div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-md">
              <Smile className="w-4 h-4 mr-2" />
              La solution qui change tout !
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Arrêtez de chercher,
              <br />
              <span className="text-emerald-600">laissez-vous trouver !</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Vous avez un projet ? Fantastique ! 
              <br />
              <span className="text-emerald-600 font-semibold">Les meilleurs pros viennent à vous.</span>
            </p>

            {/* Promesse plus concise */}
            <div className="bg-white/90 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto mb-8 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notre promesse simple :</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="text-lg">⏰</div>
                  <div className="text-left">
                    <div className="font-semibold">5 min max</div>
                    <div className="text-gray-600 text-xs">pour tout expliquer</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-lg">💎</div>
                  <div className="text-left">
                    <div className="font-semibold">Que du premium</div>
                    <div className="text-gray-600 text-xs">pros vérifiés</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-lg">💝</div>
                  <div className="text-left">
                    <div className="font-semibold">100% gratuit</div>
                    <div className="text-gray-600 text-xs">pour vous</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-lg">🤝</div>
                  <div className="text-left">
                    <div className="font-semibold">Support inclus</div>
                    <div className="text-gray-600 text-xs">jusqu'au succès</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button 
                onClick={() => setLocation('/create-mission')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Je lance mon projet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/demo-missions')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-6 py-3 rounded-full transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir des exemples
              </Button>
            </div>

            <div className="flex justify-center items-center space-x-2 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-600 ml-1">4.9/5 • Plus de 1000 projets réussis</span>
            </div>
          </div>
        </div>

        {/* Bénéfices plus compacts */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Pourquoi nos utilisateurs nous adorent</h2>
            <p className="text-lg text-gray-600">Ce qui va changer dans votre quotidien</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emotionalBenefits.map((benefit, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 cursor-pointer ${
                  hoveredBenefit === index ? 'ring-2 ring-blue-200' : ''
                }`}
                onMouseEnter={() => setHoveredBenefit(index)}
                onMouseLeave={() => setHoveredBenefit(null)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-${benefit.color}-100`}>
                    <benefit.icon className={`w-6 h-6 text-${benefit.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className={`text-sm font-semibold text-${benefit.color}-600 mb-2`}>{benefit.subtitle}</p>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{benefit.description}</p>
                    <div className={`inline-block bg-${benefit.color}-50 text-${benefit.color}-700 px-3 py-1 rounded-full font-semibold text-xs`}>
                      {benefit.stat}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processus plus compact et conversationnel */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-white">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Comment ça se passe ?</h2>
              <p className="text-lg opacity-90">4 étapes toutes simples</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {demoSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`text-center p-4 rounded-xl transition-all duration-500 ${
                    activeDemo === index 
                      ? 'bg-white/20 shadow-xl scale-105 transform' 
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="text-4xl mb-3">{step.visual}</div>
                  <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                  <p className="text-blue-200 font-medium mb-2 text-sm">{step.subtitle}</p>
                  <p className="text-gray-200 mb-3 text-sm">{step.description}</p>
                  <div className="bg-emerald-500/20 text-emerald-200 px-2 py-1 rounded-full text-xs font-medium">
                    {step.emotion}
                  </div>
                  {activeDemo === index && (
                    <p className="mt-3 text-xs text-blue-100 bg-white/10 p-2 rounded animate-fadeIn">
                      {step.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Histoires de réussite plus compactes */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Ils l'ont fait !</h2>
            <p className="text-lg text-gray-600">Des histoires vraies qui donnent le sourire</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-102">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white pb-4">
                  <div className="text-2xl mb-1">{story.icon}</div>
                  <CardTitle className="text-lg">{story.client}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-red-600">😟 Souci : </span>
                      <span className="text-gray-700">{story.challenge}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-600">💡 Solution : </span>
                      <span className="text-gray-700">{story.solution}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-green-600">🚀 Résultat : </span>
                      <span className="text-gray-700 font-semibold">{story.result}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Témoignages plus intimes */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Paroles d'utilisateurs</h2>
            <p className="text-lg text-gray-600">Des témoignages du cœur</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-102">
                <div className="absolute top-3 right-3 text-2xl">{testimonial.emotion}</div>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Quote className="w-6 h-6 text-gray-300 mb-2" />
                  <p className="text-gray-700 mb-4 italic leading-relaxed text-sm">"{testimonial.text}"</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded text-xs">
                      <span className="font-semibold text-red-700">Avant :</span>
                      <span className="text-red-600">{testimonial.before}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded text-xs">
                      <span className="font-semibold text-green-700">Après :</span>
                      <span className="text-green-600">{testimonial.after}</span>
                    </div>
                  </div>

                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-3 text-xs">
                    📁 {testimonial.project}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ plus décontractée */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Les questions qu'on nous pose</h2>
              <p className="text-lg text-gray-600">Tout ce que vous voulez savoir (sans tabou !)</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqData.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action final plus convivial */}
        <div className="mb-8 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white relative overflow-hidden">
            {/* Effets de fond plus subtils */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            
            {/* Éléments décoratifs plus discrets */}
            <div className="absolute top-4 left-6 text-2xl opacity-60">⭐</div>
            <div className="absolute top-4 right-6 text-2xl opacity-60">✨</div>
            <div className="absolute bottom-4 left-1/4 text-2xl opacity-50">💫</div>
            <div className="absolute bottom-4 right-1/4 text-2xl opacity-50">🚀</div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Prêt à vous lancer ?</h2>
              <p className="text-lg md:text-xl mb-6 opacity-90 leading-relaxed">
                Votre projet mérite les meilleurs talents.
                <br />
                <span className="font-semibold">Et ils n'attendent que vous !</span>
              </p>
              
              {/* Motivation plus douce */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-6 max-w-2xl mx-auto">
                <h3 className="font-bold mb-2">🎉 Offre de bienvenue :</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>✅ Accompagnement gratuit</div>
                  <div>✅ Réponses prioritaires</div>
                  <div>✅ Support personnalisé</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button 
                  onClick={() => setLocation('/create-mission')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Lightning className="w-5 h-5 mr-2" />
                  Je commence maintenant
                </Button>
                <Button 
                  onClick={() => setLocation('/marketplace')}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6 py-3 rounded-full transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Découvrir les talents
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="font-semibold">
                  ⚡ Gratuit • 🎯 Efficace • 💎 Premium
                </p>
                <p className="opacity-90">
                  Rejoignez plus de 1000 entrepreneurs satisfaits
                </p>
                <div className="flex justify-center items-center space-x-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm">4.9/5 - Ils recommandent !</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

