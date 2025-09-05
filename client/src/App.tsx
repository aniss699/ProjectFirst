import React, { Suspense } from 'react';
import { Router, Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { queryClient } from '@/lib/queryClient';

// Lazy load pages for better performance
const Home = React.lazy(() => import('@/pages/home'));
const Marketplace = React.lazy(() => import('@/pages/marketplace'));
const Missions = React.lazy(() => import('@/pages/missions'));
const CreateMission = React.lazy(() => import('@/pages/create-mission'));
const Profile = React.lazy(() => import('@/pages/profile'));
const Dashboard = React.lazy(() => import('@/pages/dashboard'));
const Messages = React.lazy(() => import('@/pages/messages'));
const Services = React.lazy(() => import('@/pages/services'));
const Legal = React.lazy(() => import('@/pages/legal'));
const Sitemap = React.lazy(() => import('@/pages/sitemap'));
const Features = React.lazy(() => import('@/pages/features'));
const NotreConcept = React.lazy(() => import('@/pages/notre-concept'));
const AIHub = React.lazy(() => import('@/pages/ai-hub'));
const DemoMissions = React.lazy(() => import('@/pages/demo-missions'));
const AvailableProviders = React.lazy(() => import('@/pages/available-providers'));
const AIMonitoring = React.lazy(() => import('@/pages/AIMonitoring'));
const LoginPage = React.lazy(() => import('@/pages/login'));
const Feed = React.lazy(() => import('@/pages/Feed'));
const AdminFeedMetrics = React.lazy(() => import('@/pages/AdminFeedMetrics'));
const NotFound = React.lazy(() => import('@/pages/not-found'));
const FeedbackButtonsTest = React.lazy(() => import('@/components/ai/feedback-buttons-test'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="pt-0">
                <Suspense fallback={<LoadingSpinner />}>
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/marketplace" component={Marketplace} />
                    <Route path="/missions" component={Missions} />
                    <Route path="/create-mission" component={CreateMission} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/messages" component={Messages} />
                    <Route path="/services" component={Services} />
                    <Route path="/notre-concept" component={NotreConcept} />
                    <Route path="/legal" component={Legal} />
                    <Route path="/sitemap" component={Sitemap} />
                    <Route path="/features" component={Features} />
                    <Route path="/ai-hub" component={AIHub} />
                    {/* Redirects des anciennes pages IA vers le hub unifié */}
                    <Route path="/ai-features">
                      {() => { window.location.href = '/ai-hub?tab=algorithms'; return null; }}
                    </Route>
                    <Route path="/ai-dashboard">
                      {() => { window.location.href = '/ai-hub?tab=dashboard'; return null; }}
                    </Route>
                    <Route path="/ai-advanced">
                      {() => { window.location.href = '/ai-hub?tab=algorithms'; return null; }}
                    </Route>
                    <Route path="/ai-test">
                      {() => { window.location.href = '/ai-hub?tab=demo'; return null; }}
                    </Route>
                    <Route path="/demo/ia">
                      {() => { window.location.href = '/ai-hub?tab=demo'; return null; }}
                    </Route>
                    <Route path="/available-providers" component={AvailableProviders} />
                    <Route path="/demo/missions" component={DemoMissions} />
                    <Route path="/monitoring" component={AIMonitoring} />
                    <Route path="/feed" component={Feed} />
                    <Route path="/admin/feed-metrics" component={AdminFeedMetrics} />
                    <Route path="/test-feedback" component={FeedbackButtonsTest} />
                    <Route path="/login" component={LoginPage} />
                    <Route component={NotFound} />
                  </Switch>
                </Suspense>
              </main>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;