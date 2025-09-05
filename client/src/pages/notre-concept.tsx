import { useState } from 'react';
import { useLocation } from 'wouter';
import { Zap, MessageSquare, Star, Users, Clock, Sparkles, Target, Shield, Rocket, Brain, ArrowRight, CheckCircle, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotreConcept() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - Notre Vision */}
        <div className="relative text-center py-20 px-2 sm:px-0 overflow-hidden">
          {/* Effet de fond dynamique */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-500/10 to-purple-600/10 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-blue-200/20 rounded-3xl transform rotate-1"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Notre Vision
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-800 mb-6 leading-tight">
              Révolutionner la mise en relation professionnelle
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-10">
              SWIDEAL transforme la façon dont les <span className="text-blue-600 font-bold">clients</span> trouvent les meilleurs 
              <span className="text-emerald-600 font-bold"> prestataires</span> grâce à l'intelligence artificielle et aux enchères inversées.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setLocation('/marketplace')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Découvrir la plateforme
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/ai-hub')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-4 rounded-full"
              >
                <Brain className="w-5 h-5 mr-2" />
                Voir l'IA en action
              </Button>
            </div>
          </div>
        </div>

        {/* Le Problème que nous résolvons */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Le problème que nous résolvons</h2>
              <p className="text-xl text-gray-600">Les défis actuels de la mise en relation professionnelle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-800 mb-4">Pour les clients</h3>
                <ul className="space-y-3 text-red-700">
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Difficulté à trouver le bon prestataire</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Pas de transparence sur les prix</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Processus de comparaison complexe</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Risque de mauvaise qualité</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-orange-800 mb-4">Pour les prestataires</h3>
                <ul className="space-y-3 text-orange-700">
                  <li className="flex items-start"><span className="text-orange-500 mr-2">•</span> Difficile de se démarquer</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2">•</span> Perte de temps sur des projets non qualifiés</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2">•</span> Concurrence déloyale sur les prix</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2">•</span> Manque de visibilité</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Notre Solution */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Notre solution révolutionnaire</h2>
            <p className="text-xl text-gray-600">L'intelligence artificielle au service de la mise en relation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">IA Intelligente</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Notre IA analyse votre projet, l'optimise automatiquement et trouve les prestataires les plus adaptés selon 50+ critères de matching.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Enchères Inversées</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Les prestataires viennent à vous avec leurs meilleures offres. Plus besoin de chercher, les prix s'optimisent naturellement.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Qualité Garantie</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Système de notation blockchain, vérification des compétences et détection anti-fraude pour une confiance totale.
              </p>
            </div>
          </div>
        </div>

        {/* Comment ça change tout */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Comment SWIDEAL change tout</h2>
              <p className="text-xl opacity-90">L'avant / après de la mise en relation professionnelle</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Avant */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-red-300">❌ Avant (méthode traditionnelle)</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="bg-red-500/20 text-red-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">1</span>
                    <p className="opacity-90">Recherche manuelle fastidieuse de prestataires</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-red-500/20 text-red-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">2</span>
                    <p className="opacity-90">Demandes de devis une par une</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-red-500/20 text-red-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">3</span>
                    <p className="opacity-90">Comparaison manuelle complexe</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-red-500/20 text-red-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">4</span>
                    <p className="opacity-90">Risque de mauvais choix</p>
                  </div>
                  <div className="text-red-300 font-bold text-lg mt-6">⏱️ Résultat : Semaines de travail, stress, incertitude</div>
                </div>
              </div>

              {/* Après */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-green-300">✅ Avec SWIDEAL</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="bg-green-500/20 text-green-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">1</span>
                    <p className="opacity-90">IA optimise automatiquement votre projet</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-500/20 text-green-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">2</span>
                    <p className="opacity-90">Les meilleurs prestataires viennent à vous</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-500/20 text-green-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">3</span>
                    <p className="opacity-90">Comparaison intelligente avec scoring IA</p>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-500/20 text-green-300 rounded-full px-3 py-1 text-sm font-semibold mr-4 mt-1">4</span>
                    <p className="opacity-90">Garantie qualité et sécurité blockchain</p>
                  </div>
                  <div className="text-green-300 font-bold text-lg mt-6">🚀 Résultat : Quelques heures, zéro stress, résultat optimal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nos innovations IA */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Nos innovations IA</h2>
            <p className="text-xl text-gray-600">12+ technologies d'intelligence artificielle au service de la performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Neural Pricing", accuracy: "91%", time: "<50ms", icon: TrendingUp, color: "emerald" },
              { name: "Semantic Matching", accuracy: "92%", time: "<40ms", icon: Target, color: "blue" },
              { name: "Fraud Detection", accuracy: "95%", time: "<30ms", icon: Shield, color: "red" },
              { name: "Trust Scoring", accuracy: "88%", time: "<25ms", icon: Star, color: "purple" },
            ].map((tech, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className={`bg-${tech.color}-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <tech.icon className={`w-6 h-6 text-${tech.color}-600`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Précision:</span>
                    <span className="font-semibold text-green-600">{tech.accuracy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vitesse:</span>
                    <span className="font-semibold text-blue-600">{tech.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pourquoi maintenant */}
        <div className="mb-20 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Pourquoi maintenant ?</h2>
              <p className="text-xl text-gray-600">Le timing parfait pour révolutionner la mise en relation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Digitalisation accélérée</h3>
                <p className="text-gray-600">Le freelancing explose : +78% depuis 2020. Les professionnels cherchent de nouveaux modèles.</p>
              </div>
              <div className="text-center">
                <Brain className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">IA accessible</h3>
                <p className="text-gray-600">L'intelligence artificielle est enfin mature et accessible pour créer de vraies solutions.</p>
              </div>
              <div className="text-center">
                <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Demande croissante</h3>
                <p className="text-gray-600">Transparence, efficacité, qualité : les attentes évoluent vers plus d'intelligence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="mb-12 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Rejoignez la révolution</h2>
            <p className="text-xl mb-8 opacity-90">
              Soyez parmi les premiers à découvrir l'avenir de la mise en relation professionnelle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/marketplace')}
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explorer la plateforme
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={() => setLocation('/ai-hub')}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-lg px-8 py-4 rounded-full"
              >
                Voir l'IA en action
                <Brain className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}