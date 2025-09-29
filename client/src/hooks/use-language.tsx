
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
    'home.reverseAuction.description': 'Au lieu de chercher des prestataires, publiez votre besoin et laissez-les venir à vous avec leurs meilleures offres.',
    'home.reverseAuction.details': 'Ne cherche plus le meilleur prix il vient à toi !',
    'home.reverseAuction.result': 'Résultat : des prix plus compétitifs naturellement',
    'home.directContact.title': 'Contact direct',
    'home.directContact.description': 'Accès immédiat aux experts du réseau et au-delà',
    'home.networkValue.title': 'Valorisez votre réseau',
    'home.networkValue.description': 'Générez des revenus en recommandant les bons contacts',
    'home.startButton': 'Commencer',
    
    // Our approach section
    'home.ourApproach.title': 'Notre approche',
    'home.ourApproach.description': 'Nous améliorons le modèle de mise en relation existant avec deux mécanismes simples mais efficaces',
    
    // Paid connection section  
    'home.paidConnection.title': 'Mise en relation payante',
    'home.paidConnection.description': 'Au lieu de prospecter pendant des semaines, payez quelqu\'un qui a déjà le contact pour vous mettre en relation directement.',
    'home.paidConnection.result': 'Résultat : votre réseau devient rentable, les contacts sont immédiats',
    
    // Why it works section
    'home.whyItWorks.title': 'Pourquoi cette combinaison fonctionne',
    'home.whyItWorks.economical.title': 'Économiquement logique',
    'home.whyItWorks.economical.description': 'La concurrence optimise les prix',
    'home.whyItWorks.efficient.title': 'Efficace pour tous',
    'home.whyItWorks.efficient.description': 'Moins de recherche, plus de résultats',
    'home.whyItWorks.profitable.title': 'Réseau rentable',
    'home.whyItWorks.profitable.description': 'Chacun peut devenir apporteur d\'affaires',
    'home.whyItWorks.immediate.title': 'Contacts immédiats',
    'home.whyItWorks.immediate.description': 'Fini la prospection longue',

    // Marketplace
    'marketplace.title': 'Marketplace des Projets',
    'marketplace.subtitle': 'Découvrez et soumissionnez sur les projets disponibles',
    'marketplace.filterTitle': 'Filtrer les projets',
    'marketplace.category': 'Catégorie',
    'marketplace.budget': 'Budget',
    'marketplace.location': 'Localisation',
    'marketplace.allCategories': 'Toutes les catégories',
    'marketplace.allBudgets': 'Tous les budgets',
    'marketplace.locationPlaceholder': 'Ville, région...',
    'marketplace.resetFilters': '🔄 Réinitialiser les filtres',
    'marketplace.allMissions': 'Toutes les missions',
    'marketplace.sortBy': 'Trier par:',
    'marketplace.newest': 'Plus récent',
    'marketplace.budgetHigh': 'Budget décroissant',
    'marketplace.budgetLow': 'Budget croissant',
    'marketplace.bidsCount': 'Nombre d\'offres',
    'marketplace.aiMatching': '🤖 Matching IA',
    'marketplace.loading': 'Chargement des missions...',
    'marketplace.degradedMode': 'Mode dégradé activé',
    'marketplace.loadingProblem': 'Problème de chargement',
    'marketplace.loadingProblemDesc': 'Impossible de charger les missions pour le moment.',
    'marketplace.degradedModeDesc': 'Les missions ne peuvent pas être chargées normalement. Le système fonctionne en mode dégradé.',
    'marketplace.retry': '🔄 Réessayer',
    'marketplace.backHome': '🏠 Retour accueil',
    'marketplace.suggestions': '💡 Suggestions:',
    'marketplace.checkConnection': '• Vérifiez votre connexion internet',
    'marketplace.tryAgain': '• Essayez de recharger dans quelques minutes',
    'marketplace.contactSupport': '• Contactez le support si le problème persiste',
    'marketplace.demoMissions': '🎯 Missions de démonstration',
    'marketplace.demoMissionsDesc': 'En attendant le retour du service, voici quelques exemples de missions typiques :',
    'marketplace.noMissions': 'Aucune mission trouvée',
    'marketplace.noMissionsDesc': 'Essayez de modifier vos filtres',
    'marketplace.serviceStatus.loading': 'Chargement...',
    'marketplace.serviceStatus.active': 'Service actif',
    'marketplace.serviceStatus.degraded': 'Mode dégradé',
    'marketplace.total': 'total',
    'marketplace.withErrors': '(avec erreurs)',

    // Missions page
    'missions.title': 'Mes Missions',
    'missions.subtitle': 'Gérez vos missions et consultez les offres reçues',
    'missions.newMission': 'Nouvelle Mission',
    'missions.posted': 'Missions publiées',
    'missions.bids': 'Mes candidatures',
    'missions.loading': 'Chargement...',
    'missions.loadingError': 'Erreur de chargement',
    'missions.retry': 'Réessayer',
    'missions.loginRequired': 'Connexion requise',
    'missions.loginRequiredDesc': 'Veuillez vous connecter pour voir vos missions',
    'missions.backHome': 'Retour à l\'accueil',
    'missions.category': 'Catégorie',
    'missions.location': 'Lieu',
    'missions.notSpecified': 'Non spécifié',
    'missions.offers': 'offre',
    'missions.offersPlural': 'offres',
    'missions.viewOffers': 'Voir les offres',
    'missions.edit': 'Modifier',
    'missions.delete': 'Supprimer',
    'missions.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cette mission ?',
    'missions.lastOffers': 'Dernières offres reçues :',
    'missions.candidatureSubmitted': 'Candidature soumise',
    'missions.noMessage': 'Aucun message fourni',
    'missions.yourOffer': 'Votre offre:',
    'missions.timeline': 'Délai:',
    'missions.timelineDays': 'jours',
    'missions.pending': 'En attente',
    'missions.noPostedMissions': 'Vous n\'avez pas encore publié de missions',
    'missions.createFirst': 'Créer ma première mission',
    'missions.noBids': 'Vous n\'avez pas encore postulé à des missions',
    'missions.discoverMissions': 'Découvrir les missions',

    // Mission status
    'status.published': 'Publiée',
    'status.open': 'Ouverte',
    'status.in_progress': 'En cours',
    'status.completed': 'Terminée',
    'status.closed': 'Fermée',

    // Budget ranges
    'budget.range.0-500': '0 - 500€',
    'budget.range.500-2000': '500 - 2 000€',
    'budget.range.2000-5000': '2 000 - 5 000€',
    'budget.range.5000+': '5 000€+',

    // Toast messages
    'toast.mission.deleted.title': 'Mission supprimée',
    'toast.mission.deleted.description': 'Votre mission a été supprimée avec succès.',
    'toast.error.title': 'Erreur',
    'toast.error.deleteMission': 'Impossible de supprimer la mission.',

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
    'home.reverseAuction.description': 'Instead of searching for service providers, publish your need and let them come to you with their best offers.',
    'home.reverseAuction.details': 'No more searching for the best price, it comes to you!',
    'home.reverseAuction.result': 'Result: naturally more competitive prices',
    'home.directContact.title': 'Direct Contact',
    'home.directContact.description': 'Immediate access to network experts and beyond',
    'home.networkValue.title': 'Monetize your network',
    'home.networkValue.description': 'Generate revenue by recommending the right contacts',
    'home.startButton': 'Get Started',
    
    // Our approach section
    'home.ourApproach.title': 'Our Approach',
    'home.ourApproach.description': 'We improve the existing networking model with two simple but effective mechanisms',
    
    // Paid connection section
    'home.paidConnection.title': 'Paid Networking',
    'home.paidConnection.description': 'Instead of prospecting for weeks, pay someone who already has the contact to connect you directly.',
    'home.paidConnection.result': 'Result: your network becomes profitable, contacts are immediate',
    
    // Why it works section
    'home.whyItWorks.title': 'Why this combination works',
    'home.whyItWorks.economical.title': 'Economically logical',
    'home.whyItWorks.economical.description': 'Competition optimizes prices',
    'home.whyItWorks.efficient.title': 'Efficient for everyone',
    'home.whyItWorks.efficient.description': 'Less searching, more results',
    'home.whyItWorks.profitable.title': 'Profitable network',
    'home.whyItWorks.profitable.description': 'Anyone can become a business broker',
    'home.whyItWorks.immediate.title': 'Immediate contacts',
    'home.whyItWorks.immediate.description': 'No more long prospecting',

    // Marketplace
    'marketplace.title': 'Project Marketplace',
    'marketplace.subtitle': 'Discover and bid on available projects',
    'marketplace.filterTitle': 'Filter projects',
    'marketplace.category': 'Category',
    'marketplace.budget': 'Budget',
    'marketplace.location': 'Location',
    'marketplace.allCategories': 'All categories',
    'marketplace.allBudgets': 'All budgets',
    'marketplace.locationPlaceholder': 'City, region...',
    'marketplace.resetFilters': '🔄 Reset filters',
    'marketplace.allMissions': 'All missions',
    'marketplace.sortBy': 'Sort by:',
    'marketplace.newest': 'Newest',
    'marketplace.budgetHigh': 'Budget descending',
    'marketplace.budgetLow': 'Budget ascending',
    'marketplace.bidsCount': 'Number of bids',
    'marketplace.aiMatching': '🤖 AI Matching',
    'marketplace.loading': 'Loading missions...',
    'marketplace.degradedMode': 'Degraded mode activated',
    'marketplace.loadingProblem': 'Loading problem',
    'marketplace.loadingProblemDesc': 'Unable to load missions at the moment.',
    'marketplace.degradedModeDesc': 'Missions cannot be loaded normally. The system is running in degraded mode.',
    'marketplace.retry': '🔄 Retry',
    'marketplace.backHome': '🏠 Back home',
    'marketplace.suggestions': '💡 Suggestions:',
    'marketplace.checkConnection': '• Check your internet connection',
    'marketplace.tryAgain': '• Try reloading in a few minutes',
    'marketplace.contactSupport': '• Contact support if the problem persists',
    'marketplace.demoMissions': '🎯 Demo missions',
    'marketplace.demoMissionsDesc': 'While waiting for the service to return, here are some typical mission examples:',
    'marketplace.noMissions': 'No missions found',
    'marketplace.noMissionsDesc': 'Try modifying your filters',
    'marketplace.serviceStatus.loading': 'Loading...',
    'marketplace.serviceStatus.active': 'Service active',
    'marketplace.serviceStatus.degraded': 'Degraded mode',
    'marketplace.total': 'total',
    'marketplace.withErrors': '(with errors)',

    // Missions page
    'missions.title': 'My Missions',
    'missions.subtitle': 'Manage your missions and view received offers',
    'missions.newMission': 'New Mission',
    'missions.posted': 'Posted missions',
    'missions.bids': 'My applications',
    'missions.loading': 'Loading...',
    'missions.loadingError': 'Loading error',
    'missions.retry': 'Retry',
    'missions.loginRequired': 'Login required',
    'missions.loginRequiredDesc': 'Please log in to see your missions',
    'missions.backHome': 'Back to home',
    'missions.category': 'Category',
    'missions.location': 'Location',
    'missions.notSpecified': 'Not specified',
    'missions.offers': 'offer',
    'missions.offersPlural': 'offers',
    'missions.viewOffers': 'View offers',
    'missions.edit': 'Edit',
    'missions.delete': 'Delete',
    'missions.deleteConfirm': 'Are you sure you want to delete this mission?',
    'missions.lastOffers': 'Latest offers received:',
    'missions.candidatureSubmitted': 'Application submitted',
    'missions.noMessage': 'No message provided',
    'missions.yourOffer': 'Your offer:',
    'missions.timeline': 'Timeline:',
    'missions.timelineDays': 'days',
    'missions.pending': 'Pending',
    'missions.noPostedMissions': 'You haven\'t posted any missions yet',
    'missions.createFirst': 'Create my first mission',
    'missions.noBids': 'You haven\'t applied to any missions yet',
    'missions.discoverMissions': 'Discover missions',

    // Mission status
    'status.published': 'Published',
    'status.open': 'Open',
    'status.in_progress': 'In Progress',
    'status.completed': 'Completed',
    'status.closed': 'Closed',

    // Budget ranges
    'budget.range.0-500': '0 - 500€',
    'budget.range.500-2000': '500 - 2,000€',
    'budget.range.2000-5000': '2,000 - 5,000€',
    'budget.range.5000+': '5,000€+',

    // Toast messages
    'toast.mission.deleted.title': 'Mission deleted',
    'toast.mission.deleted.description': 'Your mission has been successfully deleted.',
    'toast.error.title': 'Error',
    'toast.error.deleteMission': 'Unable to delete mission.',

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
