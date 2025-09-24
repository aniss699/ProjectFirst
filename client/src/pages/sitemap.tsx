
import { useLocation } from 'wouter';
import { ROUTES } from '@/routes/paths';
import { 
  Home, 
  Briefcase, 
  Users, 
  BarChart3, 
  Target, 
  Brain, 
  MessageSquare, 
  Search, 
  Zap, 
  TrendingUp, 
  Plus, 
  MonitorPlay, 
  User,
  FileText,
  Settings
} from 'lucide-react';

export default function Sitemap() {
  const [, setLocation] = useLocation();

  const siteLinks = {
    "Plateforme": [
      { path: ROUTES.HOME, label: 'Accueil', icon: Home },
      { path: ROUTES.MARKETPLACE, label: 'Marketplace', icon: Search },
      { path: ROUTES.SERVICES, label: 'Services', icon: Briefcase },
      { path: '/available-providers', label: 'Prestataires', icon: Users },
      { path: ROUTES.FEATURES, label: 'Fonctionnalités', icon: Settings },
    ],
    "Démo & Test": [
      { path: '/demo/ia', label: 'IA en Action', icon: Brain },
      { path: '/demo/missions', label: 'Missions Démo', icon: Target },
      { path: '/ai-test', label: 'Test IA', icon: Search },
    ],
    "IA & Intelligence": [
      { path: '/ai-features', label: 'Fonctionnalités IA', icon: Zap },
      { path: '/ai-dashboard', label: 'Dashboard IA', icon: Brain },
      { path: '/ai-advanced', label: 'IA Avancée', icon: TrendingUp },
      { path: '/feed', label: 'Flux IA', icon: MonitorPlay },
    ],
    "Mon Espace": [
      { path: '/login', label: 'Connexion', icon: User },
      { path: ROUTES.DASHBOARD, label: 'Tableau de bord', icon: BarChart3 },
      { path: ROUTES.PROFILE, label: 'Mon profil', icon: User },
      { path: ROUTES.MISSIONS, label: 'Mes missions', icon: Briefcase },
      { path: ROUTES.CREATE_MISSION, label: 'Créer une mission', icon: Plus },
      { path: ROUTES.MESSAGES, label: 'Messages', icon: MessageSquare },
    ],
    "Support & Légal": [
      { path: ROUTES.LEGAL, label: 'Mentions légales', icon: FileText },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Plan du site
        </h1>
        <p className="text-gray-600">
          Retrouvez toutes les pages et fonctionnalités de SwipDEAL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(siteLinks).map(([category, links]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
            <ul className="space-y-3">
              {links.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <button
                    onClick={() => setLocation(path)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
