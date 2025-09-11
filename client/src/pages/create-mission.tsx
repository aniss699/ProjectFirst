import { useState } from 'react';
import { useLocation } from 'wouter';
import { ProgressiveFlow } from '@/components/home/progressive-flow';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useMissionCreation } from '@/hooks/use-mission-creation';
import { z } from 'zod';

// Complete mission form schema
const missionFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  budget: z.union([z.string(), z.number()]).optional(),
  location: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  requirements: z.string().optional(),
  tags: z.array(z.string()).default([]),
  deadline: z.union([z.string(), z.date()]).optional(),
});

export default function CreateMission() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { createMission, isLoading, error, clearError } = useMissionCreation();

  // Mock navigate function, replace with your actual navigation hook if different
  const navigate = (path: string) => setLocation(path);

  const handleSubmit = async (values: z.infer<typeof missionFormSchema>) => {
    try {
      clearError();

      // Validate data
      const validatedData = missionFormSchema.parse(values);
      
      console.log('🚀 CreateMission: Submitting data via hook');

      // Use centralized service
      const result = await createMission(validatedData);

      if (result.ok) {
        console.log('✅ CreateMission: Mission created successfully');
        setLocation('/missions');
      }
      // Error is handled by the hook automatically
    } catch (validationError) {
      console.error('❌ CreateMission: Validation error:', validationError);
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
              onSubmit={handleSubmit} // Pass handleSubmit to the form
              isLoading={isLoading}
              error={error}
              onComplete={(data) => {
                console.log('Données du projet:', data);
                // Redirection handled by handleSubmit on success
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}