import { useState } from 'react';
import { useLocation } from 'wouter';
import { HeroSection } from '@/components/home/hero-section';
import { ProgressiveFlow } from '@/components/home/progressive-flow';
import { Zap, MessageSquare, Star, Users, Clock } from 'lucide-react';
import { ROUTES } from '../routes/paths';

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloc d'affichage progressif */}
        <div id="mission-creator" className="px-2 sm:px-0 relative">
          {/* Fond décoratif harmonisé */}
          <div className="absolute inset-0 bg-white rounded-3xl blur-2xl transform -rotate-1 scale-105"></div>
          <div className="absolute inset-0 bg-white rounded-3xl blur-xl transform rotate-1 scale-102"></div>
          <div className="relative z-10">
            <ProgressiveFlow 
              onComplete={(data) => {
                console.log('Données du projet:', data);
                // Rediriger vers la page des missions après création
                setLocation('/missions');
              }}
            />
          </div>
        </div>

        {/* Slogan principal - VERSION PROFESSIONNELLE */}
        <div className="relative text-center py-16 px-2 sm:px-0 overflow-hidden">
          {/* Effet de fond subtil */}
          <div className="absolute inset-0 bg-white rounded-3xl blur-2xl"></div>
          <div className="absolute inset-0 bg-white rounded-3xl transform rotate-1"></div>

          {/* Contenu du slogan */}
          <div className="relative z-10">
            {/* Titre principal professionnel */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-700 mb-6 leading-tight tracking-tight">
              Ne cherche plus<br />
              <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                le meilleur prix
              </span>
            </h1>

            {/* Sous-titre élégant */}
            <div className="relative inline-block">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-600">
                il vient à toi !</h2>
            </div>
          </div>
        </div>

        

        {/* Notre concept */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Effets de fond dynamiques */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-3xl animate-pulse"></div>
            
            {/* Motifs décoratifs */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-emerald-400/20 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-300/60 rounded-full animate-pulse"></div>
            
            <div className="relative z-10 p-8 md:p-12 text-white">
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm font-semibold text-white/90">Innovation • IA • Enchères Inversées</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
                  Notre concept révolutionnaire
                </h2>
                
                <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto text-white/90 mb-8">
                  SWIDEAL transforme la mise en relation professionnelle en plaçant l'intelligence artificielle au cœur du processus. 
                  Fini les recherches fastidieuses : notre plateforme d'enchères inversées fait que <span className="text-blue-200 font-semibold">les meilleurs prestataires viennent à vous</span> avec leurs meilleures offres.
                </p>
              </div>

              {/* Points clés avec icônes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">IA Intelligente</h3>
                    <p className="text-white/80 text-sm">
                      Notre IA optimise automatiquement votre projet et attire les meilleurs talents
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Enchères Inversées</h3>
                    <p className="text-white/80 text-sm">
                      Les prestataires se disputent votre projet avec leurs meilleures offres
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Gain de Temps</h3>
                    <p className="text-white/80 text-sm">
                      Recevez plusieurs devis qualifiés en quelques heures au lieu de semaines
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action subtil */}
              <div className="text-center mt-8">
                <p className="text-white/70 text-sm">
                  Une approche unique qui fait gagner du temps aux <span className="text-blue-200 font-medium">clients</span> 
                  et offre plus d'opportunités aux <span className="text-emerald-200 font-medium">prestataires</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche</h2>
            <p className="text-gray-600">Deux approches simples selon vos besoins</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Appels d'offres */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-blue-600 mb-6 text-center">Appels d'offres inversés</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Publiez votre projet</h4>
                    <p className="text-gray-600 text-sm">Décrivez votre besoin en détail avec l'aide de notre IA</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Recevez des devis</h4>
                    <p className="text-gray-600 text-sm">Les <span className="text-green-600 font-medium">prestataires</span> qualifiés soumettent leurs propositions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Choisissez le meilleur</h4>
                    <p className="text-gray-600 text-sm">Comparez et sélectionnez l'offre qui vous convient</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mise en relation directe */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-green-600 mb-6 text-center">Mise en relation directe</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Choisissez un expert</h4>
                    <p className="text-gray-600 text-sm">Parcourez les profils vérifiés dans votre domaine</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Contactez directement</h4>
                    <p className="text-gray-600 text-sm">Échangez immédiatement avec le professionnel choisi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Démarrez votre projet</h4>
                    <p className="text-gray-600 text-sm">Négociez et lancez votre collaboration rapidement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12 px-2 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Questions fréquentes</h2>
            <p className="text-gray-600">Tout ce que vous devez savoir sur SWIDEAL</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                question: "Comment fonctionne l'enchère inversée ?",
                answer: "Le <span className=\"text-blue-600 font-medium\">client</span> publie son besoin et les <span className=\"text-green-600 font-medium\">prestataires</span> proposent leurs prix. L'offre la plus compétitive et qualitative remporte le projet."
              },
              {
                question: "Les prestataires sont-ils vérifiés ?",
                answer: "Le système de vérification des <span className=\"text-green-600 font-medium\">prestataires</span> sera mis en place lors du lancement : vérification des compétences, références et identité."
              },
              {
                question: "Y a-t-il des frais pour utiliser SWIDEAL ?",
                answer: "L'inscription sera gratuite. Le modèle économique final (commission sur projets finalisés) sera défini lors du lancement."
              },
              {
                question: "Combien de temps pour recevoir des propositions ?",
                answer: "Une fois la plateforme lancée, notre IA sera optimisée pour vous connecter rapidement avec les <span className=\"text-green-600 font-medium\">prestataires</span> adaptés."
              },
              {
                question: "Puis-je annuler un projet en cours ?",
                answer: "Oui, vous pouvez annuler avant validation finale. Notre équipe support vous accompagne pour résoudre tout malentendu avec le <span className=\"text-green-600 font-medium\">prestataire</span>."
              },
              {
                question: "Comment l'IA m'aide-t-elle à créer mon projet ?",
                answer: "Notre IA analyse votre brief, suggère des améliorations, estime le budget optimal et identifie les <span className=\"text-green-600 font-medium\">prestataires</span> les plus adaptés à vos besoins."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-base mb-2 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}