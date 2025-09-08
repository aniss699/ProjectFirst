import { useState } from 'react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/routes/paths';
import { User, LogOut, Menu, X, Briefcase, Users, BarChart3, Target, Brain, MessageSquare, Search, Zap, TrendingUp, Plus, MonitorPlay, ChevronDown, PlusCircle, Smartphone, Sparkles, Lightbulb } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
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
  const [showQuickCreator, setShowQuickCreator] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(ROUTES.HOME)}
              className="group flex items-center space-x-3 sm:space-x-4 hover:scale-105 transition-all duration-300 ease-out mobile-logo-container"
            >
              <div className="relative mobile-logo-wrapper">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-1.5 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <img
                    src="/swideal-logo.png"
                    alt="Swideal Logo"
                    className="w-full h-full object-cover brightness-0 invert group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>
              <div className="flex flex-col items-start justify-center mobile-brand-text ml-1">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent tracking-tight leading-none mobile-brand-title">
                  SWIDEAL
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-wide leading-none mt-0.5 mobile-brand-subtitle">
                  <span className="text-gray-900">Le meilleur </span>
                  <span className="text-emerald-600">deal</span>
                  <span className="text-gray-900"> vient à toi</span>
                </span>
                <span className="text-xs text-gray-500 hidden lg:block font-medium leading-none mt-1 mobile-brand-description">
                  IA • Missions • Talents
                </span>
              </div>
            </button>
          </div>


          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop quick mission creator button */}
            {location !== ROUTES.HOME && (
              <Sheet open={showQuickCreator} onOpenChange={setShowQuickCreator}>
                <SheetTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-2 sm:px-3">
                    <Plus className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Nouvelle mission</span>
                    <span className="hidden lg:inline xl:hidden">Mission</span>
                    <span className="lg:hidden text-xs">Créer</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[500px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      Création rapide avec IA
                    </SheetTitle>
                    <SheetDescription>
                      Créez votre mission en quelques clics grâce à notre assistant IA intelligent.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Créez votre mission avec notre assistant intelligent
                      </p>
                      <Button
                        onClick={() => {
                          setShowQuickCreator(false);
                          handleNavigation('/create-mission');
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Commencer la création
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Desktop User Menu */}
                <div className="hidden xl:flex items-center space-x-3">
                  <button
                    onClick={() => handleNavigation('/missions')}
                    className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-2 text-sm"
                  >
                    Mes missions
                  </button>
                  <button
                    onClick={() => handleNavigation('/messages')}
                    className="text-gray-700 hover:text-blue-600 transition-colors relative px-2 py-2 text-sm"
                  >
                    Messages
                  </button>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-100 px-2 sm:px-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs sm:text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:block text-gray-700 text-sm max-w-20 truncate">{user.email.split('@')[0]}</span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
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
                  className="hidden sm:flex text-sm px-3"
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

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[75vw] max-w-xs p-0 flex flex-col"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de navigation</SheetTitle>
                  <SheetDescription>
                    Menu principal de navigation pour mobile
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col h-full relative">
                  {/* Indicateur de swipe */}
                  <div className="mobile-nav-swipe-indicator"></div>

                  {/* Header avec recherche */}
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-1.5 shadow-sm">
                          <img
                            src="/swideal-logo.png"
                            alt="Swideal Logo"
                            className="w-full h-full object-cover brightness-0 invert"
                          />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                          SWIDEAL
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Navigation
                        </span>
                      </div>
                    </div>

                    {/* Barre de recherche mobile */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        inputMode="none"
                        autoComplete="off"
                        className="mobile-nav-search w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                      <button
                        onClick={() => {
                          handleNavigation('/ai-hub');
                          setIsMobileMenuOpen(false);
                        }}
                        className="mobile-quick-action flex items-center space-x-2.5 bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-left">Hub IA</span>
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
              </SheetContent>
            </Sheet>
          </div>
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