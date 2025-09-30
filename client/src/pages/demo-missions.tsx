
// Cette page démo a été supprimée pour nettoyer l'application
// Redirection vers le marketplace principal
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function DemoMissions() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation('/marketplace');
  }, [setLocation]);

  return null;
}
