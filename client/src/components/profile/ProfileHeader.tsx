import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Camera,
  Clock
} from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  hourlyRate: string;
  industry?: string;
}

interface ProfileHeaderProps {
  profileData: ProfileData;
  activeProfile: 'client' | 'provider';
  isEditing: boolean;
}

export function ProfileHeader({ profileData, activeProfile, isEditing }: ProfileHeaderProps) {
  return (
    <Card className="mb-8 overflow-hidden shadow-xl" data-testid="profile-header">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
      <CardContent className="p-6 -mt-16 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative z-10">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl" data-testid="profile-avatar">
              <AvatarImage src="" />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-lg" data-testid="button-edit-avatar">
                <Camera className="w-5 h-5" />
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-3">
                <h2 className="text-3xl font-bold text-gray-900" data-testid="text-username">{profileData.name}</h2>
                <Badge className={`${activeProfile === 'client' ? 'bg-blue-500' : 'bg-green-500'} px-3 py-1`} data-testid="badge-user-type">
                  {activeProfile === 'client' ? (
                    <>
                      <Briefcase className="w-4 h-4 mr-2" />
                      Client Premium
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Prestataire Certifié
                    </>
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center" data-testid="contact-email">
                  <Mail className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                <div className="flex items-center" data-testid="contact-location">
                  <MapPin className="w-4 h-4 mr-2 text-green-500" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center" data-testid="contact-phone">
                  <Phone className="w-4 h-4 mr-2 text-purple-500" />
                  <span>{profileData.phone}</span>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {activeProfile === 'provider' ? (
                <>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200" data-testid="stat-rating">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-2xl font-bold text-gray-900">4.9</span>
                    </div>
                    <p className="text-sm text-gray-600">127 avis clients</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200" data-testid="stat-projects">
                    <div className="flex items-center space-x-2 mb-1">
                      <Briefcase className="w-5 h-5 text-green-500" />
                      <span className="text-2xl font-bold text-gray-900">89</span>
                    </div>
                    <p className="text-sm text-gray-600">Projets réalisés</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200" data-testid="stat-satisfaction">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-2xl font-bold text-gray-900">98%</span>
                    </div>
                    <p className="text-sm text-gray-600">Taux de satisfaction</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200" data-testid="stat-rate">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <span className="text-2xl font-bold text-gray-900">{profileData.hourlyRate}€</span>
                    </div>
                    <p className="text-sm text-gray-600">Tarif horaire</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200" data-testid="stat-published-projects">
                    <div className="flex items-center space-x-2 mb-1">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      <span className="text-2xl font-bold text-gray-900">23</span>
                    </div>
                    <p className="text-sm text-gray-600">Projets publiés</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200" data-testid="stat-applications">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-5 h-5 text-green-500" />
                      <span className="text-2xl font-bold text-gray-900">156</span>
                    </div>
                    <p className="text-sm text-gray-600">Candidatures reçues</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200" data-testid="stat-avg-rating">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="w-5 h-5 text-purple-500" />
                      <span className="text-2xl font-bold text-gray-900">4.8</span>
                    </div>
                    <p className="text-sm text-gray-600">Note moyenne</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200" data-testid="stat-industry">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="text-2xl font-bold text-gray-900">{profileData.industry?.split(' ')[0] || 'Tech'}</span>
                    </div>
                    <p className="text-sm text-gray-600">Secteur d'activité</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}