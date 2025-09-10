import { createRoot } from "react-dom/client";
import App from "./App";
import './index.css';

// Gestion des erreurs de préchargement CSS
window.addEventListener('error', (event) => {
  if (event.message?.includes('Unable to preload CSS')) {
    console.warn('CSS preload failed (non-critical):', event.filename);
    // Empêcher la propagation de l'erreur pour éviter les logs d'erreur
    event.preventDefault();
  }
});

// Gestion des erreurs de ressources non critiques
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('CSS') || event.reason?.message?.includes('preload')) {
    console.warn('CSS loading promise rejected (non-critical):', event.reason);
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);