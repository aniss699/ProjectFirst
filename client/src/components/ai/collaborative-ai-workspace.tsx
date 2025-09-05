
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Zap,
  Target,
  Brain,
  Calendar,
  FileText,
  TrendingUp,
  Settings
} from 'lucide-react';

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  aiSuggestions: string[];
  blockers: string[];
  timeEstimate: number;
  actualTime?: number;
}

interface AIInsight {
  type: 'risk' | 'optimization' | 'suggestion' | 'milestone';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: number;
}

interface CollaborationMetrics {
  teamEfficiency: number;
  communicationScore: number;
  deadlineAdherence: number;
  qualityIndex: number;
  riskLevel: string;
}

interface WorkspaceProps {
  projectId: string;
  userId: string;
  userRole: 'client' | 'provider' | 'manager';
}

export default function CollaborativeAIWorkspace({ 
  projectId, 
  userId, 
  userRole 
}: WorkspaceProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<CollaborationMetrics>({
    teamEfficiency: 0,
    communicationScore: 0,
    deadlineAdherence: 0,
    qualityIndex: 0,
    riskLevel: 'low'
  });
  const [aiAssistantActive, setAIAssistantActive] = useState(true);
  const [autoOptimization, setAutoOptimization] = useState(true);

  useEffect(() => {
    loadWorkspaceData();
    const interval = setInterval(updateAIInsights, 60000); // Mise à jour chaque minute
    return () => clearInterval(interval);
  }, [projectId]);

  const loadWorkspaceData = async () => {
    // Simulation de données de workspace
    const mockTasks: ProjectTask[] = [
      {
        id: '1',
        title: 'Configuration de l\'architecture',
        description: 'Mettre en place la structure du projet et les outils de développement',
        status: 'completed',
        priority: 'high',
        assignee: 'Développeur Principal',
        dueDate: '2024-01-15',
        aiSuggestions: ['Utiliser Docker pour l\'environnement', 'Mettre en place CI/CD dès maintenant'],
        blockers: [],
        timeEstimate: 8,
        actualTime: 6
      },
      {
        id: '2',
        title: 'Développement de l\'API',
        description: 'Créer les endpoints principaux pour la communication frontend/backend',
        status: 'in_progress',
        priority: 'high',
        assignee: 'Développeur Backend',
        dueDate: '2024-01-20',
        aiSuggestions: [
          'Implémenter la validation des données en amont',
          'Prévoir la gestion d\'erreurs robuste',
          'Documenter l\'API avec Swagger'
        ],
        blockers: ['Attente validation schéma DB'],
        timeEstimate: 16,
        actualTime: 12
      },
      {
        id: '3',
        title: 'Interface utilisateur',
        description: 'Développer les composants React principaux',
        status: 'in_progress',
        priority: 'medium',
        assignee: 'Développeur Frontend',
        dueDate: '2024-01-25',
        aiSuggestions: [
          'Utiliser les composants UI existants',
          'Optimiser pour mobile dès le début',
          'Intégrer tests unitaires'
        ],
        blockers: [],
        timeEstimate: 20,
        actualTime: 8
      },
      {
        id: '4',
        title: 'Tests et validation',
        description: 'Tests fonctionnels et validation client',
        status: 'todo',
        priority: 'medium',
        assignee: 'QA Tester',
        dueDate: '2024-01-30',
        aiSuggestions: [
          'Automatiser les tests de régression',
          'Préparer scenarii de test utilisateur',
          'Planifier session de test client'
        ],
        blockers: ['Dépend de l\'achèvement du développement'],
        timeEstimate: 12
      }
    ];

    const mockInsights: AIInsight[] = [
      {
        type: 'risk',
        title: 'Retard potentiel détecté',
        description: 'Le développement API prend plus de temps que prévu. Risque de retard sur les tâches suivantes.',
        confidence: 78,
        actionable: true,
        priority: 8
      },
      {
        type: 'optimization',
        title: 'Parallélisation possible',
        description: 'Les tâches UI et tests peuvent être démarrées en parallèle pour gagner 3 jours.',
        confidence: 85,
        actionable: true,
        priority: 7
      },
      {
        type: 'suggestion',
        title: 'Communication client recommandée',
        description: 'Moment optimal pour présenter l\'avancement au client et valider les orientations.',
        confidence: 92,
        actionable: true,
        priority: 6
      },
      {
        type: 'milestone',
        title: 'Milestone API atteint',
        description: 'Les endpoints principaux sont fonctionnels. Prêt pour les tests d\'intégration.',
        confidence: 95,
        actionable: false,
        priority: 5
      }
    ];

    const mockMetrics: CollaborationMetrics = {
      teamEfficiency: 87,
      communicationScore: 92,
      deadlineAdherence: 76,
      qualityIndex: 89,
      riskLevel: 'medium'
    };

    setTasks(mockTasks);
    setAIInsights(mockInsights);
    setMetrics(mockMetrics);
  };

  const updateAIInsights = async () => {
    // Simulation de nouvelles insights IA
    if (aiAssistantActive) {
      const newInsight: AIInsight = {
        type: 'suggestion',
        title: 'Optimisation détectée',
        description: `Suggestion générée à ${new Date().toLocaleTimeString()}`,
        confidence: Math.floor(Math.random() * 30) + 70,
        actionable: true,
        priority: Math.floor(Math.random() * 10)
      };
      
      setAIInsights(prev => [newInsight, ...prev.slice(0, 9)]); // Garder max 10 insights
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: ProjectTask['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getStatusColor = (status: ProjectTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-orange-500';
      case 'todo': return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 border-red-200 bg-red-50';
      case 'medium': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'low': return 'text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'optimization': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'suggestion': return <Brain className="w-4 h-4 text-blue-500" />;
      case 'milestone': return <Target className="w-4 h-4 text-green-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec contrôles IA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Workspace Collaboratif IA</h2>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Brain className="w-3 h-3 mr-1" />
            IA Active
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={aiAssistantActive ? "default" : "outline"}
            size="sm"
            onClick={() => setAIAssistantActive(!aiAssistantActive)}
          >
            <Brain className="w-4 h-4 mr-2" />
            Assistant IA
          </Button>
          <Button
            variant={autoOptimization ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoOptimization(!autoOptimization)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Auto-optimisation
          </Button>
        </div>
      </div>

      {/* Métriques de collaboration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficacité Équipe</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.teamEfficiency}%</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={metrics.teamEfficiency} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Communication</p>
                <p className="text-2xl font-bold text-green-600">{metrics.communicationScore}%</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={metrics.communicationScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Respect Délais</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.deadlineAdherence}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={metrics.deadlineAdherence} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Index Qualité</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.qualityIndex}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={metrics.qualityIndex} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Niveau Risque</p>
                <p className={`text-2xl font-bold ${getRiskColor(metrics.riskLevel)}`}>
                  {metrics.riskLevel}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights IA en temps réel */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Insights IA Temps Réel
            <Badge variant="outline" className="ml-auto">
              {aiInsights.filter(i => i.actionable).length} Actions recommandées
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {aiInsights.slice(0, 4).map((insight, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  <Badge variant="outline">
                    {insight.confidence}% sûr
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Priorité: {insight.priority}/10
                  </div>
                  {insight.actionable && (
                    <Button size="sm" variant="outline">
                      Appliquer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestion des tâches avec IA */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kanban">Vue Kanban IA</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Smart</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Projet</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['todo', 'in_progress', 'review', 'completed'].map((status) => (
              <Card key={status} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status as any)}`}></div>
                    {status === 'todo' ? 'À faire' :
                     status === 'in_progress' ? 'En cours' :
                     status === 'review' ? 'En révision' : 'Terminé'}
                    <Badge variant="secondary" className="ml-auto">
                      {tasks.filter(t => t.status === status).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.filter(t => t.status === status).map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg border ${getPriorityColor(task.priority)}`}>
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Assigné: {task.assignee}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        
                        {task.timeEstimate && (
                          <div className="flex items-center justify-between text-xs">
                            <span>Estimé: {task.timeEstimate}h</span>
                            {task.actualTime && (
                              <span className={task.actualTime > task.timeEstimate ? 'text-red-600' : 'text-green-600'}>
                                Réel: {task.actualTime}h
                              </span>
                            )}
                          </div>
                        )}
                        
                        {task.blockers.length > 0 && (
                          <div className="text-xs text-red-600">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {task.blockers.length} bloqueur(s)
                          </div>
                        )}
                        
                        {task.aiSuggestions.length > 0 && (
                          <div className="text-xs text-blue-600">
                            <Brain className="w-3 h-3 inline mr-1" />
                            {task.aiSuggestions.length} suggestion(s) IA
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 mt-3">
                        {['todo', 'in_progress', 'review', 'completed'].map((newStatus) => (
                          newStatus !== status && (
                            <Button
                              key={newStatus}
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1"
                              onClick={() => updateTaskStatus(task.id, newStatus as any)}
                            >
                              {newStatus === 'todo' ? '📋' :
                               newStatus === 'in_progress' ? '⚡' :
                               newStatus === 'review' ? '👀' : '✅'}
                            </Button>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Timeline Smart avec Prédictions IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(task.status)}`}></div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="text-sm text-gray-600">
                        {task.assignee} • Due: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {task.timeEstimate}h estimé
                      </div>
                      {task.actualTime && (
                        <div className={`text-xs ${task.actualTime > task.timeEstimate ? 'text-red-600' : 'text-green-600'}`}>
                          {task.actualTime}h réel
                        </div>
                      )}
                    </div>
                    
                    <Badge variant={task.priority === 'high' ? 'destructive' : 
                                  task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance Projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression globale</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Respect des délais</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} className="h-3 bg-orange-100" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Vélocité équipe</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Prédictions IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-700">Livraison dans les temps</div>
                    <div className="text-sm text-green-600">Probabilité: 78%</div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="font-medium text-orange-700">Budget dépassé de 12%</div>
                    <div className="text-sm text-orange-600">Prédiction basée sur vélocité actuelle</div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-700">Qualité excellente attendue</div>
                    <div className="text-sm text-blue-600">Score qualité prévu: 92%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
