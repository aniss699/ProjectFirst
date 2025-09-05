
import React from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Globe, 
  Star, 
  Clock, 
  Award, 
  ExternalLink,
  Shield,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePublicProfile } from './useProfile';

export function ProfilePublicView() {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading, error } = usePublicProfile(userId || '');

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
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profil non accessible</h2>
            <p className="text-gray-600">{error || 'Ce profil n\'existe pas ou est privé'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAnonymized = profile.preferences?.visibility === 'anonymized';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden shadow-xl">
          <div className={`h-32 ${profile.role === 'client' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}></div>
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="relative z-10">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={!isAnonymized ? profile.avatarUrl : undefined} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {profile.displayName?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                {profile.preferences?.visibility === 'public' && (
                  <Badge className="absolute -bottom-2 -right-2 bg-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.displayName}
                    </h1>
                    <Badge className={`${profile.role === 'client' ? 'bg-blue-500' : 'bg-green-500'} px-3 py-1`}>
                      {profile.role === 'client' ? 'Client' : 'Prestataire'}
                    </Badge>
                  </div>
                  
                  {profile.headline && (
                    <p className="text-xl text-gray-600 mb-4">{profile.headline}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    {!isAnonymized && profile.location?.city && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span>{profile.location.city}, {profile.location.country}</span>
                      </div>
                    )}
                    {profile.languages?.length && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{profile.languages.join(', ')}</span>
                      </div>
                    )}
                    {profile.role === 'provider' && profile.yearsExperience && (
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{profile.yearsExperience} ans d'expérience</span>
                      </div>
                    )}
                    {profile.rates?.min && !isAnonymized && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{profile.rates.min}-{profile.rates.max}€/{profile.rates.rateType === 'hourly' ? 'h' : 'projet'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  {profile.role === 'provider' && (
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Voir disponibilités
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Keywords */}
            {profile.keywords?.length && (
              <Card>
                <CardHeader>
                  <CardTitle>Domaines d'expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills (for providers) */}
            {profile.role === 'provider' && profile.skills?.length && (
              <Card>
                <CardHeader>
                  <CardTitle>Compétences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{skill.name}</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < (skill.level || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {profile.portfolio?.length && !isAnonymized && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.portfolio.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          >
                            Voir le projet
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            {profile.availability && (
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.availability.modes?.length && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Modes de travail</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.availability.modes.map((mode, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {mode === 'remote' ? 'À distance' : 'Sur site'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {profile.availability.hoursPerWeek && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Heures par semaine</p>
                        <p className="text-lg font-semibold">{profile.availability.hoursPerWeek}h</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {profile.certifications?.length && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                        <h4 className="font-medium text-sm">{cert.name}</h4>
                        {cert.issuer && (
                          <p className="text-xs text-gray-600">{cert.issuer}</p>
                        )}
                        {cert.year && (
                          <p className="text-xs text-gray-500">{cert.year}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Industries */}
            {profile.industries?.length && (
              <Card>
                <CardHeader>
                  <CardTitle>Secteurs d'activité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.industries.map((industry, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact CTA */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Intéressé par ce profil ?
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Contactez {profile.displayName?.split(' ')[0] || 'ce prestataire'} directement
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Envoyer un message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
