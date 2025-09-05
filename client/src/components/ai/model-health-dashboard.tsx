/**
 * Dashboard de santé des modèles IA - Monitoring en temps réel
 * Affiche latence, erreurs, drift, uplift par expérience
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';

interface ModelMetrics {
  name: string;
  version: string;
  accuracy: number;
  latency_ms: number;
  error_rate: number;
  requests_24h: number;
  uptime: number;
  last_update: string;
  drift_score: number;
  confidence_avg: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface ExperimentResult {
  id: string;
  name: string;
  model_variant: string;
  conversion_lift: number;
  confidence_interval: [number, number];
  sample_size: number;
  significance: number;
  status: 'running' | 'completed' | 'failed';
  duration_days: number;
}

const ModelHealthDashboard = () => {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [experiments, setExperiments] = useState<ExperimentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30s
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

  // Métriques en temps réel simulées
  useEffect(() => {
    const loadModelMetrics = () => {
      const mockModels: ModelMetrics[] = [
        {
          name: 'Neural Pricing Engine',
          version: 'v2.1.0',
          accuracy: 91.2,
          latency_ms: 45,
          error_rate: 0.8,
          requests_24h: 2847,
          uptime: 99.7,
          last_update: new Date(Date.now() - 300000).toISOString(),
          drift_score: 0.12,
          confidence_avg: 85.4,
          status: 'healthy'
        },
        {
          name: 'Semantic Matching Engine',
          version: 'v3.2.1',
          accuracy: 92.1,
          latency_ms: 38,
          error_rate: 0.6,
          requests_24h: 4231,
          uptime: 99.9,
          last_update: new Date(Date.now() - 180000).toISOString(),
          drift_score: 0.08,
          confidence_avg: 88.7,
          status: 'healthy'
        },
        {
          name: 'Feed Ranker',
          version: 'v2.1.0',
          accuracy: 87.9,
          latency_ms: 22,
          error_rate: 1.2,
          requests_24h: 15632,
          uptime: 99.5,
          last_update: new Date(Date.now() - 120000).toISOString(),
          drift_score: 0.23,
          confidence_avg: 82.1,
          status: 'warning'
        },
        {
          name: 'Fraud Detection',
          version: 'v1.8.2',
          accuracy: 95.1,
          latency_ms: 28,
          error_rate: 0.3,
          requests_24h: 1456,
          uptime: 100.0,
          last_update: new Date(Date.now() - 90000).toISOString(),
          drift_score: 0.05,
          confidence_avg: 94.2,
          status: 'healthy'
        },
        {
          name: 'Predictive Analytics',
          version: 'v1.9.1',
          accuracy: 89.3,
          latency_ms: 52,
          error_rate: 1.8,
          requests_24h: 892,
          uptime: 98.2,
          last_update: new Date(Date.now() - 600000).toISOString(),
          drift_score: 0.31,
          confidence_avg: 79.8,
          status: 'critical'
        }
      ];

      const mockExperiments: ExperimentResult[] = [
        {
          id: 'exp-001',
          name: 'Pricing Algorithm V2.1 vs V2.0',
          model_variant: 'Neural Pricing V2.1',
          conversion_lift: 8.7,
          confidence_interval: [4.2, 13.1],
          sample_size: 2847,
          significance: 0.95,
          status: 'completed',
          duration_days: 14
        },
        {
          id: 'exp-002',
          name: 'Enhanced Semantic Matching',
          model_variant: 'Semantic V3.2.1',
          conversion_lift: 12.4,
          confidence_interval: [7.8, 16.9],
          sample_size: 1923,
          significance: 0.99,
          status: 'running',
          duration_days: 7
        },
        {
          id: 'exp-003',
          name: 'Feed Ranking Optimization',
          model_variant: 'FeedRanker V2.1',
          conversion_lift: -2.1,
          confidence_interval: [-5.7, 1.5],
          sample_size: 4521,
          significance: 0.68,
          status: 'failed',
          duration_days: 10
        }
      ];

      setModels(mockModels);
      setExperiments(mockExperiments);
      setLoading(false);

      // Calcul de la santé système
      const criticalModels = mockModels.filter(m => m.status === 'critical').length;
      const warningModels = mockModels.filter(m => m.status === 'warning').length;
      
      if (criticalModels > 0) setSystemHealth('critical');
      else if (warningModels > 1) setSystemHealth('degraded');
      else setSystemHealth('healthy');
    };

    loadModelMetrics();
    const interval = setInterval(loadModelMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="model-health-dashboard">
      {/* Header avec statut système */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="dashboard-title">Model Health Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitoring en temps réel des performances IA</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge 
            variant={systemHealth === 'healthy' ? 'default' : 'destructive'}
            data-testid="system-health-badge"
          >
            {systemHealth === 'healthy' && <CheckCircle className="h-4 w-4 mr-1" />}
            {systemHealth === 'degraded' && <AlertTriangle className="h-4 w-4 mr-1" />}
            {systemHealth === 'critical' && <AlertTriangle className="h-4 w-4 mr-1" />}
            Système {systemHealth === 'healthy' ? 'sain' : systemHealth === 'degraded' ? 'dégradé' : 'critique'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            data-testid="refresh-button"
          >
            <Activity className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes système */}
      {systemHealth !== 'healthy' && (
        <Alert data-testid="system-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {systemHealth === 'critical' 
              ? 'Attention: Certains modèles sont en état critique et nécessitent une intervention immédiate.'
              : 'Système dégradé: Surveillez les modèles en état d\'alerte.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models">Modèles IA</TabsTrigger>
          <TabsTrigger value="experiments">Expériences</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card key={model.name} data-testid={`model-card-${model.name.replace(/\\s+/g, '-').toLowerCase()}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <div className={`flex items-center gap-1 ${getStatusColor(model.status)}`}>
                      {getStatusIcon(model.status)}
                      <Badge variant="outline" className="text-xs">
                        {model.version}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Dernière mise à jour: {new Date(model.last_update).toLocaleTimeString('fr-FR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="h-3 w-3" />
                        <span className="text-gray-600">Précision</span>
                      </div>
                      <div className="font-semibold">{model.accuracy}%</div>
                      <Progress value={model.accuracy} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-gray-600">Latence</span>
                      </div>
                      <div className="font-semibold">{model.latency_ms}ms</div>
                      <Progress 
                        value={Math.max(0, 100 - model.latency_ms)} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Taux d'erreur</span>
                      <div className="font-semibold text-right">{model.error_rate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Uptime</span>
                      <div className="font-semibold text-right">{model.uptime}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Drift Score</span>
                      <div className={`font-semibold text-right ${
                        model.drift_score > 0.3 ? 'text-red-600' : 
                        model.drift_score > 0.2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {model.drift_score.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Confiance</span>
                      <div className="font-semibold text-right">{model.confidence_avg}%</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    {model.requests_24h.toLocaleString()} requêtes (24h)
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <div className="grid gap-4">
            {experiments.map((exp) => (
              <Card key={exp.id} data-testid={`experiment-card-${exp.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{exp.name}</CardTitle>
                    <Badge 
                      variant={
                        exp.status === 'completed' ? 'default' : 
                        exp.status === 'running' ? 'secondary' : 'destructive'
                      }
                    >
                      {exp.status === 'running' ? 'En cours' : 
                       exp.status === 'completed' ? 'Terminé' : 'Échoué'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Variant: {exp.model_variant} • Durée: {exp.duration_days} jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {exp.conversion_lift > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className={`text-2xl font-bold ${
                        exp.conversion_lift > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {exp.conversion_lift > 0 ? '+' : ''}{exp.conversion_lift}%
                      </div>
                      <div className="text-sm text-gray-600">Lift Conversion</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {exp.significance * 100}%
                      </div>
                      <div className="text-sm text-gray-600">Significativité</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {exp.sample_size.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Échantillon</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium">Intervalle 95%</div>
                      <div className="text-xs text-gray-600">
                        [{exp.confidence_interval[0]}%, {exp.confidence_interval[1]}%]
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="analytics-requests">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Requêtes IA (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {models.reduce((sum, model) => sum + model.requests_24h, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% vs hier
                </div>
              </CardContent>
            </Card>

            <Card data-testid="analytics-latency">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Latence Moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(models.reduce((sum, model) => sum + model.latency_ms, 0) / models.length)}ms
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -8ms vs hier
                </div>
              </CardContent>
            </Card>

            <Card data-testid="analytics-accuracy">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Précision Moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(models.reduce((sum, model) => sum + model.accuracy, 0) / models.length).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +0.3% vs hier
                </div>
              </CardContent>
            </Card>

            <Card data-testid="analytics-uptime">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(models.reduce((sum, model) => sum + model.uptime, 0) / models.length).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  SLA respecté
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelHealthDashboard;