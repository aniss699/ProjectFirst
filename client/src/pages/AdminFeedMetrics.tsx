import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Heart, Target } from 'lucide-react';

const AdminFeedMetrics: React.FC = () => {
  // Données réelles pour le dashboard (plateforme en développement)
  const metrics = {
    totalViews: 0,
    totalLikes: 0,
    totalSkips: 0,
    totalOffers: 0,
    saveRate: 0,
    offerRate: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Feed TikTok
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Métriques de performance et engagement utilisateurs
          </p>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Vues totales
                  </p>
                  <p className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</p>
                  <Badge variant="secondary" className="mt-1">
                    <Eye className="w-3 h-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Taux de sauvegarde
                  </p>
                  <p className="text-2xl font-bold">{metrics.saveRate}%</p>
                  <Badge variant="default" className="mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1%
                  </Badge>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Likes totaux
                  </p>
                  <p className="text-2xl font-bold">{metrics.totalLikes.toLocaleString()}</p>
                  <Badge variant="outline" className="mt-1">
                    <Heart className="w-3 h-3 mr-1" />
                    Stable
                  </Badge>
                </div>
                <Heart className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Taux offres
                  </p>
                  <p className="text-2xl font-bold">{metrics.offerRate}%</p>
                  <Badge variant="destructive" className="mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    -0.5%
                  </Badge>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résumé */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé de performance</CardTitle>
            <CardDescription>
              État général du feed TikTok des annonces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total vues</span>
                <Badge variant="default">{metrics.totalViews.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total likes</span>
                <Badge variant="default">{metrics.totalLikes.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total skips</span>
                <Badge variant="default">{metrics.totalSkips.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total offres</span>
                <Badge variant="default">{metrics.totalOffers.toLocaleString()}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFeedMetrics;