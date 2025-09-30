import { useState } from 'react';
import { useLocation } from 'wouter';
import { Briefcase, Users, Plus, Menu, Lightbulb, Rocket, User, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { ROUTES } from '@/routes/paths';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const mainNavItems = [
    {
      icon: Briefcase,
      label: 'Missions',
      path: '/marketplace',
      testId: 'nav-marketplace'
    },
    {
      icon: Rocket,
      label: 'Flux',
      path: '/feed',
      testId: 'nav-feed'
    },
    {
      icon: Users,
      label: 'Prestataires',
      path: '/available-providers',
      testId: 'nav-providers'
    }
  ];

  const menuItems = [
    {
      icon: Lightbulb,
      label: 'Le Concept',
      path: '/notre-concept',
      testId: 'menu-concept'
    },
    {
      icon: Rocket,
      label: 'Services',
      path: '/services',
      testId: 'menu-services'
    },
    ...(user ? [{
      icon: User,
      label: t('navbar.profile'),
      path: '/profile',
      testId: 'menu-profile'
    }] : [{
      icon: LogIn,
      label: 'Se connecter',
      path: '/login',
      testId: 'menu-login'
    }])
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMenuOpen(false);
  };

  const handleNewMission = () => {
    setLocation('/?step=0');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2 relative">
        {mainNavItems.slice(0, 2).map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              data-testid={item.testId}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[0.7rem] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={handleNewMission}
          className="flex flex-col items-center justify-center -mt-6 transition-transform duration-200 active:scale-95"
          data-testid="button-new-mission-central"
        >
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-4 shadow-lg">
            <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[0.65rem] font-semibold text-gray-700 mt-1">
            Nouvelle
          </span>
        </button>

        {mainNavItems.slice(2).map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              data-testid={item.testId}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[0.7rem] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-gray-600 hover:text-blue-500 transition-all duration-200"
              data-testid="nav-menu"
            >
              <Menu className="w-6 h-6" />
              <span className="text-[0.7rem] font-medium">
                Menu
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    data-testid={item.testId}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
