
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { Project } from '@shared/schema';
import { formatDate } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { paths } from '../routes/paths';
import { useToast } from '@/hooks/use-toast';

interface ProjectWithDetails extends Project {
  bids_count?: number;
}

export default function MesDemandes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userProjects = [], isLoading, error } = useQuery<ProjectWithDetails[]>({
    queryKey: ['userProjects', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User ID manquant');
      }

      console.log('🔍 Récupération des projets pour user.id:', user.id);
      
      const response = await fetch(`/api/projects/users/${user.id}/projects`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API projets:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const projects = await response.json();
      console.log('✅ Projets récupérés:', projects.length);
      
      // Pour chaque projet, récupérer le nombre d'offres
      const projectsWithDetails = await Promise.all(
        projects.map(async (project: Project) => {
          try {
            const bidsResponse = await fetch(`/api/projects/${project.id}/bids`);
            if (bidsResponse.ok) {
              const bids = await bidsResponse.json();
              return {
                ...project,
                bids_count: bids.length || 0
              };
            }
            return { ...project, bids_count: 0 };
          } catch (error) {
            console.error(`Erreur récupération offres projet ${project.id}:`, error);
            return { ...project, bids_count: 0 };
          }
        })
      );
      
      console.log('✅ Projets avec détails:', projectsWithDetails.length);
      return projectsWithDetails;
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      toast({
        title: "Projet supprimé",
        description: "Votre projet a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', variant: 'secondary' as const },
      published: { label: 'Publié', variant: 'default' as const },
      in_progress: { label: 'En cours', variant: 'secondary' as const },
      completed: { label: 'Terminé', variant: 'outline' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.published;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatBudget = (budget: string) => {
    if (!budget || budget === '0') return 'Budget non spécifié';
    return `${parseInt(budget).toLocaleString()} €`;
  };

  // Debug: Log user info  
  console.log('👤 User actuel:', { id: user?.id, role: user?.role, email: user?.email });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-8">Veuillez vous connecter pour voir vos demandes</p>
          <Button onClick={() => setLocation('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Mes Demandes
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Consultez et gérez vos projets publiés
          </p>
        </div>
        <Button
          onClick={() => setLocation(paths.createMission)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Nouveau Projet
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 text-lg mb-4">Erreur de chargement</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
        </div>
      )}

      {/* Projects List */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {userProjects.length > 0 ? (
            userProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        {getStatusBadge(project.status || 'published')}
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-bold text-primary">
                        {formatBudget(project.budget || '0')}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(project.created_at!)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                      <span>Catégorie: {project.category}</span>
                      {project.quality_target && (
                        <span>Qualité: {project.quality_target}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{project.bids_count || 0} offre{(project.bids_count || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProjectId(project.id?.toString() || null)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Voir les détails
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/edit-project/${project.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id!)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        disabled={deleteProjectMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore créé de projets</p>
              <Button
                onClick={() => setLocation(paths.createMission)}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier projet
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProjectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Détails du projet</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectId(null)}
                >
                  ✕
                </Button>
              </div>
              {/* Ici on pourrait afficher les détails complets du projet */}
              <p className="text-gray-600">
                Détails du projet #{selectedProjectId} - Fonctionnalité à implémenter
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
