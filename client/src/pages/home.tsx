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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
                Notre approche
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nous améliorons le modèle de mise en relation existant avec deux mécanismes simples mais efficaces
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Enchères inversées */}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">⚖️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Enchères inversées</h3>
                <p className="text-gray-600 mb-4">
                  Au lieu de chercher des prestataires, publiez votre besoin et laissez-les venir à vous avec leurs meilleures offres.
                </p>
                <div className="text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                  Résultat : des prix plus compétitifs naturellement
                </div>
              </div>

              {/* Mise en relation payante */}
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Mise en relation payante</h3>
                <p className="text-gray-600 mb-4">
                  Au lieu de prospecter pendant des semaines, payez quelqu'un qui a déjà le contact pour vous mettre en relation directement.
                </p>
                <div className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
                  Résultat : votre réseau devient rentable, les contacts sont immédiats
                </div>
              </div>
            </div>

            {/* Pourquoi ça marche */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Pourquoi cette combinaison fonctionne</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-orange-600 font-semibold mb-1">Économiquement logique</div>
                  <div className="text-sm text-gray-600">La concurrence optimise les prix</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-purple-600 font-semibold mb-1">Efficace pour tous</div>
                  <div className="text-sm text-gray-600">Moins de recherche, plus de résultats</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-emerald-600 font-semibold mb-1">Réseau rentable</div>
                  <div className="text-sm text-gray-600">Chacun peut devenir apporteur d'affaires</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-blue-600 font-semibold mb-1">Contacts immédiats</div>
                  <div className="text-sm text-gray-600">Fini la prospection longue</div>
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