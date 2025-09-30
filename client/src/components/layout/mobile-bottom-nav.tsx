import { useLocation } from 'wouter';
import { Home, Briefcase, Users, User, MessageSquare, LayoutGrid, Lightbulb, ScrollText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { ROUTES } from '@/routes/paths';

export default function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    {
      icon: LayoutGrid,
      label: 'Accueil',
      path: ROUTES.HOME,
      testId: 'nav-home'
    },
    {
      icon: ScrollText,
      label: 'Flux',
      path: '/feed',
      testId: 'nav-feed'
    },
    {
      icon: Lightbulb,
      label: 'Le Concept',
      path: '/notre-concept',
      testId: 'nav-concept'
    },
    {
      icon: Briefcase,
      label: t('mobile.missions'),
      path: '/marketplace',
      testId: 'nav-marketplace'
    },
    {
      icon: Users,
      label: t('mobile.providers'),
      path: '/available-providers',
      testId: 'nav-providers'
    },
    {
      icon: user ? User : MessageSquare,
      label: user ? t('navbar.profile') : t('navbar.login'),
      path: user ? '/profile' : '/login',
      testId: user ? 'nav-profile' : 'nav-login'
    }
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              data-testid={item.testId}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[0.65rem] font-medium leading-tight ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
