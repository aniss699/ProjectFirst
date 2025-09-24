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

        

        
      </div>


    </div>
  );
}