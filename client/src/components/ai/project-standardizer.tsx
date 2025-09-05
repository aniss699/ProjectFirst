
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Euro,
  Clock,
  TrendingUp,
  Wand2,
  RefreshCw
} from 'lucide-react';

interface ProjectStandardizerProps {
  projectId: string;
  initialData: {
    title: string;
    description: string;
    category?: string;
    budget?: number;
  };
  onStandardizationComplete?: (data: any) => void;
}

interface StandardizationResult {
  title_std: string;
  summary_std: string;
  acceptance_criteria: string[];
  category_std: string;
  sub_category_std: string;
  tags_std: string[];
  skills_std: string[];
  constraints_std: string[];
  brief_quality_score: number;
  richness_score: number;
  missing_info: any[];
  price_suggested_min?: number;
  price_suggested_med?: number;
  price_suggested_max?: number;
  delay_suggested_days?: number;
  loc_uplift_reco?: any;
}

export default function ProjectStandardizer({ 
  projectId, 
  initialData, 
  onStandardizationComplete 
}: ProjectStandardizerProps) {
  const [isStandardizing, setIsStandardizing] = useState(false);
  const [standardization, setStandardization] = useState<StandardizationResult | null>(null);
  const [missingInfoResponses, setMissingInfoResponses] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('analysis');

  const handleStandardize = async () => {
    setIsStandardizing(true);
    
    try {
      // Simuler appel API de standardisation
      const mockResult: StandardizationResult = {
        title_std: `${initialData.title} - Standardisé`,
        summary_std: `Projet standardisé: ${initialData.description.substring(0, 150)}...`,
        acceptance_criteria: [
          'Livrable conforme aux spécifications techniques',
          'Respect des délais convenus',
          'Tests et validation fonctionnelle',
          'Documentation complète',
          'Formation utilisateur si nécessaire'
        ],
        category_std: 'web-development',
        sub_category_std: 'fullstack',
        tags_std: ['web', 'développement', 'moderne', 'responsive'],
        skills_std: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'CSS'],
        constraints_std: ['Compatible navigateurs modernes', 'Responsive design'],
        brief_quality_score: 75,
        richness_score: 65,
        missing_info: [
          {
            type: 'budget_range',
            description: 'Budget ou fourchette budgétaire',
            priority: 'high',
            suggestion: 'Précisez votre budget pour recevoir des propositions adaptées'
          },
          {
            type: 'timeline',
            description: 'Délai ou échéance',
            priority: 'high',
            suggestion: 'Indiquez vos contraintes de délai'
          },
          {
            type: 'target_audience',
            description: 'Public cible',
            priority: 'medium',
            suggestion: 'Décrivez vos utilisateurs cibles'
          }
        ],
        price_suggested_min: 3500,
        price_suggested_med: 5000,
        price_suggested_max: 7500,
        delay_suggested_days: 21,
        loc_uplift_reco: {
          current_loc: 72,
          recommended_budget: 5500,
          recommended_delay: 28,
          expected_loc_improvement: 18
        }
      };

      setTimeout(() => {
        setStandardization(mockResult);
        setIsStandardizing(false);
        onStandardizationComplete?.(mockResult);
      }, 2000);

    } catch (error) {
      console.error('Standardization failed:', error);
      setIsStandardizing(false);
    }
  };

  const handleRecompute = async () => {
    if (!standardization) return;
    
    setIsStandardizing(true);
    
    try {
      // Simuler recalcul avec nouvelles informations
      const updatedStandardization = {
        ...standardization,
        brief_quality_score: Math.min(95, standardization.brief_quality_score + 15),
        richness_score: Math.min(90, standardization.richness_score + 10),
        missing_info: standardization.missing_info.filter(info => 
          !missingInfoResponses[info.type]
        )
      };

      setTimeout(() => {
        setStandardization(updatedStandardization);
        setIsStandardizing(false);
      }, 1500);

    } catch (error) {
      console.error('Recomputation failed:', error);
      setIsStandardizing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!standardization && !isStandardizing) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Standardisation IA de votre annonce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Notre IA va analyser et améliorer votre annonce pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Structurer automatiquement votre brief</li>
              <li>Extraire les compétences et catégories</li>
              <li>Suggérer des prix et délais optimaux</li>
              <li>Identifier les informations manquantes</li>
              <li>Améliorer la probabilité de succès (LOC)</li>
            </ul>
            <Button onClick={handleStandardize} className="w-full">
              <Wand2 className="w-4 h-4 mr-2" />
              Standardiser l'annonce
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isStandardizing) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Standardisation en cours...</h3>
          <p className="text-gray-600">
            L'IA analyse votre projet et génère des améliorations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scores de qualité */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Analyse de qualité
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Qualité: {standardization.brief_quality_score}%
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Richesse: {standardization.richness_score}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Qualité du brief</span>
                <span className={getQualityColor(standardization.brief_quality_score)}>
                  {standardization.brief_quality_score}%
                </span>
              </div>
              <Progress value={standardization.brief_quality_score} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Richesse du contenu</span>
                <span className={getQualityColor(standardization.richness_score)}>
                  {standardization.richness_score}%
                </span>
              </div>
              <Progress value={standardization.richness_score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="missing">
            Manquant ({standardization.missing_info.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compétences détectées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {standardization.skills_std.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Catégorie:</span>
                  <Badge className="ml-2">{standardization.category_std}</Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Sous-catégorie:</span>
                  <Badge variant="outline" className="ml-2">
                    {standardization.sub_category_std}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tags générés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {standardization.tags_std.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          {standardization.missing_info.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800">
                  Brief complet !
                </h3>
                <p className="text-gray-600">
                  Aucune information importante n'est manquante.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {standardization.missing_info.map((info, index) => (
                <Card key={index} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <h4 className="font-medium">{info.description}</h4>
                          <Badge className={getPriorityColor(info.priority)}>
                            {info.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{info.suggestion}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`missing-${info.type}`}>
                        Votre réponse:
                      </Label>
                      <Textarea
                        id={`missing-${info.type}`}
                        placeholder={`Complétez: ${info.description.toLowerCase()}`}
                        value={missingInfoResponses[info.type] || ''}
                        onChange={(e) => setMissingInfoResponses(prev => ({
                          ...prev,
                          [info.type]: e.target.value
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {Object.keys(missingInfoResponses).length > 0 && (
                <Button onClick={handleRecompute} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalculer avec les nouvelles informations
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Euro className="w-5 h-5" />
                  Recommandations de prix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum:</span>
                    <span className="font-semibold">{standardization.price_suggested_min}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recommandé:</span>
                    <span className="font-semibold text-green-600">
                      {standardization.price_suggested_med}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum:</span>
                    <span className="font-semibold">{standardization.price_suggested_max}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Clock className="w-5 h-5" />
                  Délai suggéré
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {standardization.delay_suggested_days}
                  </div>
                  <div className="text-sm text-gray-600">jours recommandés</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {standardization.loc_uplift_reco && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <TrendingUp className="w-5 h-5" />
                  Optimisation LOC (Probabilité de succès)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {standardization.loc_uplift_reco.current_loc}%
                    </div>
                    <div className="text-sm text-gray-500">LOC actuel</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      +{standardization.loc_uplift_reco.expected_loc_improvement}%
                    </div>
                    <div className="text-sm text-gray-500">Amélioration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {standardization.loc_uplift_reco.current_loc + standardization.loc_uplift_reco.expected_loc_improvement}%
                    </div>
                    <div className="text-sm text-gray-500">LOC optimisé</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-600">
                    💡 En ajustant votre budget à {standardization.loc_uplift_reco.recommended_budget}€ 
                    et votre délai à {standardization.loc_uplift_reco.recommended_delay} jours, 
                    vous augmentez significativement vos chances de succès.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de l'annonce standardisée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Titre standardisé:</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded">{standardization.title_std}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Résumé structuré:</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded">{standardization.summary_std}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Critères d'acceptation:</Label>
                <ul className="mt-1 space-y-1">
                  {standardization.acceptance_criteria.map((criterion, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
