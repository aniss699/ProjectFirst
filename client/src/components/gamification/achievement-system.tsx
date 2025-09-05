
import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Crown, Medal, Award, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'performance' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    type: 'badge' | 'discount' | 'feature' | 'boost';
    value: string;
  };
}

interface UserLevel {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  title: string;
  perks: string[];
}

export function AchievementSystem({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);

  useEffect(() => {
    // Simuler le chargement des achievements
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'Premier Pas',
        description: 'Complétez votre première mission',
        icon: 'star',
        category: 'milestone',
        rarity: 'common',
        points: 100,
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        unlockedAt: new Date(),
        reward: {
          type: 'badge',
          value: 'Badge Débutant'
        }
      },
      {
        id: '2',
        title: 'Maître Artisan',
        description: 'Obtenez une note moyenne de 4.8+',
        icon: 'crown',
        category: 'performance',
        rarity: 'epic',
        points: 500,
        progress: 4.8,
        maxProgress: 5,
        unlocked: true,
        unlockedAt: new Date(Date.now() - 86400000),
        reward: {
          type: 'boost',
          value: 'Visibilité +20% pendant 7 jours'
        }
      },
      {
        id: '3',
        title: 'Machine à Cash',
        description: 'Générez 10,000€ de revenus',
        icon: 'trophy',
        category: 'milestone',
        rarity: 'legendary',
        points: 1000,
        progress: 7500,
        maxProgress: 10000,
        unlocked: false
      },
      {
        id: '4',
        title: 'Réseau Social',
        description: 'Ajoutez 50 connexions',
        icon: 'zap',
        category: 'social',
        rarity: 'rare',
        points: 300,
        progress: 32,
        maxProgress: 50,
        unlocked: false
      }
    ];

    const mockLevel: UserLevel = {
      level: 8,
      currentXP: 2340,
      nextLevelXP: 3000,
      title: 'Expert Certifié',
      perks: [
        'Visibilité premium dans les résultats',
        'Badge de confiance affiché',
        'Support prioritaire',
        'Statistiques avancées'
      ]
    };

    setAchievements(mockAchievements);
    setUserLevel(mockLevel);
    setRecentUnlocks(mockAchievements.filter(a => a.unlocked && a.unlockedAt));
  }, [userId]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'common': return 'bg-gray-500';
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      star: Star,
      trophy: Trophy,
      crown: Crown,
      zap: Zap,
      target: Target,
      medal: Medal,
      award: Award,
      gift: Gift
    };
    return icons[iconName] || Star;
  };

  if (!userLevel) return null;

  return (
    <div className="space-y-6">
      {/* Niveau utilisateur */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Niveau {userLevel.level} - {userLevel.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {userLevel.currentXP} / {userLevel.nextLevelXP} XP
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Niveau {userLevel.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(userLevel.currentXP / userLevel.nextLevelXP) * 100} 
            className="mb-4" 
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Avantages actuels:</h4>
              <ul className="text-sm space-y-1">
                {userLevel.perks.map((perk, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userLevel.nextLevelXP - userLevel.currentXP}
              </div>
              <div className="text-sm text-gray-500">XP pour niveau suivant</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements récents */}
      {recentUnlocks.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Trophy className="h-5 w-5" />
              Succès récents débloqués!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUnlocks.map((achievement) => {
                const IconComponent = getIcon(achievement.icon);
                return (
                  <div key={achievement.id} className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                    <Badge variant="secondary">+{achievement.points} XP</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les succès</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const IconComponent = getIcon(achievement.icon);
              const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-full ${
                      achievement.unlocked 
                        ? getRarityColor(achievement.rarity)
                        : 'bg-gray-400'
                    }`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            achievement.rarity === 'legendary' ? 'border-yellow-500 text-yellow-700' :
                            achievement.rarity === 'epic' ? 'border-purple-500 text-purple-700' :
                            achievement.rarity === 'rare' ? 'border-blue-500 text-blue-700' :
                            'border-gray-500 text-gray-700'
                          }`}
                        >
                          {achievement.rarity}
                        </Badge>
                        {achievement.unlocked && (
                          <Badge variant="secondary">+{achievement.points} XP</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span>{achievement.progress} / {achievement.maxProgress}</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}

                      {achievement.reward && achievement.unlocked && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <span className="font-medium">Récompense: </span>
                          {achievement.reward.value}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
