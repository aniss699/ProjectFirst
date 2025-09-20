import { useState } from 'react';
import { useLocation } from 'wouter';
import { HeroSection } from '@/components/home/hero-section';
import { ProgressiveFlow } from '@/components/home/progressive-flow';
import { Zap, MessageSquare, Star, Users, Clock } from 'lucide-react';
import { ROUTES } from '../routes/paths';

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloc d'affichage progressif */}
        <div id="mission-creator" className="px-2 sm:px-0 relative">
          {/* Fond décoratif harmonisé */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-indigo-200/15 to-purple-200/20 rounded-3xl blur-2xl transform -rotate-1 scale-105"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/30 via-purple-100/20 to-blue-100/25 rounded-3xl blur-xl transform rotate-1 scale-102"></div>
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-3xl blur-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/40 via-transparent to-blue-50/30 rounded-3xl transform rotate-1"></div>

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

        {/* Missions en cours */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>Missions en cours</h2>
            <p className="text-gray-600">Découvrez quelques projets actuellement ouverts sur la plateforme</p>
          </div>

          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission pour le moment</h3>
              <p className="text-gray-600">Les premières missions apparaîtront ici une fois la plateforme lancée</p>
            </div>
            <button 
              onClick={() => setLocation('/marketplace')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Explorer la plateforme
            </button>
          </div>
        </div>

        {/* Notre concept */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-6" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>Notre concept</h2>
            <p className="text-lg leading-relaxed max-w-4xl mx-auto">
              SWIDEAL révolutionne la mise en relation professionnelle grâce à l'intelligence artificielle. 
              Notre plateforme d'enchères inversées permettra aux <span className="text-blue-200 font-semibold">clients</span> de recevoir des devis personnalisés 
              en temps record, tandis que les <span className="text-green-200 font-semibold">prestataires</span> accèderont à des opportunités qualifiées 
              correspondant exactement à leurs compétences.
            </p>
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

        {/* Pourquoi choisir AppelsPro */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir SWIDEAL</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Gain de temps</h3>
              <p className="text-gray-600">Recevez plusieurs devis qualifiés en quelques heures au lieu de semaines de prospection</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">IA intelligente</h3>
              <p className="text-gray-600">Notre IA optimise votre brief et attire les meilleurs <span className="text-green-600 font-medium">prestataires</span> pour votre projet</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Qualité garantie</h3>
              <p className="text-gray-600">Tous nos <span className="text-green-600 font-medium">prestataires</span> sont vérifiés et évalués par la communauté</p>
            </div>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">SWIDEAL en chiffres</h2>
              <p className="text-lg opacity-90">Une plateforme en construction</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-lg opacity-90">Projets réalisés</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-lg opacity-90">Prestataires actifs</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">-</div>
                <div className="text-lg opacity-90">Taux de satisfaction</div>
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