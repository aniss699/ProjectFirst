
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Shield, Crown, Heart } from 'lucide-react';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const availableBadges: UserBadge[] = [
  {
    id: 'first_mission',
    name: 'Premier Pas',
    description: 'Première mission publiée',
    icon: Star,
    color: 'bg-blue-500',
    requirement: '1 mission publiée',
    rarity: 'common'
  },
  {
    id: 'speed_demon',
    name: 'Réponse Éclair',
    description: 'Répond en moins de 1h',
    icon: Zap,
    color: 'bg-yellow-500',
    requirement: 'Temps de réponse < 1h',
    rarity: 'rare'
  },
  {
    id: 'trusted_provider',
    name: 'Prestataire de Confiance',
    description: '98% de satisfaction client',
    icon: Shield,
    color: 'bg-green-500',
    requirement: '98% de satisfaction',
    rarity: 'epic'
  },
  {
    id: 'mission_master',
    name: 'Maître des Missions',
    description: '100 missions réussies',
    icon: Trophy,
    color: 'bg-purple-500',
    requirement: '100 missions réussies',
    rarity: 'legendary'
  },
  {
    id: 'vip_client',
    name: 'Client VIP',
    description: 'Plus de 10 000€ dépensés',
    icon: Crown,
    color: 'bg-amber-500',
    requirement: '10 000€+ dépensés',
    rarity: 'epic'
  },
  {
    id: 'community_favorite',
    name: 'Chouchou Communauté',
    description: '50+ recommandations',
    icon: Heart,
    color: 'bg-pink-500',
    requirement: '50+ recommandations',
    rarity: 'rare'
  }
];

interface BadgeDisplayProps {
  badges: string[];
  size?: 'sm' | 'md' | 'lg';
  showAll?: boolean;
}

export function BadgeDisplay({ badges, size = 'md', showAll = false }: BadgeDisplayProps) {
  const userBadges = availableBadges.filter(badge => badges.includes(badge.id));
  const displayBadges = showAll ? userBadges : userBadges.slice(0, 3);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex flex-wrap gap-1">
      {displayBadges.map(badge => {
        const IconComponent = badge.icon;
        return (
          <Badge
            key={badge.id}
            variant="outline"
            className={`${badge.color} text-white border-0 flex items-center gap-1`}
            title={`${badge.name}: ${badge.description}`}
          >
            <IconComponent className={sizeClasses[size]} />
            {size !== 'sm' && <span className="text-xs">{badge.name}</span>}
          </Badge>
        );
      })}
      {!showAll && userBadges.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{userBadges.length - 3}
        </Badge>
      )}
    </div>
  );
}
