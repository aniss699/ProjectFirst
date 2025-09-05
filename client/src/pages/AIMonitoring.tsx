/**
 * Tableau de bord de monitoring IA - AppelsPro
 * Interface pour surveiller les performances des algorithmes IA
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Brain, Zap, Shield, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AIEngineMetrics {
  engine_name: string;
  total_requests: number;
  avg_response_time_ms: number;
  success_rate: number;
  accuracy_score: number;
  cache_hit_rate: number;
  memory_usage_mb: number;
  last_update: string;
  status: 'healthy' | 'degraded' | 'critical';
}

interface SystemMetrics {
  total_ai_requests: number;
  avg_system_latency: number;
  error_rate: number;
  cache_efficiency: number;
  ml_service_status: boolean;
  uptime_hours: number;
}

interface MonitoringData {
  engines: AIEngineMetrics[];
  system: SystemMetrics;
  alerts: string[];
}

const engineIcons: Record<string, React.ReactNode> = {
  'neural-pricing': <Brain className="h-4 w-4" />,
  'semantic-matching': <Zap className="h-4 w-4" />,
  'predictive-analytics': <TrendingUp className="h-4 w-4" />,
  'fraud-detection': <Shield className="h-4 w-4" />,
  'trust-scoring': <CheckCircle className="h-4 w-4" />
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'bg-green-500';
    case 'degraded': return 'bg-yellow-500';
    case 'critical': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
    default: return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

export default function AIMonitoring() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/ai/metrics');
      if (response.ok) {
        const metrics = await response.json();
        setData(metrics);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizePerformance = async () => {
    try {
      const response = await fetch('/api/ai/optimize', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        console.log('Optimisations appliquées:', result);
        fetchMetrics(); // Actualiser après optimisation
      }
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Actualisation toutes les 5s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Impossible de charger les métriques IA</p>
        <Button onClick={fetchMetrics} className="mt-4">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="ai-monitoring-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoring IA</h1>
          <p className="text-gray-600">Surveillance des performances des algorithmes AppelsPro</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="button-toggle-refresh"
          >
            {autoRefresh ? 'Auto' : 'Manuel'}
          </Button>
          <Button onClick={optimizePerformance} data-testid="button-optimize">
            Optimiser
          </Button>
          <Button onClick={fetchMetrics} variant="outline" data-testid="button-refresh">
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes système */}
      {data.alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes Système ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert, index) => (
                <div key={index} className="text-red-700 text-sm" data-testid={`alert-${index}`}>
                  • {alert}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques système globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requêtes Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-requests">
              {data.system.total_ai_requests.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latence Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-latency">
              {data.system.avg_system_latency.toFixed(1)}ms
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Efficacité Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cache-efficiency">
              {data.system.cache_efficiency.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Service ML</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {data.system.ml_service_status ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold" data-testid="text-ml-status">
                {data.system.ml_service_status ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détail des moteurs IA */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="engines">Moteurs IA</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.engines.map((engine) => (
              <Card key={engine.engine_name} data-testid={`card-engine-${engine.engine_name}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {engineIcons[engine.engine_name] || <Activity className="h-4 w-4" />}
                      <CardTitle className="text-sm">
                        {engine.engine_name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                    </div>
                    {getStatusIcon(engine.status)}
                  </div>
                  <div className={`h-2 rounded-full ${getStatusColor(engine.status)}`} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Requêtes</div>
                      <div className="font-semibold" data-testid={`text-requests-${engine.engine_name}`}>
                        {engine.total_requests.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Latence</div>
                      <div className="font-semibold" data-testid={`text-latency-${engine.engine_name}`}>
                        {engine.avg_response_time_ms.toFixed(1)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Précision</div>
                      <div className="font-semibold" data-testid={`text-accuracy-${engine.engine_name}`}>
                        {engine.accuracy_score.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Cache</div>
                      <div className="font-semibold" data-testid={`text-cache-${engine.engine_name}`}>
                        {engine.cache_hit_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Taux de succès</span>
                      <span>{engine.success_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={engine.success_rate} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="engines" className="space-y-4">
          <div className="space-y-4">
            {data.engines.map((engine) => (
              <Card key={engine.engine_name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {engineIcons[engine.engine_name]}
                      <div>
                        <CardTitle>{engine.engine_name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                        <CardDescription>
                          Dernière mise à jour: {new Date(engine.last_update).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={engine.status === 'healthy' ? 'default' : 'destructive'}>
                      {engine.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {engine.total_requests.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Requêtes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {engine.avg_response_time_ms.toFixed(1)}ms
                      </div>
                      <div className="text-xs text-gray-500">Temps de réponse</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {engine.accuracy_score.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Précision</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {engine.cache_hit_rate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Cache</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de succès</span>
                      <span className="font-semibold">{engine.success_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={engine.success_rate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Système</CardTitle>
                <CardDescription>Métriques globales de performance IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Latence moyenne système</span>
                    <span className="font-semibold">{data.system.avg_system_latency.toFixed(1)}ms</span>
                  </div>
                  <Progress value={Math.max(0, 100 - data.system.avg_system_latency)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficacité cache global</span>
                    <span className="font-semibold">{data.system.cache_efficiency.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.system.cache_efficiency} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux d'erreur</span>
                    <span className="font-semibold text-red-600">{data.system.error_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - data.system.error_rate)} className="h-2" />
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    Uptime: {data.system.uptime_hours.toFixed(1)} heures
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimisations Recommandées</CardTitle>
                <CardDescription>Actions pour améliorer les performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.engines
                    .filter(engine => 
                      engine.cache_hit_rate < 60 || 
                      engine.avg_response_time_ms > 100 ||
                      engine.accuracy_score < 85
                    )
                    .map((engine) => (
                      <div key={engine.engine_name} className="p-3 border rounded-lg">
                        <div className="font-semibold text-sm mb-1">
                          {engine.engine_name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {engine.cache_hit_rate < 60 && (
                            <div>• Améliorer la stratégie de cache ({engine.cache_hit_rate.toFixed(1)}%)</div>
                          )}
                          {engine.avg_response_time_ms > 100 && (
                            <div>• Optimiser la latence ({engine.avg_response_time_ms.toFixed(1)}ms)</div>
                          )}
                          {engine.accuracy_score < 85 && (
                            <div>• Recalibrer le modèle ({engine.accuracy_score.toFixed(1)}%)</div>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {data.engines.every(engine => 
                    engine.cache_hit_rate >= 60 && 
                    engine.avg_response_time_ms <= 100 &&
                    engine.accuracy_score >= 85
                  ) && (
                    <div className="text-center py-4 text-green-600">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Toutes les performances sont optimales</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}