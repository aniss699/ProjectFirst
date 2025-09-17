import React from 'react';
import { useLocation } from 'wouter';
import { ProgressiveFlow } from '../components/home/progressive-flow';

function AdvancedCreateMissionPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer une mission - Mode avancé
          </h1>
          <p className="text-gray-600 mb-4">
            Configuration détaillée avec toutes les options disponibles
          </p>
          <button
            onClick={() => setLocation('/create-mission')}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            ← Revenir au mode simplifié
          </button>
        </div>

        <ProgressiveFlow />
      </div>
    </div>
  );
}

export default AdvancedCreateMissionPage;