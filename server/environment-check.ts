
export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'GEMINI_API_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables d\'environnement manquantes:', missing);
    console.warn('📝 Ajoutez-les dans l\'onglet Secrets de Replit pour une fonctionnalité complète');
    
    // Exit if critical variables are missing
    if (missing.includes('DATABASE_URL')) {
      console.error('❌ DATABASE_URL is required');
      process.exit(1);
    }
  }

  console.log('✅ Variables d\'environnement validées');
  
  // Set production mode if not defined
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  
  // Log de l'environnement (sans révéler les secrets)
  console.log('🔍 Configuration d\'environnement:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Configuré' : '❌ Manquant',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Configuré' : '❌ Manquant',
    PORT: process.env.PORT || 5000
  });
}
