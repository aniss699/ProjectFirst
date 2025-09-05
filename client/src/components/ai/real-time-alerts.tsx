
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X,
  Bell,
  Clock,
  Activity,
  Zap
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'performance' | 'business' | 'quality' | 'security';
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  affected_service: string;
  auto_resolve: boolean;
  resolved?: boolean;
}

export default function RealTimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Refresh toutes les 15s
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/ai/monitoring/alerts');
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
        setUnreadCount(data.alerts.filter((a: Alert) => !a.resolved).length);
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'default';
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/ai/monitoring/alerts/${alertId}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Erreur résolution alerte:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return !alert.resolved;
    return alert.level === filter && !alert.resolved;
  });

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Bouton notification */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative mb-2 bg-white shadow-lg border-gray-200"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panel d'alertes */}
      {isExpanded && (
        <Card className="w-96 max-h-96 overflow-hidden shadow-xl border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Alertes Système
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Filtres */}
            <div className="flex gap-2 mt-3">
              {['all', 'critical', 'warning', 'info'].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f as any)}
                  className="text-xs"
                >
                  {f === 'all' ? 'Toutes' : f}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-64 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border-l-4 hover:bg-gray-50 transition-colors ${
                      alert.level === 'critical' ? 'border-l-red-500 bg-red-50' :
                      alert.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getAlertIcon(alert.level)}
                          <span className="font-medium text-sm">{alert.title}</span>
                          <Badge variant={getAlertBadgeVariant(alert.level) as any} className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(alert.timestamp)}
                            <span>• {alert.affected_service}</span>
                          </div>
                          
                          {!alert.auto_resolve && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              className="text-xs h-6 px-2"
                            >
                              Résoudre
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
