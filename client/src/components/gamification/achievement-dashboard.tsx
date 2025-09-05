
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, Zap, Crown, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: string;
  unlocked: boolean;
}

export function AchievementDashboard() {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Premier Projet',
      description: 'Créer votre première mission',
      progress: 1,
      maxProgress: 1,
      icon: <Trophy className="w-4 h-4" />,
      rarity: 'common',
      reward: '+50 XP',
      unlocked: true
    },
    {
      id: '2',
      title: 'Expert IA',
      description: 'Utiliser l\'IA pour optimiser 10 projets',
      progress: 7,
      maxProgress: 10,
      icon: <Zap className="w-4 h-4" />,
      rarity: 'rare',
      reward: 'Badge Expert IA',
      unlocked: false
    },
    {
      id: '3',
      title: 'Roi du Feedback',
      description: 'Recevoir 50 évaluations 5 étoiles',
      progress: 23,
      maxProgress: 50,
      icon: <Crown className="w-4 h-4" />,
      rarity: 'epic',
      reward: 'Profil Premium 1 mois',
      unlocked: false
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const userStats = {
    level: 12,
    xp: 2847,
    nextLevelXp: 3000,
    streak: 7,
    totalAchievements: 15,
    unlockedAchievements: 8
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold">Niv. {userStats.level}</div>
            <div className="text-sm text-gray-600">Niveau</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{userStats.streak}</div>
            <div className="text-sm text-gray-600">Jours consécutifs</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{userStats.unlockedAchievements}/{userStats.totalAchievements}</div>
            <div className="text-sm text-gray-600">Succès</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">{userStats.xp}</div>
            <div className="text-sm text-gray-600">XP Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression vers le niveau {userStats.level + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{userStats.xp} XP</span>
              <span>{userStats.nextLevelXp} XP</span>
            </div>
            <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} />
            <p className="text-sm text-gray-600">
              Plus que {userStats.nextLevelXp - userStats.xp} XP pour passer au niveau suivant !
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Succès récents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {achievement.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-sm font-medium text-blue-600">{achievement.reward}</p>
                  </div>
                </div>
              </div>
              
              {!achievement.unlocked && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
