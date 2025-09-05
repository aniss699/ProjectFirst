import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft, Search, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ROUTES } from "@/routes/paths";

export default function NotFound() {
  const [location] = useLocation();

  const popularPages = [
    { path: ROUTES.HOME, label: 'Accueil', icon: Home },
    { path: ROUTES.MARKETPLACE, label: 'Missions', icon: Search },
    { path: ROUTES.CREATE_MISSION, label: 'Créer mission', icon: Plus },
    { path: ROUTES.MARKETPLACE, label: 'Prestataires', icon: Search },
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-3 items-center">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">404 - Page introuvable</h1>
              <p className="text-sm text-gray-600 mt-1">
                La page "{location}" n'existe pas ou a été déplacée.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button asChild variant="default">
              <Link href={ROUTES.HOME}>
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Pages populaires :
            </p>
            <div className="grid grid-cols-1 gap-2">
              {popularPages.map(({ path, label, icon: Icon }) => (
                <Button key={path} asChild variant="ghost" className="justify-start h-auto p-3">
                  <Link href={path}>
                    <Icon className="h-4 w-4 mr-3" />
                    <span>{label}</span>
                    <span className="ml-auto text-xs text-gray-400">{path}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Astuce :</strong> Vérifiez l'URL dans la barre d'adresse ou utilisez la navigation ci-dessus.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
