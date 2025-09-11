import { useState } from 'react';
import { useLocation } from 'wouter';
import { ProgressiveFlow } from '@/components/home/progressive-flow';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useMissionCreation } from '@/hooks/use-mission-creation';
import { useToast } from '@/hooks/use-toast';
// Validation simplifiée - délégation au service centralisé

export default function CreateMission() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { createMission, isLoading, error, clearError } = useMissionCreation();
  const { toast } = useToast();

  // Mock navigate function, replace with your actual navigation hook if different
  const navigate = (path: string) => setLocation(path);

  const handleSubmit = async (values: any) => {
    try {
      clearError();
      console.log('🚀 CreateMission: Submitting via centralized service');

      // Utiliser service centralisé (validation incluse)
      const result = await createMission(values);

      if (result.ok) {
        console.log('✅ CreateMission: Mission created successfully');
        setLocation('/missions');
      }
      // L'erreur est gérée automatiquement par le hook
    } catch (error) {
      console.error('❌ CreateMission: Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Bloc d'affichage progressif */}
        <div className="px-2 sm:px-0 relative">
          {/* Fond décoratif harmonisé */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-indigo-200/15 to-purple-200/20 rounded-3xl blur-2xl transform -rotate-1 scale-105"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/30 via-purple-100/20 to-blue-100/25 rounded-3xl blur-xl transform rotate-1 scale-102"></div>
          <div className="relative z-10">
            <ProgressiveFlow 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
              error={error}
              onComplete={(data) => {
                console.log('✅ Projet créé:', data);
                // Amélioration UX : feedback visuel de succès
                toast({
                  title: "Mission créée !",
                  description: `"${data.title}" a été publiée avec succès`,
                  variant: "default"
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}