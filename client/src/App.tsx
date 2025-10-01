import React, { Suspense, useEffect, lazy } from 'react';
import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { LanguageProvider } from '@/hooks/use-language';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import { queryClient } from '@/lib/queryClient';

// Lazy load pages for better performance
const Home = React.lazy(() => import('@/pages/home'));
const Marketplace = React.lazy(() => import('@/pages/marketplace'));
const Missions = React.lazy(() => import('@/pages/missions'));
const CreateMissionPage = React.lazy(() => import('@/pages/create-mission'));
const Profile = React.lazy(() => import('@/pages/profile'));
const Dashboard = React.lazy(() => import('@/pages/dashboard'));
const Messages = React.lazy(() => import('@/pages/messages'));
const Services = React.lazy(() => import('@/pages/services'));
const Legal = React.lazy(() => import('@/pages/legal'));
const Sitemap = React.lazy(() => import('@/pages/sitemap'));
const Features = React.lazy(() => import('@/pages/features'));
const NotreConcept = React.lazy(() => import('@/pages/notre-concept'));

const DemoMissions = React.lazy(() => import('@/pages/demo-missions'));
const AvailableProviders = React.lazy(() => import('@/pages/available-providers'));
const AIMonitoring = React.lazy(() => import('@/pages/AIMonitoring'));
const LoginPage = React.lazy(() => import('@/pages/login'));
const Feed = React.lazy(() => import('@/pages/Feed'));
const AdminFeedMetrics = React.lazy(() => import('@/pages/AdminFeedMetrics'));
const NotFoundPage = React.lazy(() => import('@/pages/not-found'));
const FeedbackButtonsTest = React.lazy(() => import('@/components/ai/feedback-buttons-test'));

// Services pages
const ServicesPage = React.lazy(() => import('@/pages/services'));
const FlashDealPage = React.lazy(() => import('@/pages/services/FlashDealPage'));
const ReverseSubscriptionPage = React.lazy(() => import('@/pages/services/ReverseSubscriptionPage'));
const GroupRequestPage = React.lazy(() => import('@/pages/services/GroupRequestPage'));
const IaHumanPage = React.lazy(() => import('@/pages/services/IaHumanPage'));
const OpportunitiesPage = React.lazy(() => import('@/pages/services/OpportunitiesPage'));

// Lazy load the new Favorites page
const Favorites = React.lazy(() => import('@/pages/favorites'));

// Lazy load the mission detail page
const MissionDetailPage = React.lazy(() => import('@/pages/mission-detail'));

// Lazy load the simple mission detail page for testing
const MissionDetailSimple = React.lazy(() => import('@/pages/mission-detail-simple'));

// Lazy load the edit mission page
const EditMissionPage = React.lazy(() => import('@/pages/edit-mission'));

// Lazy load the mes demandes page
const MesDemandes = React.lazy(() => import('@/pages/mes-demandes'));

// Lazy load the advanced create mission page
const AdvancedCreateMissionPage = React.lazy(() => import('@/pages/progressive-flow'));


// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Debug pour Replit - affichage dans la console
    console.log('🚀 SWIDEAL App chargée avec succès');
    console.log('📍 URL actuelle:', window.location.href);
    console.log('🔧 User Agent:', navigator.userAgent);
    console.log('📱 Viewport:', window.innerWidth + 'x' + window.innerHeight);

    // Test de connectivité API
    fetch('/api/health')
      .then(res => res.json())
      .then(data => console.log('✅ API Health Check:', data))
      .catch(err => console.error('❌ API Health Check échoué:', err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <LanguageProvider>
          <AuthProvider>
            <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="pt-0 pb-16 md:pb-0">
                <Suspense fallback={<LoadingSpinner />}>
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/marketplace" component={Marketplace} />
                    <Route path="/missions" component={Missions} />
                    <Route path="/missions/:id" component={MissionDetailPage} />
                    <Route path="/missions-simple/:id" component={MissionDetailSimple} />
                    <Route path="/create-mission" component={CreateMissionPage} />
                    <Route path="/create-mission/advanced" component={AdvancedCreateMissionPage} />
                    {/* Route for editing missions - temporarily disabled due to type mismatch */}
                    {/* <Route path="/missions/edit/:missionId" component={EditMissionPage} /> */}
                    <Route path="/profile" component={Profile} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/messages" component={Messages} />
                    <Route path="/services" component={ServicesPage} />
                    <Route path="/services/flash" component={FlashDealPage} />
                    <Route path="/services/abonnement" component={ReverseSubscriptionPage} />
                    <Route path="/services/groupe" component={GroupRequestPage} />
                    <Route path="/services/cours" component={lazy(() => import('@/pages/services/CollectiveCoursesPage'))} />
                    <Route path="/services/opportunites" component={OpportunitiesPage} />
                    {/* Added routes for new services */}
                    <Route path="/services/construction-equipe" component={lazy(() => import('@/pages/services/TeamBuildingPage'))} />
                    <Route path="/services/concours-creatif" component={lazy(() => import('@/pages/services/CreativeContestPage'))} />
                    <Route path="/services/mission-miroir" component={lazy(() => import('@/pages/services/MirrorMissionPage'))} />
                    <Route path="/notre-concept" component={NotreConcept} />
                    <Route path="/legal" component={Legal} />
                    <Route path="/sitemap" component={Sitemap} />
                    <Route path="/features" component={Features} />

                    <Route path="/available-providers" component={AvailableProviders} />
                    <Route path="/demo/missions" component={DemoMissions} />
                    <Route path="/monitoring" component={AIMonitoring} />
                    <Route path="/feed" component={Feed} />
                    <Route path="/admin/feed-metrics" component={AdminFeedMetrics} />
                    <Route path="/test-feedback" component={FeedbackButtonsTest} />
                    <Route path="/login" component={LoginPage} />
                    {/* Added route for Favorites */}
                    <Route path="/favorites" component={Favorites} />
                    {/* Added route for Mes demandes */}
                    <Route path="/mes-demandes" component={MesDemandes} />
                    {/* Added route for Settings */}
                    <Route path="/settings" component={lazy(() => import('./pages/settings'))} />
                    <Route component={NotFoundPage} />
                  </Switch>
                </Suspense>
              </main>
              <Footer />
              <MobileBottomNav />
              <Toaster />
            </div>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;