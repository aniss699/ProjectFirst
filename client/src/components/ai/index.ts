
// Lazy loading pour les composants AI lourds
import { lazy } from 'react';

// Composants critiques - chargement immédiat
export { BriefEnhancer } from './brief-enhancer';
export { MissionStandardizer } from './mission-standardizer';
export { AIAssistant } from './ai-assistant';

// Composants non-critiques - lazy loading optimisé
export const AdvancedAIDashboard = lazy(() => 
  import('./advanced-ai-dashboard').then(module => ({ default: module.AdvancedAIDashboard }))
);


export const MarketIntelligenceDashboard = lazy(() => 
  import('./market-intelligence-dashboard').then(module => ({ default: module.default }))
);

export const SmartBidAnalyzer = lazy(() => 
  import('./smart-bid-analyzer').then(module => ({ default: module.default }))
);

export const ProfileCompletenessAnalyzer = lazy(() => 
  import('./profile-completeness-analyzer').then(module => ({ default: module.ProfileCompletenessAnalyzer }))
);

export const MissionMatchingEngine = lazy(() => 
  import('./mission-matching-engine').then(module => ({ default: module.default }))
);

export const IntelligentDashboard = lazy(() => 
  import('./intelligent-dashboard').then(module => ({ default: module.IntelligentDashboard }))
);

// Types
export interface AIComponentProps {
  className?: string;
  onUpdate?: (data: any) => void;
}
