
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SystemStatusBannerProps {
  isLoading?: boolean;
  hasError?: boolean;
  isFallbackMode?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export function SystemStatusBanner({
  isLoading = false,
  hasError = false,
  isFallbackMode = false,
  errorMessage,
  onRetry,
  className = ''
}: SystemStatusBannerProps) {
  // Ne rien afficher si tout va bien
  if (!isLoading && !hasError && !isFallbackMode) {
    return null;
  }

  const getStatusConfig = () => {
    if (isLoading) {
      return {
        icon: RefreshCw,
        color: 'blue',
        title: 'Chargement en cours...',
        message: 'Récupération des données',
        bgClass: 'bg-blue-50 border-blue-200',
        textClass: 'text-blue-800',
        iconClass: 'text-blue-500 animate-spin'
      };
    }

    if (isFallbackMode) {
      return {
        icon: AlertTriangle,
        color: 'orange',
        title: 'Mode dégradé',
        message: 'Le service fonctionne avec des fonctionnalités limitées',
        bgClass: 'bg-orange-50 border-orange-200',
        textClass: 'text-orange-800',
        iconClass: 'text-orange-500'
      };
    }

    if (hasError) {
      return {
        icon: XCircle,
        color: 'red',
        title: 'Problème technique',
        message: errorMessage || 'Une erreur est survenue',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-800',
        iconClass: 'text-red-500'
      };
    }

    return {
      icon: CheckCircle,
      color: 'green',
      title: 'Service opérationnel',
      message: 'Tout fonctionne normalement',
      bgClass: 'bg-green-50 border-green-200',
      textClass: 'text-green-800',
      iconClass: 'text-green-500'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`border rounded-lg p-4 ${config.bgClass} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.iconClass}`} />
          <div>
            <h4 className={`font-medium ${config.textClass}`}>
              {config.title}
            </h4>
            <p className={`text-sm ${config.textClass} opacity-80`}>
              {config.message}
            </p>
          </div>
        </div>
        
        {onRetry && (hasError || isFallbackMode) && (
          <button
            onClick={onRetry}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              config.color === 'orange' 
                ? 'bg-orange-200 hover:bg-orange-300 text-orange-800'
                : 'bg-red-200 hover:bg-red-300 text-red-800'
            }`}
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}
