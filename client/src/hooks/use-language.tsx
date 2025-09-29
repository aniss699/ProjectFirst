import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navbar
    'navbar.login': 'Se connecter',
    'navbar.register': 'Créer un compte',
    'navbar.registerShort': "S'inscrire",
    'navbar.marketplace': 'Marketplace',
    'navbar.myMissions': 'Mes Missions',
    'navbar.createMission': 'Créer Mission',
    'navbar.messages': 'Messages',
    'navbar.profile': 'Profil',
    'navbar.dashboard': 'Tableau de bord',
    'navbar.favorites': 'Mes favoris',
    'navbar.logout': 'Déconnexion',
    'navbar.newMission': 'Nouvelle mission',
    'navbar.mission': 'Mission',

    // Brand
    'brand.name': 'Swideal',
    'brand.tagline': 'Le meilleur deal vient à toi',
    'brand.taglinePart1': 'Le meilleur ',
    'brand.taglinePart2': 'deal',
    'brand.taglinePart3': ' vient à toi',

    // Home page
    'home.title': 'La plateforme qui modernise la mise en relation',
    'home.subtitle': 'Swideal transforme chaque collaboration en opportunité gagnant-gagnant',
    'home.reverseAuction.title': 'Enchère inversée',
    'home.reverseAuction.description': 'Les prestataires rivalisent pour vous offrir le meilleur',
    'home.reverseAuction.details': 'Ne cherche plus le meilleur prix il vient à toi !',
    'home.directContact.title': 'Contact direct',
    'home.directContact.description': 'Accès immédiat aux experts du réseau et au-delà',
    'home.networkValue.title': 'Valorisez votre réseau',
    'home.networkValue.description': 'Générez des revenus en recommandant les bons contacts',
    'home.startButton': 'Commencer',

    // Footer
    'footer.description': 'La plateforme qui connecte talents et opportunités dans tous les domaines. Trouvez le partenaire idéal pour concrétiser vos projets.',
    'footer.madeWithPassion': 'Fait avec passion',
    'footer.navigation': 'Navigation',
    'footer.discoverMissions': 'Découvrir les missions',
    'footer.findExperts': 'Trouver des experts',
    'footer.publishMission': 'Publier une mission',
    'footer.ourConcept': 'Notre concept',
    'footer.mySpace': 'Mon espace',
    'footer.myDashboard': 'Mon tableau de bord',
    'footer.myProfile': 'Mon profil',
    'footer.support': 'Support',
    'footer.legalNotices': 'Mentions légales',
    'footer.sitemap': 'Plan du site',
    'footer.rightsReserved': '© 2024 Swideal. Tous droits réservés.',
    'footer.service247': 'Service disponible 24h/7j',
    'footer.globalPlatform': '🌍 Plateforme mondiale',
    'footer.securePayments': '🔒 Paiements sécurisés',

    // Mobile navigation
    'mobile.navigation': 'Navigation',
    'mobile.feed': 'Flux',
    'mobile.providers': 'Prestataires',
    'mobile.services': 'Services',
    'mobile.concept': 'Notre concept',
    'mobile.missions': 'Missions',
    'mobile.mySpace': 'Mon Espace',
    'mobile.myFavorites': 'Mes favoris',
  },
  en: {
    // Navbar
    'navbar.login': 'Sign In',
    'navbar.register': 'Create Account',
    'navbar.registerShort': 'Sign Up',
    'navbar.marketplace': 'Marketplace',
    'navbar.myMissions': 'My Missions',
    'navbar.createMission': 'Create Mission',
    'navbar.messages': 'Messages',
    'navbar.profile': 'Profile',
    'navbar.dashboard': 'Dashboard',
    'navbar.favorites': 'My Favorites',
    'navbar.logout': 'Logout',
    'navbar.newMission': 'New Mission',
    'navbar.mission': 'Mission',

    // Brand
    'brand.name': 'Swideal',
    'brand.tagline': 'The best deal comes to you',
    'brand.taglinePart1': 'The best ',
    'brand.taglinePart2': 'deal',
    'brand.taglinePart3': ' comes to you',

    // Home page
    'home.title': 'The platform that modernizes networking',
    'home.subtitle': 'Swideal transforms every collaboration into a win-win opportunity',
    'home.reverseAuction.title': 'Reverse Auction',
    'home.reverseAuction.description': 'Service providers compete to offer you the best',
    'home.reverseAuction.details': 'No more searching for the best price, it comes to you!',
    'home.directContact.title': 'Direct Contact',
    'home.directContact.description': 'Immediate access to network experts and beyond',
    'home.networkValue.title': 'Monetize your network',
    'home.networkValue.description': 'Generate revenue by recommending the right contacts',
    'home.startButton': 'Get Started',

    // Footer
    'footer.description': 'The platform that connects talents and opportunities in all domains. Find the ideal partner to bring your projects to life.',
    'footer.madeWithPassion': 'Made with passion',
    'footer.navigation': 'Navigation',
    'footer.discoverMissions': 'Discover missions',
    'footer.findExperts': 'Find experts',
    'footer.publishMission': 'Publish a mission',
    'footer.ourConcept': 'Our concept',
    'footer.mySpace': 'My Space',
    'footer.myDashboard': 'My dashboard',
    'footer.myProfile': 'My profile',
    'footer.support': 'Support',
    'footer.legalNotices': 'Legal notices',
    'footer.sitemap': 'Sitemap',
    'footer.rightsReserved': '© 2024 Swideal. All rights reserved.',
    'footer.service247': 'Service available 24/7',
    'footer.globalPlatform': '🌍 Global platform',
    'footer.securePayments': '🔒 Secure payments',

    // Mobile navigation
    'mobile.navigation': 'Navigation',
    'mobile.feed': 'Feed',
    'mobile.providers': 'Providers',
    'mobile.services': 'Services',
    'mobile.concept': 'Our concept',
    'mobile.missions': 'Missions',
    'mobile.mySpace': 'My Space',
    'mobile.myFavorites': 'My favorites',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}