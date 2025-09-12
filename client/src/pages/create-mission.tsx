import React from 'react';
import { useLocation } from 'wouter';
import { SimpleMissionCreator } from '../components/missions/simple-mission-creator';

export function CreateMissionPage() {
  const [, setLocation] = useLocation();

  const handleSuccess = (missionData: any) => {
    console.log('✅ Mission créée avec succès:', missionData);
    // Rediriger vers la page des missions ou le marketplace
    setLocation('/marketplace');
  };

  const handleError = (error: any) => {
    console.error('❌ Erreur lors de la création de mission:', error);
    // L'erreur est déjà gérée dans le composant, on peut juste logger ici
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer une nouvelle mission
          </h1>
          <p className="text-gray-600">
            Décrivez votre projet en quelques mots et trouvez le bon prestataire
          </p>
        </div>

        <SimpleMissionCreator 
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Lien vers le mode avancé si nécessaire */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setLocation('/create-mission/advanced')}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Besoin de plus d'options ? Utiliser le mode avancé
          </button>
        </div>
      </div>
    </div>
  );
}