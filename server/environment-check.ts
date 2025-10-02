
export function validateEnvironment() {
  // Vérifier DATABASE_URL (critique)
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required. Please set up Replit PostgreSQL in the Database tab.');
    process.exit(1);
  }

  // Vérifier GEMINI_API_KEY (optionnel pour IA)
  const optionalVars = ['GEMINI_API_KEY'];
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  
  if (missingOptional.length > 0) {
    console.warn('⚠️ Variables optionnelles manquantes:', missingOptional);
    console.warn('📝 Ajoutez-les dans l\'onglet Secrets de Replit pour activer les fonctionnalités IA');
  }

  console.log('✅ Variables d\'environnement validées');
  
  // Set production mode if not defined
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  
  // Log de l'environnement (sans révéler les secrets)
  console.log('🔍 Configuration d\'environnement:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: '✅ Replit PostgreSQL',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '✅ Configuré' : '⚠️ Non configuré',
    PORT: process.env.PORT || 5000
  });
}
