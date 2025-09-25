
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

  // Données de démonstration améliorées
  const demoSteps = [
    {
      title: "Décrivez votre rêve",
      subtitle: "En quelques mots simples",
      description: "Racontez-nous votre projet comme si vous en parliez à un ami",
      visual: "💫",
      emotion: "Facile et naturel",
      details: "Pas de formulaires compliqués ! Décrivez simplement ce dont vous rêvez, notre système comprend et trouve les bons experts pour vous."
    },
    {
      title: "Ils se manifestent",
      subtitle: "Les experts viennent à vous",
      description: "Recevez des propositions de professionnels motivés",
      visual: "🎯",
      emotion: "Rassurant et efficace",
      details: "Fini l'angoisse de chercher ! Les meilleurs prestataires vous trouvent et vous contactent avec des propositions personnalisées."
    },
    {
      title: "Comparez sereinement",
      subtitle: "Tout est clair et transparent",
      description: "Des propositions détaillées pour choisir en toute confiance",
      visual: "⚖️",
      emotion: "Confiant et éclairé",
      details: "Comparez facilement les offres avec tous les détails : prix, délais, références. Vous avez toutes les cartes en main."
    },
    {
      title: "Réalisez vos ambitions",
      subtitle: "Votre projet prend vie",
      description: "Collaborez avec le prestataire parfait pour votre vision",
      visual: "🚀",
      emotion: "Excité et accompagné",
      details: "Travaillez avec un professionnel qui comprend vraiment votre vision. Support inclus pour que tout se passe parfaitement."
    }
  ];

  // Témoignages plus émotionnels
  const testimonials = [
    {
      name: "Sarah Dubois",
      role: "Créatrice de mode",
      company: "Atelier Sarah",
      avatar: "SD",
      rating: 5,
      text: "J'avais peur de ne jamais trouver le bon développeur pour ma boutique en ligne. En 2 heures, j'avais 5 propositions parfaites ! Mon site est maintenant exactement comme je l'imaginais.",
      project: "E-commerce créatif",
      emotion: "😍",
      before: "Paralysée par le choix",
      after: "Confiante et ravie"
    },
    {
      name: "Thomas Martin",
      role: "Chef d'entreprise",
      company: "EcoTech Solutions",
      avatar: "TM",
      rating: 5,
      text: "Fini les recherches interminables sur Google ! SWIDEAL m'a connecté avec un consultant marketing extraordinaire. Mon chiffre d'affaires a doublé en 6 mois.",
      project: "Stratégie marketing",
      emotion: "🤩",
      before: "Perdu dans mes recherches",
      after: "Business en croissance"
    },
    {
      name: "Emma Rousseau",
      role: "Blogueuse lifestyle",
      company: "Emma's World",
      avatar: "ER",
      rating: 5,
      text: "J'ai découvert des talents créatifs incroyables que je n'aurais jamais trouvés seule. Mon nouveau logo et ma charte graphique font sensation !",
      project: "Identité visuelle",
      emotion: "✨",
      before: "Cherchait l'inspiration",
      after: "Image de marque au top"
    }
  ];

  // Bénéfices émotionnels
  const emotionalBenefits = [
    {
      icon: Heart,
      title: "Fini le stress de chercher",
      subtitle: "Ils viennent à vous",
      description: "Plus jamais d'heures perdues à éplucher des profils. Relaxez-vous, les experts vous trouvent.",
      color: "red",
      stat: "90% moins de stress"
    },
    {
      icon: Smile,
      title: "Des rencontres inspirantes",
      subtitle: "Découvrez des talents cachés",
      description: "Connectez-vous avec des professionnels passionnés qui comprennent votre vision.",
      color: "yellow",
      stat: "Des collaborations magiques"
    },
    {
      icon: Rocket,
      title: "Réalisez vos rêves plus vite",
      subtitle: "Concrétisez rapidement",
      description: "De l'idée à la réalisation en quelques jours au lieu de plusieurs semaines.",
      color: "blue",
      stat: "3x plus rapide"
    },
    {
      icon: Shield,
      title: "Dormez sur vos deux oreilles",
      subtitle: "Qualité garantie",
      description: "Tous nos prestataires sont vérifiés. Votre projet est entre de bonnes mains.",
      color: "green",
      stat: "100% sécurisé"
    }
  ];

  const successStories = [
    {
      client: "Restaurant Le Bistrot",
      challenge: "Site web vieillot, pas de visibilité online",
      solution: "Design moderne + référencement local",
      result: "+150% de réservations en 3 mois",
      icon: "🍽️"
    },
    {
      client: "Coach Wellness Maya",
      challenge: "Difficile de trouver des clients",
      solution: "Stratégie réseaux sociaux + site vitrine",
      result: "Agenda complet pendant 6 mois",
      icon: "🧘‍♀️"
    },
    {
      client: "Startup GreenTech",
      challenge: "Application mobile complexe",
      solution: "Équipe de développeurs experts",
      result: "Levée de fonds de 500k€ réussie",
      icon: "📱"
    }
  ];

  const faqData = [
    {
      question: "Concrètement, comment SWIDEAL va changer ma vie ?",
      answer: "Imaginez : vous décrivez votre projet en 5 minutes, puis vous recevez des propositions de qualité sans rien faire d'autre. Plus de recherche fastidieuse, plus de doutes sur le choix du prestataire. Vous gagnez des heures et dormez tranquille."
    },
    {
      question: "Pourquoi les prestataires seraient-ils meilleurs sur SWIDEAL ?",
      answer: "Nos prestataires sont motivés ! Ils savent qu'ils sont en compétition loyale et donnent le meilleur d'eux-mêmes. De plus, seuls ceux avec une excellente réputation peuvent vous proposer leurs services."
    },
    {
      question: "Est-ce que ça marche vraiment pour tous les types de projets ?",
      answer: "Absolument ! Que vous ayez besoin d'un site web, d'un logo, d'une stratégie marketing, d'une formation, ou même d'aide pour vos démarches administratives, notre réseau couvre plus de 20 domaines d'expertise."
    },
    {
      question: "Combien ça coûte et y a-t-il des frais cachés ?",
      answer: "C'est 100% gratuit pour vous ! Aucun frais d'inscription, aucun abonnement, aucune commission sur votre projet. Vous ne payez que le prestataire que vous choisissez, au prix convenu avec lui."
    },
    {
      question: "Que se passe-t-il si je ne suis pas satisfait ?",
      answer: "Notre équipe vous accompagne jusqu'à la réussite de votre projet. En cas de problème, nous trouvons une solution : médiation, remplacement du prestataire, ou remboursement selon les cas."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section Ultra-Engageant */}
        <div className="relative text-center py-20 px-2 sm:px-0 overflow-hidden">
          {/* Effets de fond animés améliorés */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="absolute top-10 left-10 text-6xl animate-bounce">✨</div>
          <div className="absolute top-20 right-20 text-4xl animate-pulse">🚀</div>
          <div className="absolute bottom-20 left-1/4 text-5xl animate-spin-slow">⭐</div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-8 py-3 rounded-full text-lg font-bold mb-8 shadow-lg animate-pulse-glow">
              <PartyPopper className="w-6 h-6 mr-3" />
              La révolution de la mise en relation est là !
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-800 mb-8 leading-tight">
              Transformez vos idées 
              <br />
              <span className="text-emerald-600">en succès</span>
            </h1>
            
            <p className="text-2xl sm:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-10 font-medium">
              Arrêtez de chercher des prestataires.
              <br />
              <span className="text-emerald-600 font-bold">Laissez-les vous trouver !</span>
            </p>

            {/* Promesse émotionnelle */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-8 max-w-3xl mx-auto mb-10 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre promesse :</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <h3 className="font-bold text-lg">Gain de temps garanti</h3>
                    <p className="text-gray-600">Des heures de recherche → 5 minutes de description</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💎</div>
                  <div>
                    <h3 className="font-bold text-lg">Qualité premium</h3>
                    <p className="text-gray-600">Seuls les meilleurs prestataires vous contactent</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💝</div>
                  <div>
                    <h3 className="font-bold text-lg">Totalement gratuit</h3>
                    <p className="text-gray-600">Aucun frais, aucune commission pour vous</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🛡️</div>
                  <div>
                    <h3 className="font-bold text-lg">Accompagnement total</h3>
                    <p className="text-gray-600">Support jusqu'à la réussite de votre projet</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button 
                onClick={() => setLocation('/create-mission')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-xl px-10 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-bounce-slow"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Commencer mon projet maintenant
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/demo-missions')}
                className="border-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xl px-10 py-6 rounded-full transition-all duration-300"
              >
                <Eye className="w-6 h-6 mr-3" />
                Voir des exemples concrets
              </Button>
            </div>

            <p className="text-lg text-gray-500 mb-4">Plus de 1000+ projets réussis</p>
            <div className="flex justify-center items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-600 ml-2">4.9/5 - Note moyenne des clients</span>
            </div>
          </div>
        </div>

        {/* Bénéfices émotionnels */}
        <div className="mb-24 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Pourquoi nos utilisateurs adorent SWIDEAL</h2>
            <p className="text-2xl text-gray-600">Découvrez ce qui va changer dans votre quotidien</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emotionalBenefits.map((benefit, index) => (
              <div 
                key={index}
                className={`bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${
                  hoveredBenefit === index ? 'ring-4 ring-blue-200' : ''
                }`}
                onMouseEnter={() => setHoveredBenefit(index)}
                onMouseLeave={() => setHoveredBenefit(null)}
              >
                <div className="flex items-start space-x-6">
                  <div className={`p-4 rounded-2xl bg-${benefit.color}-100`}>
                    <benefit.icon className={`w-8 h-8 text-${benefit.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className={`text-lg font-semibold text-${benefit.color}-600 mb-3`}>{benefit.subtitle}</p>
                    <p className="text-gray-700 mb-4 leading-relaxed">{benefit.description}</p>
                    <div className={`inline-block bg-${benefit.color}-50 text-${benefit.color}-700 px-4 py-2 rounded-full font-bold text-sm`}>
                      {benefit.stat}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processus simplifié et émotionnel */}
        <div className="mb-24 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 text-white">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Comment ça marche ?</h2>
              <p className="text-2xl opacity-90">4 étapes pour transformer votre idée en réalité</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {demoSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`text-center p-6 rounded-2xl transition-all duration-500 ${
                    activeDemo === index 
                      ? 'bg-white/20 shadow-2xl scale-110 transform' 
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="text-6xl mb-4 animate-bounce">{step.visual}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-blue-200 font-semibold mb-3">{step.subtitle}</p>
                  <p className="text-gray-200 mb-4">{step.description}</p>
                  <div className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-sm font-semibold">
                    {step.emotion}
                  </div>
                  {activeDemo === index && (
                    <p className="mt-4 text-sm text-blue-100 bg-white/10 p-3 rounded-lg animate-fadeIn">
                      {step.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Histoires de réussite */}
        <div className="mb-24 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Histoires de réussite</h2>
            <p className="text-2xl text-gray-600">Des projets qui ont changé des vies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
                  <div className="text-4xl mb-2">{story.icon}</div>
                  <CardTitle className="text-xl">{story.client}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-red-600 mb-1">😟 Problème :</h4>
                      <p className="text-gray-700">{story.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-600 mb-1">💡 Solution SWIDEAL :</h4>
                      <p className="text-gray-700">{story.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-600 mb-1">🚀 Résultat :</h4>
                      <p className="text-gray-700 font-bold">{story.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Témoignages améliorés */}
        <div className="mb-24 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ils ont osé, ils ont réussi !</h2>
            <p className="text-2xl text-gray-600">Des témoignages authentiques qui font chaud au cœur</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-4 right-4 text-3xl">{testimonial.emotion}</div>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <Quote className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-semibold text-red-700">Avant :</span>
                      <span className="text-sm text-red-600">{testimonial.before}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-semibold text-green-700">Après :</span>
                      <span className="text-sm text-green-600">{testimonial.after}</span>
                    </div>
                  </div>

                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-4">
                    📁 {testimonial.project}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ améliorée */}
        <div className="mb-24 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Vos questions, nos réponses</h2>
              <p className="text-2xl text-gray-600">Tout ce que vous devez savoir pour vous lancer en toute sérénité</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-lg text-gray-900 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-8 py-6 bg-blue-50 border-t-2 border-blue-100">
                      <p className="text-gray-700 leading-relaxed text-lg">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Final Ultra-Motivant */}
        <div className="mb-12 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Effets de fond */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            
            {/* Éléments décoratifs */}
            <div className="absolute top-10 left-10 text-4xl animate-spin-slow">⭐</div>
            <div className="absolute top-10 right-10 text-4xl animate-bounce">🚀</div>
            <div className="absolute bottom-10 left-1/4 text-4xl animate-pulse">✨</div>
            <div className="absolute bottom-10 right-1/4 text-4xl animate-bounce">💎</div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">Votre projet vous attend !</h2>
              <p className="text-2xl md:text-3xl mb-8 opacity-90 leading-relaxed">
                Arrêtez de rêver, commencez à réaliser.
                <br />
                <span className="font-bold">Votre succès commence maintenant !</span>
              </p>
              
              {/* Urgence et motivation */}
              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-10 max-w-3xl mx-auto">
                <h3 className="text-xl font-bold mb-4">🔥 Offre de lancement limitée :</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                  <div>✅ Accompagnement premium gratuit</div>
                  <div>✅ Priorité sur les propositions</div>
                  <div>✅ Support dédié inclus</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
                <Button 
                  onClick={() => setLocation('/create-mission')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-black text-2xl px-12 py-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse-glow"
                >
                  <Lightning className="w-8 h-8 mr-4" />
                  JE LANCE MON PROJET MAINTENANT
                </Button>
                <Button 
                  onClick={() => setLocation('/marketplace')}
                  variant="outline"
                  className="border-4 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-xl px-10 py-8 rounded-full transition-all duration-300"
                >
                  <Eye className="w-6 h-6 mr-3" />
                  Explorer les possibilités
                </Button>
              </div>

              <div className="text-center space-y-3">
                <p className="text-xl font-bold">
                  ⚡ Gratuit • 🎯 Efficace • 💎 Premium
                </p>
                <p className="text-lg opacity-90">
                  Rejoignez plus de 1000+ entrepreneurs qui ont déjà franchi le pas
                </p>
                <div className="flex justify-center items-center space-x-2 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-3 text-lg">4.9/5 - Ils recommandent !</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
