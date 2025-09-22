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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
                  Notre concept
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  SWIDEAL révolutionne la mise en relation entre <span className="text-blue-600 font-semibold">clients</span> et <span className="text-emerald-600 font-semibold">prestataires</span> grâce à deux innovations majeures
                </p>
              </div>

              {/* Les deux concepts principaux */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                
                {/* Enchères inversées */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-3xl text-white">⚖️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-3">Enchères inversées</h3>
                    <p className="text-blue-700 font-medium">Le cœur de notre innovation</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <p className="text-gray-700">Vous publiez votre projet une seule fois</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <p className="text-gray-700">Les <span className="font-semibold text-emerald-600">prestataires</span> viennent à vous avec leurs propositions</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <p className="text-gray-700">Ils rivalisent pour vous offrir le meilleur rapport qualité-prix</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-medium text-center">
                      ✨ Résultat : Prix optimisés automatiquement
                    </p>
                  </div>
                </div>

                {/* Mise en relation payante */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-8 border border-emerald-100">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-3xl text-white">🤝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-900 mb-3">Mise en relation payante</h3>
                    <p className="text-emerald-700 font-medium">Garantie qualité et sérieux</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <p className="text-gray-700">Profils vérifiés et compétences validées</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <p className="text-gray-700">Engagement financier qui filtre les candidatures sérieuses</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <p className="text-gray-700">Support et médiation en cas de litige</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-emerald-100 rounded-lg">
                    <p className="text-emerald-800 font-medium text-center">
                      🛡️ Résultat : Qualité et sérieux garantis
                    </p>
                  </div>
                </div>
              </div>

              {/* Avantages concrets */}
              <div className="bg-gray-50 rounded-xl p-8">
                <h4 className="text-xl font-bold text-gray-900 text-center mb-6">Pourquoi cette approche change tout</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">€</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Prix justes</h5>
                    <p className="text-gray-600 text-sm">La concurrence naturelle entre prestataires optimise automatiquement les tarifs</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">⏱</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Gain de temps</h5>
                    <p className="text-gray-600 text-sm">Plus besoin de chercher : les candidats viennent à vous avec leurs meilleures offres</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">🎯</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">Qualité assurée</h5>
                    <p className="text-gray-600 text-sm">Modèle payant qui filtre les profils et garantit le sérieux des échanges</p>
                  </div>
                </div>
              </div>

              {/* Conclusion */}
              <div className="text-center mt-8">
                <p className="text-lg text-gray-700">
                  Une approche <span className="font-semibold text-blue-600">économiquement rationnelle</span> qui aligne les intérêts des <span className="text-blue-600 font-medium">clients</span> et des <span className="text-emerald-600 font-medium">prestataires</span>
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