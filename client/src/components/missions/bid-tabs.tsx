import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Users, 
  UsersRound, 
  Award, 
  Zap, 
  MessageCircle,
  Star,
  Calendar,
  Euro,
  PlusCircle,
  UserPlus
} from 'lucide-react';
import { BidForm } from './bid-form';
import { TeamBidForm } from './team-bid-form';
import { OpenTeamBidForm } from './open-team-bid-form';
import SmartBidAnalyzer from '@/components/ai/smart-bid-analyzer';

interface BidTabsProps {
  mission: any;
  user: any;
  sortedBids: any[];
  showAIAnalyzer: boolean;
  setShowAIAnalyzer: (show: boolean) => void;
  showBidForm: boolean;
  setShowBidForm: (show: boolean) => void;
}

export function BidTabs({ 
  mission, 
  user, 
  sortedBids, 
  showAIAnalyzer, 
  setShowAIAnalyzer, 
  showBidForm, 
  setShowBidForm 
}: BidTabsProps) {
  const [activeBidTab, setActiveBidTab] = useState<'individual' | 'team' | 'open_team'>('individual');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showOpenTeamForm, setShowOpenTeamForm] = useState(false);

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 md:p-6 border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm md:text-base">Candidater à cette mission</h4>
          <p className="text-xs md:text-sm text-gray-600">Choisissez votre mode de candidature</p>
        </div>
      </div>

      {/* Onglets de candidature */}
      <Tabs value={activeBidTab} onValueChange={(value: any) => setActiveBidTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger 
            value="individual" 
            className="text-xs md:text-sm data-[testid=tab-individual]"
            data-testid="tab-individual"
          >
            <User className="w-4 h-4 mr-1" />
            Solo
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            className="text-xs md:text-sm"
            data-testid="tab-team"
          >
            <Users className="w-4 h-4 mr-1" />
            Équipe
          </TabsTrigger>
          <TabsTrigger 
            value="open_team" 
            className="text-xs md:text-sm"
            data-testid="tab-open-team"
          >
            <UsersRound className="w-4 h-4 mr-1" />
            Équipe Ouverte
          </TabsTrigger>
        </TabsList>

        {/* Candidature Solo */}
        <TabsContent value="individual" className="space-y-4 mt-0">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Candidature individuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Candidatez seul à cette mission avec votre expertise.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setShowAIAnalyzer(!showAIAnalyzer)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
                  size="default"
                  data-testid="button-ai-analyzer"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyser avec l'IA
                </Button>

                <Button
                  onClick={() => setShowBidForm(!showBidForm)}
                  className="w-full bg-green-600 hover:bg-green-700 text-sm"
                  size="default"
                  data-testid="button-submit-individual"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {showBidForm ? 'Masquer le formulaire' : 'Soumettre une offre'}
                </Button>
              </div>

              {/* AI Analyzer */}
              {showAIAnalyzer && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <SmartBidAnalyzer
                    missionTitle={mission.title}
                    missionDescription={mission.description}
                    missionBudget={parseFloat(mission.budget || '0')}
                    missionCategory={mission.category}
                    currentBid={{ price: 0, timeline: '', proposal: '' }}
                    providerProfile={{
                      rating: 4.5,
                      completedProjects: 25,
                      skills: ['React', 'Node.js', 'TypeScript'],
                      portfolio: []
                    }}
                    competitorBids={sortedBids}
                    onOptimizedBidGenerated={(optimizedBid) => {
                      setShowBidForm(true);
                    }}
                  />
                </div>
              )}

              {/* Individual Bid Form */}
              {showBidForm && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <BidForm
                    missionId={mission.id}
                    onSuccess={() => {
                      setShowBidForm(false);
                      setShowAIAnalyzer(false);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidature Équipe */}
        <TabsContent value="team" className="space-y-4 mt-0">
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Candidature d'équipe
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Candidatez avec une équipe pré-constituée que vous dirigez.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Vous êtes le chef d'équipe</span>
                </div>
                
                <Button
                  onClick={() => setShowTeamForm(!showTeamForm)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
                  size="default"
                  data-testid="button-submit-team"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {showTeamForm ? 'Masquer le formulaire' : 'Candidater en équipe'}
                </Button>
              </div>

              {/* Team Bid Form */}
              {showTeamForm && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <TeamBidForm
                    missionId={mission.id}
                    onSuccess={() => {
                      setShowTeamForm(false);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Équipe Ouverte */}
        <TabsContent value="open_team" className="space-y-4 mt-0">
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UsersRound className="w-4 h-4" />
                Équipe ouverte
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Créez une équipe ouverte où d'autres prestataires peuvent vous rejoindre.
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <UserPlus className="w-3 h-3 text-orange-600" />
                    <span>Recrutement ouvert</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <PlusCircle className="w-3 h-3 text-orange-600" />
                    <span>Collaboration</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowOpenTeamForm(!showOpenTeamForm)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-sm"
                  size="default"
                  data-testid="button-submit-open-team"
                >
                  <UsersRound className="w-4 h-4 mr-2" />
                  {showOpenTeamForm ? 'Masquer le formulaire' : 'Créer une équipe ouverte'}
                </Button>
              </div>

              {/* Open Team Form */}
              {showOpenTeamForm && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <OpenTeamBidForm
                    missionId={mission.id}
                    onSuccess={() => {
                      setShowOpenTeamForm(false);
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}