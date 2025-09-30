import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { HeroSection } from '@/components/home/hero-section';
import { ProgressiveFlow } from '@/components/home/progressive-flow';
import { Zap, MessageSquare, Star, Users, Clock } from 'lucide-react';
import { ROUTES } from '../routes/paths';
import { useLanguage } from '@/hooks/use-language';

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [initialStep, setInitialStep] = useState(-1);

  // Lire le paramètre step de l'URL de manière sûre
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get('step');
      if (stepParam) {
        const parsedStep = parseInt(stepParam);
        if (!isNaN(parsedStep)) {
          setInitialStep(parsedStep);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloc d'affichage progressif */}
        <div id="mission-creator" className="px-2 sm:px-0 relative">
          {/* Fond décoratif harmonisé */}
          <div className="absolute inset-0 bg-white rounded-3xl blur-2xl transform -rotate-1 scale-105"></div>
          <div className="absolute inset-0 bg-white rounded-3xl blur-xl transform rotate-1 scale-102"></div>
          <div className="relative z-10">
            <ProgressiveFlow 
              initialStep={initialStep}
              onComplete={(data) => {
                console.log('Données du projet:', data);
                // Rediriger vers la page des missions après création
                setLocation('/missions');
              }}
            />
          </div>
        </div>

        {/* Espacement important entre les sections */}
        <div className="h-24 md:h-32"></div>

        {/* Notre concept */}
        <div className="mb-16 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif'}}>
                {t('home.ourApproach.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.ourApproach.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Enchères inversées */}
              <div className="text-center">
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <svg className="relative w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.reverseAuction.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.reverseAuction.description')}
                </p>
                <div className="text-sm text-blue-700 bg-blue-50 rounded-lg p-3">
                  {t('home.reverseAuction.result')}
                </div>
              </div>

              {/* Mise en relation payante */}
              <div className="text-center">
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <svg className="relative w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.paidConnection.title')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('home.paidConnection.description')}
                </p>
                <div className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
                  {t('home.paidConnection.result')}
                </div>
              </div>
            </div>

            {/* Pourquoi ça marche */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('home.whyItWorks.title')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-orange-600 font-semibold mb-1">{t('home.whyItWorks.economical.title')}</div>
                  <div className="text-sm text-gray-600">{t('home.whyItWorks.economical.description')}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-purple-600 font-semibold mb-1">{t('home.whyItWorks.efficient.title')}</div>
                  <div className="text-sm text-gray-600">{t('home.whyItWorks.efficient.description')}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-emerald-600 font-semibold mb-1">{t('home.whyItWorks.profitable.title')}</div>
                  <div className="text-sm text-gray-600">{t('home.whyItWorks.profitable.description')}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-blue-600 font-semibold mb-1">{t('home.whyItWorks.immediate.title')}</div>
                  <div className="text-sm text-gray-600">{t('home.whyItWorks.immediate.description')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        

        
      </div>


    </div>
  );
}