import React from 'react';
import { useLocation } from 'wouter';
import { ProgressiveFlow } from '../components/home/progressive-flow';

export function CreateMissionPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer une nouvelle mission
          </h1>
          <p className="text-gray-600">
            Décrivez votre projet en détail pour attirer les meilleurs prestataires
          </p>
        </div>

        <ProgressiveFlow />
      </div>
    </div>
  );
}