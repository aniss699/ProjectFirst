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

    // Marketplace
    'marketplace.title': 'Marketplace des Projets',
    'marketplace.description': 'Découvrez et soumissionnez sur les projets disponibles',
    'marketplace.filters.title': 'Filtrer les projets',
    'marketplace.filters.category': 'Catégorie',
    'marketplace.filters.budget': 'Budget',
    'marketplace.filters.location': 'Localisation',
    'marketplace.filters.allCategories': 'Toutes les catégories',
    'marketplace.filters.allBudgets': 'Tous les budgets',
    'marketplace.filters.locationPlaceholder': 'Ville, région...',
    'marketplace.filters.resetFilters': '🔄 Réinitialiser les filtres',
    'marketplace.sort.label': 'Trier par:',
    'marketplace.sort.newest': 'Plus récent',
    'marketplace.sort.budgetHigh': 'Budget décroissant',
    'marketplace.sort.budgetLow': 'Budget croissant',
    'marketplace.sort.bids': 'Nombre d\'offres',
    'marketplace.allMissions': 'Toutes les missions',
    'marketplace.aiMatching': '🤖 Matching IA',
    'marketplace.loading': 'Chargement des missions...',
    'marketplace.error.title': 'Problème de chargement',
    'marketplace.error.description': 'Impossible de charger les missions pour le moment.',
    'marketplace.error.retry': '🔄 Réessayer',
    'marketplace.error.home': '🏠 Retour accueil',
    'marketplace.noMissions': 'Aucune mission trouvée',
    'marketplace.noMissions.subtitle': 'Essayez de modifier vos filtres',
    'marketplace.status.loading': 'Chargement...',
    'marketplace.status.active': 'Service actif',
    'marketplace.status.degraded': 'Mode dégradé',

    // Missions
    'missions.title': 'Mes Missions',
    'missions.description': 'Gérez vos missions et consultez les offres reçues',
    'missions.newMission': 'Nouvelle Mission',
    'missions.posted': 'Missions publiées',
    'missions.bids': 'Mes candidatures',
    'missions.loading': 'Chargement...',
    'missions.error.title': 'Erreur de chargement',
    'missions.error.retry': 'Réessayer',
    'missions.loginRequired': 'Connexion requise',
    'missions.loginRequired.description': 'Veuillez vous connecter pour voir vos missions',
    'missions.loginRequired.button': 'Retour à l\'accueil',
    'missions.status.published': 'Publiée',
    'missions.status.open': 'Ouverte',
    'missions.status.inProgress': 'En cours',
    'missions.status.completed': 'Terminée',
    'missions.status.closed': 'Fermée',
    'missions.category': 'Catégorie',
    'missions.location': 'Lieu',
    'missions.location.notSpecified': 'Non spécifié',
    'missions.offers': 'offre',
    'missions.offers.plural': 'offres',
    'missions.actions.viewOffers': 'Voir les offres',
    'missions.actions.edit': 'Modifier',
    'missions.actions.delete': 'Supprimer',
    'missions.actions.delete.confirm': 'Êtes-vous sûr de vouloir supprimer cette mission ?',
    'missions.latestOffers': 'Dernières offres reçues :',
    'missions.candidature': 'Candidature soumise',
    'missions.noMissions': 'Vous n\'avez pas encore publié de missions',
    'missions.createFirstMission': 'Créer ma première mission',
    'missions.noBids': 'Vous n\'avez pas encore postulé à des missions',
    'missions.discoverMissions': 'Découvrir les missions',
    'missions.yourOffer': 'Votre offre:',
    'missions.deadline': 'Délai',
    'missions.deadline.days': 'jours',
    'missions.deadline.notSpecified': 'Non spécifié',
    'missions.pending': 'En attente',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.view': 'Voir',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.all': 'Tout',
    'common.none': 'Aucun',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.confirm': 'Confirmer',

    // Budget ranges
    'budget.range.0-500': '0 - 500€',
    'budget.range.500-2000': '500 - 2 000€',
    'budget.range.2000-5000': '2 000 - 5 000€',
    'budget.range.5000+': '5 000€+',

    // Toast messages
    'toast.mission.deleted': 'Mission supprimée',
    'toast.mission.deleted.description': 'Votre mission a été supprimée avec succès.',
    'toast.error.title': 'Erreur',
    'toast.error.deleteMission': 'Impossible de supprimer la mission.',</old_str>
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

    // Marketplace
    'marketplace.title': 'Project Marketplace',
    'marketplace.description': 'Discover and bid on available projects',
    'marketplace.filters.title': 'Filter projects',
    'marketplace.filters.category': 'Category',
    'marketplace.filters.budget': 'Budget',
    'marketplace.filters.location': 'Location',
    'marketplace.filters.allCategories': 'All categories',
    'marketplace.filters.allBudgets': 'All budgets',
    'marketplace.filters.locationPlaceholder': 'City, region...',
    'marketplace.filters.resetFilters': '🔄 Reset filters',
    'marketplace.sort.label': 'Sort by:',
    'marketplace.sort.newest': 'Newest',
    'marketplace.sort.budgetHigh': 'Budget descending',
    'marketplace.sort.budgetLow': 'Budget ascending',
    'marketplace.sort.bids': 'Number of bids',
    'marketplace.allMissions': 'All missions',
    'marketplace.aiMatching': '🤖 AI Matching',
    'marketplace.loading': 'Loading missions...',
    'marketplace.error.title': 'Loading problem',
    'marketplace.error.description': 'Unable to load missions at the moment.',
    'marketplace.error.retry': '🔄 Retry',
    'marketplace.error.home': '🏠 Back home',
    'marketplace.noMissions': 'No missions found',
    'marketplace.noMissions.subtitle': 'Try modifying your filters',
    'marketplace.status.loading': 'Loading...',
    'marketplace.status.active': 'Service active',
    'marketplace.status.degraded': 'Degraded mode',

    // Missions
    'missions.title': 'My Missions',
    'missions.description': 'Manage your missions and view received offers',
    'missions.newMission': 'New Mission',
    'missions.posted': 'Posted missions',
    'missions.bids': 'My applications',
    'missions.loading': 'Loading...',
    'missions.error.title': 'Loading error',
    'missions.error.retry': 'Retry',
    'missions.loginRequired': 'Login required',
    'missions.loginRequired.description': 'Please log in to view your missions',
    'missions.loginRequired.button': 'Back to home',
    'missions.status.published': 'Published',
    'missions.status.open': 'Open',
    'missions.status.inProgress': 'In progress',
    'missions.status.completed': 'Completed',
    'missions.status.closed': 'Closed',
    'missions.category': 'Category',
    'missions.location': 'Location',
    'missions.location.notSpecified': 'Not specified',
    'missions.offers': 'offer',
    'missions.offers.plural': 'offers',
    'missions.actions.viewOffers': 'View offers',
    'missions.actions.edit': 'Edit',
    'missions.actions.delete': 'Delete',
    'missions.actions.delete.confirm': 'Are you sure you want to delete this mission?',
    'missions.latestOffers': 'Latest offers received:',
    'missions.candidature': 'Application submitted',
    'missions.noMissions': 'You haven\'t published any missions yet',
    'missions.createFirstMission': 'Create my first mission',
    'missions.noBids': 'You haven\'t applied to any missions yet',
    'missions.discoverMissions': 'Discover missions',
    'missions.yourOffer': 'Your offer:',
    'missions.deadline': 'Deadline',
    'missions.deadline.days': 'days',
    'missions.deadline.notSpecified': 'Not specified',
    'missions.pending': 'Pending',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.confirm': 'Confirm',

    // Budget ranges
    'budget.range.0-500': '0 - 500€',
    'budget.range.500-2000': '500 - 2,000€',
    'budget.range.2000-5000': '2,000 - 5,000€',
    'budget.range.5000+': '5,000€+',

    // Toast messages
    'toast.mission.deleted': 'Mission deleted',
    'toast.mission.deleted.description': 'Your mission has been successfully deleted.',
    'toast.error.title': 'Error',
    'toast.error.deleteMission': 'Unable to delete mission.',</old_str>
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