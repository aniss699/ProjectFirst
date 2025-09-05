
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  Lock, 
  Zap,
  Award,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

interface TrustScore {
  overall: number;
  reputation: number;
  verification: number;
  performance: number;
  reliability: number;
}

interface TrustBadge {
  id: string;
  label: string;
  description: string;
  confidence: number;
  isVerified: boolean;
  blockchainHash?: string;
  earnedAt: string;
}

interface ReputationEntry {
  id: string;
  action: string;
  impact: number;
  timestamp: string;
  verified: boolean;
  source: string;
}

interface TrustLayerProps {
  userId: string;
  userType: 'client' | 'provider';
  showDetailed?: boolean;
}

export default function TrustLayerBlockchain({ 
  userId, 
  userType, 
  showDetailed = false 
}: TrustLayerProps) {
  const [trustScore, setTrustScore] = useState<TrustScore>({
    overall: 0,
    reputation: 0,
    verification: 0,
    performance: 0,
    reliability: 0
  });
  
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);
  const [reputationHistory, setReputationHistory] = useState<ReputationEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected');

  useEffect(() => {
    loadTrustData();
    simulateBlockchainSync();
  }, [userId]);

  const loadTrustData = async () => {
    // Simulation de données de confiance
    const mockTrustScore: TrustScore = {
      overall: 87,
      reputation: 92,
      verification: 85,
      performance: 89,
      reliability: 84
    };

    const mockBadges: TrustBadge[] = [
      {
        id: 'verified_identity',
        label: 'Identité Vérifiée',
        description: 'KYC complet validé par blockchain',
        confidence: 100,
        isVerified: true,
        blockchainHash: '0x7f9a2b...',
        earnedAt: '2024-01-15'
      },
      {
        id: 'reliable_delivery',
        label: 'Livraison Fiable',
        description: '95% de projets livrés à temps',
        confidence: 95,
        isVerified: true,
        blockchainHash: '0x3c8d1a...',
        earnedAt: '2024-01-20'
      },
      {
        id: 'quality_expert',
        label: 'Expert Qualité',
        description: 'Note moyenne 4.8/5 sur 50+ projets',
        confidence: 92,
        isVerified: true,
        blockchainHash: '0x9e4f2c...',
        earnedAt: '2024-01-25'
      },
      {
        id: 'community_trust',
        label: 'Confiance Communauté',
        description: 'Recommandé par 89% des clients',
        confidence: 89,
        isVerified: true,
        blockchainHash: '0x1b7e5d...',
        earnedAt: '2024-02-01'
      }
    ];

    const mockHistory: ReputationEntry[] = [
      {
        id: '1',
        action: 'Projet livré avec excellence',
        impact: +5,
        timestamp: '2024-01-30T10:00:00Z',
        verified: true,
        source: 'Client ABC Corp'
      },
      {
        id: '2',
        action: 'Communication proactive remarquée',
        impact: +3,
        timestamp: '2024-01-28T14:30:00Z',
        verified: true,
        source: 'Système automatique'
      },
      {
        id: '3',
        action: 'Délai respecté malgré complexité',
        impact: +4,
        timestamp: '2024-01-25T09:15:00Z',
        verified: true,
        source: 'Client StartupXYZ'
      },
      {
        id: '4',
        action: 'Innovation technique appréciée',
        impact: +6,
        timestamp: '2024-01-20T16:45:00Z',
        verified: true,
        source: 'Peer review'
      }
    ];

    setTrustScore(mockTrustScore);
    setTrustBadges(mockBadges);
    setReputationHistory(mockHistory);
  };

  const simulateBlockchainSync = () => {
    setBlockchainStatus('syncing');
    setTimeout(() => {
      setBlockchainStatus('connected');
    }, 2000);
  };

  const verifyOnBlockchain = async (badgeId: string) => {
    setIsVerifying(true);
    
    try {
      // Étape 1: Validation des critères
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`🔍 Validation des critères pour ${badgeId}...`);

      // Étape 2: Génération de la preuve cryptographique
      await new Promise(resolve => setTimeout(resolve, 1500));
      const proof = await generateCryptographicProof(badgeId, userId);
      console.log(`🔐 Preuve générée: ${proof.slice(0, 20)}...`);

      // Étape 3: Enregistrement sur blockchain
      await new Promise(resolve => setTimeout(resolve, 1000));
      const blockchainHash = await registerOnBlockchain(proof, badgeId);
      console.log(`⛓️ Enregistré sur blockchain: ${blockchainHash}`);

      // Étape 4: Mise à jour du badge
      setTrustBadges(prev => prev.map(badge => 
        badge.id === badgeId 
          ? { 
              ...badge, 
              isVerified: true, 
              blockchainHash,
              confidence: Math.min(100, badge.confidence + 5) // Boost de confiance
            }
          : badge
      ));

      // Étape 5: Mise à jour du Trust Score global
      setTrustScore(prev => ({
        ...prev,
        overall: Math.min(100, prev.overall + 2),
        verification: Math.min(100, prev.verification + 3)
      }));

      console.log(`✅ Badge ${badgeId} certifié avec succès`);
      
    } catch (error) {
      console.error('❌ Erreur de certification blockchain:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Génération de preuve cryptographique
  const generateCryptographicProof = async (badgeId: string, userId: string): Promise<string> => {
    const timestamp = Date.now();
    const data = `${userId}-${badgeId}-${timestamp}`;
    
    // Simulation d'un hash cryptographique (en production: utiliser Web3/crypto)
    const hash = btoa(data).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    return `0x${hash.toLowerCase()}`;
  };

  // Enregistrement sur blockchain
  const registerOnBlockchain = async (proof: string, badgeId: string): Promise<string> => {
    // Simulation d'interaction blockchain
    const blockNumber = Math.floor(Math.random() * 1000000) + 15000000;
    const txHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
    
    // En production: interaction avec smart contract
    return `${txHash}...`;
  };

  const getTrustColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBadgeIcon = (badgeId: string) => {
    const icons = {
      verified_identity: <Shield className="w-4 h-4" />,
      reliable_delivery: <Clock className="w-4 h-4" />,
      quality_expert: <Star className="w-4 h-4" />,
      community_trust: <Users className="w-4 h-4" />
    };
    return icons[badgeId] || <Award className="w-4 h-4" />;
  };

  const getBlockchainStatusColor = () => {
    switch (blockchainStatus) {
      case 'connected': return 'text-green-600';
      case 'syncing': return 'text-orange-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trust Score Global */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Trust Score Global
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Blockchain Verified
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                blockchainStatus === 'connected' ? 'bg-green-500' : 
                blockchainStatus === 'syncing' ? 'bg-orange-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm ${getBlockchainStatusColor()}`}>
                {blockchainStatus === 'connected' ? 'Synchronisé' : 
                 blockchainStatus === 'syncing' ? 'Synchronisation...' : 'Déconnecté'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getTrustColor(trustScore.overall)}`}>
                {trustScore.overall}
              </div>
              <div className="text-sm text-gray-600">Global</div>
              <Progress value={trustScore.overall} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrustColor(trustScore.reputation)}`}>
                {trustScore.reputation}
              </div>
              <div className="text-sm text-gray-600">Réputation</div>
              <Progress value={trustScore.reputation} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrustColor(trustScore.verification)}`}>
                {trustScore.verification}
              </div>
              <div className="text-sm text-gray-600">Vérification</div>
              <Progress value={trustScore.verification} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrustColor(trustScore.performance)}`}>
                {trustScore.performance}
              </div>
              <div className="text-sm text-gray-600">Performance</div>
              <Progress value={trustScore.performance} className="h-2 mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getTrustColor(trustScore.reliability)}`}>
                {trustScore.reliability}
              </div>
              <div className="text-sm text-gray-600">Fiabilité</div>
              <Progress value={trustScore.reliability} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges de Confiance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Badges de Confiance Certifiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getBadgeIcon(badge.id)}
                    <h4 className="font-medium">{badge.label}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {badge.isVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <Badge variant={badge.isVerified ? "default" : "secondary"}>
                      {badge.confidence}%
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Obtenu le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                  </div>
                  
                  {badge.blockchainHash ? (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Lock className="w-3 h-3" />
                      {badge.blockchainHash}
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => verifyOnBlockchain(badge.id)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? 'Vérification...' : 'Certifier'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique de Réputation */}
      {showDetailed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Historique de Réputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reputationHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      entry.impact > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-sm text-gray-500">
                        Par {entry.source} • {new Date(entry.timestamp).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.impact > 0 ? "default" : "destructive"}>
                      {entry.impact > 0 ? '+' : ''}{entry.impact}
                    </Badge>
                    {entry.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Blockchain */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-2">Sécurité Blockchain</h3>
              <p className="text-sm text-gray-600">
                Votre réputation est sécurisée et vérifiable sur la blockchain. 
                Toutes les interactions sont enregistrées de manière transparente et immuable.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Voir Blockchain
              </Button>
              <Button size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Certifier Profil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
