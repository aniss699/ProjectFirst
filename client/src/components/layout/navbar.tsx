import { useState } from 'react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/routes/paths';
import { User, LogOut, Menu, X, Briefcase, Users, BarChart3, Target, MessageSquare, Zap, TrendingUp, Plus, MonitorPlay, ChevronDown, PlusCircle, Smartphone, Sparkles, Lightbulb, Heart, FileText, Brain } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handleNavigation = (href: string) => {
    console.log('Navigation vers:', href);
    setLocation(href);
    setIsMobileMenuOpen(false);
  };

  // Gestes tactiles pour fermer le menu mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 100;
    const isRightSwipe = distance < -100;

    // Fermer le menu avec un swipe vers la droite
    if (isRightSwipe && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const NavLink = ({ href, children, className = "" }: { href: string, children: React.ReactNode, className?: string }) => (
    <button
      onClick={() => handleNavigation(href)}
      className={`text-gray-700 hover:text-blue-600 transition-colors cursor-pointer px-2 xl:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${className} ${
        location === href ? 'text-blue-600 bg-blue-50' : ''
      }`}
    >
      {children}
    </button>
  );

  const MobileNavLink = ({ href, children, icon: Icon }: { href: string, children: React.ReactNode, icon: any }) => (
    <button
      onClick={() => handleNavigation(href)}
      className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 cursor-pointer rounded-md ${
        location === href ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600 font-medium' : 'text-gray-700 hover:text-gray-900 hover:bg-blue-50'
      }`}
    >
      <Icon className={`w-5 h-5 ${location === href ? 'text-blue-600' : 'text-gray-500'}`} />
      <span>{children}</span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 shadow-sm border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(ROUTES.HOME)}
              className="group flex items-center space-x-3 sm:space-x-4 hover:scale-105 transition-all duration-300 ease-out mobile-logo-container"
              data-testid="button-logo-navbar"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                <span className="text-white font-bold text-lg">S</span>
                <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute bottom-1 left-2 w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className="flex flex-col items-start justify-center mobile-brand-text ml-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" data-testid="text-brand-navbar">
                  Swideal
                </span>
                <span className="text-[0.7rem] sm:text-base font-bold tracking-wide leading-none mt-1 mobile-brand-subtitle">
                  <span className="text-gray-300">Le meilleur </span>
                  <span className="text-emerald-400 font-black">deal</span>
                  <span className="text-gray-300"> vient à toi</span>
                </span>
              </div>
            </button>
          </div>


          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop quick mission creator button */}
            {location !== ROUTES.HOME && (
              <div className="hidden sm:flex">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-2 sm:px-3">
                  <Plus className="w-4 h-4 mr-1 xl:mr-2" />
                  <span className="hidden xl:inline">Nouvelle mission</span>
                  <span className="hidden lg:inline xl:hidden">Mission</span>
                </Button>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Desktop User Menu - Nettoyé */}
                <div className="hidden xl:flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => setLocation('/marketplace')} className="text-gray-300 hover:text-blue-300">
                    Marketplace
                  </Button>
                  <Button variant="ghost" onClick={() => setLocation('/missions')} className="text-gray-300 hover:text-blue-300">
                    Mes Missions
                  </Button>
                  <Button variant="ghost" onClick={() => setLocation('/')} className="text-gray-300 hover:text-blue-300">
                    Créer Mission
                  </Button>
                  <button
                    onClick={() => handleNavigation('/messages')}
                    className="text-gray-300 hover:text-blue-300 transition-colors relative px-2 py-2 text-sm"
                  >
                    Messages
                  </button>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-700/50 px-2 sm:px-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:block text-gray-300 text-sm max-w-20 truncate">{user.email.split('@')[0]}</span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="flex items-center w-full"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="flex items-center w-full"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Tableau de bord
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => handleNavigation('/favorites')}
                        className="flex items-center w-full"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Mes favoris
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="lg:hidden">
                      <button
                        onClick={() => handleNavigation('/missions')}
                        className="flex items-center w-full"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Mes missions
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="lg:hidden">
                      <button
                        onClick={() => handleNavigation('/messages')}
                        className="flex items-center w-full"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/login')}
                  className="hidden sm:flex text-sm px-3 text-gray-300 hover:text-blue-300 hover:bg-gray-700/50"
                >
                  Se connecter
                </Button>
                <Button
                  onClick={() => handleAuthClick('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-2 whitespace-nowrap min-w-fit"
                >
                  <span className="hidden xs:inline sm:inline">Créer un compte</span>
                  <span className="xs:hidden sm:hidden text-xs">S'inscrire</span>
                </Button>
              </div>
            )}

            {/* Menu Burger */}
            <div className="flex">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-700/50" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6 text-gray-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sheet (Conditionally rendered based on isMobileMenuOpen) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-[75vw] max-w-xs transform transition-transform duration-300 ease-in-out bg-white shadow-xl flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col h-full relative">
          {/* Indicateur de swipe */}
          <div className="mobile-nav-swipe-indicator"></div>

          {/* Header avec recherche */}
          <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <img
                  src="/swideal-logo.jpeg"
                  alt="Swideal Logo"
                  className="w-14 h-14 object-contain rounded-xl shadow-md"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm" data-testid="text-brand-mobile">
                  SWIDEAL
                </span>
                <span className="text-xs text-gray-600 font-semibold">
                  Navigation
                </span>
              </div>
            </div>

            
          </div>

          {/* Actions rapides - disposition verticale */}
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  handleNavigation('/feed');
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-quick-action flex items-center space-x-2.5 bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-left">Flux</span>
              </button>
              <button
                onClick={() => {
                  handleNavigation('/available-providers');
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-quick-action flex items-center space-x-2.5 bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-left">Prestataires</span>
              </button>
              <button
                onClick={() => {
                  handleNavigation('/services');
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-quick-action flex items-center space-x-2.5 bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-left">Services</span>
              </button>

              <button
                onClick={() => {
                  handleNavigation('/notre-concept');
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-quick-action flex items-center space-x-2.5 bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-left">Notre concept</span>
              </button>
              <button
                onClick={() => {
                  handleNavigation('/marketplace');
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-quick-action flex items-center space-x-2.5 bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-left">Missions</span>
              </button>
              
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Mon espace (si connecté) */}
            {user && (
              <div className="mobile-nav-category px-2 mb-4">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mon Espace</h3>
                <MobileNavLink href="/dashboard" icon={BarChart3}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink href="/profile" icon={User}>
                  Mon Profil
                </MobileNavLink>
                <MobileNavLink href="/missions" icon={Briefcase}>
                  Mes Missions
                </MobileNavLink>
                <MobileNavLink href="/messages" icon={MessageSquare}>
                  Messages
                </MobileNavLink>
                <MobileNavLink href="/favorites" icon={Heart}>
                  Mes favoris
                </MobileNavLink>
              </div>
            )}
          </div>

          {/* Mobile quick mission creator button */}
          <div className="mt-6 px-4">
            <Button
              onClick={() => {
                handleNavigation('/create-mission');
                setIsMobileMenuOpen(false);
              }}
              size="sm"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle mission
            </Button>
          </div>

          {/* Authentication buttons for mobile */}
          {!user && (
            <div className="px-4 py-4 border-t border-gray-200 mt-6">
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    handleNavigation('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Se connecter
                </Button>
                <Button
                  onClick={() => {
                    handleAuthClick('register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Créer un compte
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>


      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </nav>
  );
}