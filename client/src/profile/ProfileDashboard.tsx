import React from 'react';
import { useLocation } from 'wouter';
import { 
  User, 
  Edit, 
  Eye, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Briefcase,
  Award,
  Clock,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from './useProfile';
import { getCompletenessLevel, getMissingElements } from '../../shared/utils/profileScore';

export function ProfileDashboard() {
  const [, setLocation] = useLocation();
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-4">{error || 'Impossible de charger le profil'}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completeness = profile.completeness || 0;
  const completenessInfo = getCompletenessLevel(completeness);
  const missingElements = getMissingElements(profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <div className="flex space-x-3">
              <Button
                onClick={() => setLocation('/profil/:userId')}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu public
              </Button>
              <Button
                onClick={() => setLocation('/profil/editer')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden shadow-xl">
          <div className={`h-32 ${profile.role === 'client' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}></div>
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="relative z-10">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {profile.displayName?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-3">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {profile.displayName || 'Nom non renseigné'}
                    </h2>
                    <Badge className={`${profile.role === 'client' ? 'bg-blue-500' : 'bg-green-500'} px-3 py-1`}>
                      {profile.role === 'client' ? (
                        <>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Client
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2" />
                          Prestataire
                        </>
                      )}
                    </Badge>
                  </div>

                  {profile.headline && (
                    <p className="text-xl text-gray-600 mb-4">{profile.headline}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    {profile.location?.city && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span>{profile.location.city}</span>
                      </div>
                    )}
                    {profile.languages?.length && (
                      <div className="flex items-center">
                        <span className="mr-2">🌍</span>
                        <span>{profile.languages.join(', ')}</span>
                      </div>
                    )}
                    {profile.role === 'provider' && profile.yearsExperience && (
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{profile.yearsExperience} ans d'expérience</span>
                      </div>
                    )}
                    {profile.rates?.min && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{profile.rates.min}-{profile.rates.max}€/{profile.rates.rateType === 'hourly' ? 'h' : 'projet'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completeness Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Score de complétude */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Complétude de votre profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{completeness}%</span>
                  <Badge 
                    className={`${
                      completenessInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                      completenessInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      completenessInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      completenessInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {completenessInfo.level}
                  </Badge>
                </div>

                <Progress 
                  value={completeness} 
                  className={`h-3 ${
                    completenessInfo.color === 'green' ? '[&>div]:bg-green-500' :
                    completenessInfo.color === 'blue' ? '[&>div]:bg-blue-500' :
                    completenessInfo.color === 'yellow' ? '[&>div]:bg-yellow-500' :
                    completenessInfo.color === 'orange' ? '[&>div]:bg-orange-500' :
                    '[&>div]:bg-red-500'
                  }`}
                />

                <p className="text-gray-600 text-sm">
                  {completenessInfo.description}
                </p>

                {completeness < 90 && (
                  <Button 
                    onClick={() => setLocation('/profil/editer')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Compléter mon profil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mots-clés</span>
                  <span className="font-semibold">{profile.keywords?.length || 0}</span>
                </div>

                {profile.role === 'provider' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Compétences</span>
                    <span className="font-semibold">{profile.skills?.length || 0}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Portfolio</span>
                  <span className="font-semibold">{profile.portfolio?.length || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Certifications</span>
                  <span className="font-semibold">{profile.certifications?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Missing Elements */}
        {missingElements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Éléments à compléter ({missingElements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {missingElements.slice(0, 6).map((element, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className={`p-1 rounded-full ${
                      element.priority === 'high' ? 'bg-red-100' :
                      element.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        element.priority === 'high' ? 'text-red-600' :
                        element.priority === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{element.label}</h4>
                      <p className="text-sm text-gray-600">+{element.points} points</p>
                    </div>
                  </div>
                ))}
              </div>

              {missingElements.length > 6 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/profil/editer')}
                  >
                    Voir tous les éléments manquants ({missingElements.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Preview Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Keywords & Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Mots-clés et Compétences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.keywords?.length ? (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      Mots-clés
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.keywords.slice(0, 8).map((keyword, index) => (
                        <Badge 
                          key={index} 
                          className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 font-medium"
                        >
                          {keyword}
                        </Badge>
                      ))}
                      {profile.keywords.length > 8 && (
                        <Badge 
                          variant="outline" 
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          +{profile.keywords.length - 8} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Aucun mot-clé défini</span>
                    </div>
                    <p className="text-xs mt-1">Ajoutez des mots-clés pour améliorer votre visibilité</p>
                  </div>
                )}

                {profile.role === 'provider' && profile.skills?.length ? (
                  <div>
                    <h4 className="font-medium mb-2">Compétences</h4>
                    <div className="space-y-2">
                      {profile.skills.slice(0, 5).map((skill, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{skill.name}</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < (skill.level || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : profile.role === 'provider' && (
                  <div className="text-gray-500 text-sm">Aucune compétence définie</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.portfolio?.length ? (
                <div className="space-y-3">
                  {profile.portfolio.slice(0, 3).map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.description?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                  {profile.portfolio.length > 3 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        Voir tout ({profile.portfolio.length})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Aucun projet en portfolio</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}