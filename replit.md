# SwipDEAL - Plateforme de mise en relation client-prestataire

## Overview
SwipDEAL est une plateforme moderne de mise en relation entre clients et prestataires, intégrant des fonctionnalités d'intelligence artificielle pour optimiser les correspondances. L'application utilise React + TypeScript pour le frontend et Node.js/Express pour le backend.

## Recent Changes

### 2025-10-01 - GitHub Import and Environment Cleanup
- **GitHub Import Completed**: Successfully imported and configured project from GitHub
- **Changes**:
  - ✅ Removed unnecessary Docker files (Dockerfiles, docker-compose.yml, cloudbuild.yaml)
  - ✅ Cleaned up backup files (server/index-old.ts.backup)
  - ✅ Created .gitignore file for proper version control
  - ✅ Configured workflow with webview output on port 5000
  - ✅ Verified Vite configuration (host: 0.0.0.0, port: 5000)
  - ✅ Confirmed CORS allows all origins in development mode
  - ✅ Database connected to Replit PostgreSQL
  - ✅ Deployment configured (autoscale, npm build, npm start)
- **Removed Files**: Dockerfiles, docker-compose, test files, infrastructure docs
- **Status**: ✅ Application fully functional and ready for development

### 2025-09-26 - Replit Environment Setup Complete
- **Setup Completed**: Successfully configured project for Replit environment
- **Changes**:
  - Verified Vite configuration with host: '0.0.0.0' and port 5000
  - Confirmed CORS configuration allows all origins in development
  - Set up workflow with webview output type on port 5000
  - Configured deployment with autoscale, npm build, and npm start
  - Database connection working with Replit PostgreSQL
- **Status**: ✅ Application fully functional and ready for development

### 2025-01-03 - Migration Database Connection
- **Issue Fixed**: Résolution d'un problème de connexion à la base de données PostgreSQL locale
- **Changes**: 
  - Migration de `@neondatabase/serverless` vers `pg` package
  - Remplacement de `drizzle-orm/neon-http` par `drizzle-orm/node-postgres`
  - Mise à jour de tous les fichiers utilisant les connexions base de données
- **Files Updated**:
  - `server/services/mission-sync.ts`
  - `server/api-routes.ts`
  - `server/seed-demo.ts`  
  - `server/seed-feed-data.ts`
  - `server/auth-routes.ts`
  - `apps/api/src/ai/persisters/prismaSink.ts`
- **Result**: Élimination des erreurs de certificat SSL et connexion stable à PostgreSQL

## Project Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL avec Drizzle ORM
- **AI Integration**: Google Gemini API
- **UI Components**: Radix UI, Lucide React

### Database Configuration
- **Driver**: PostgreSQL avec `pg` package
- **ORM**: Drizzle avec `drizzle-orm/node-postgres`
- **Connection String**: `postgresql://postgres:password@helium/heliumdb?sslmode=disable`
- **Schema**: Défini dans `shared/schema.ts`

### Key Features
- Authentication système avec rôles (CLIENT, PRO, ADMIN)
- Mission matching avec scoring IA
- Feed personnalisé d'annonces
- Système de réputation et badges
- Analytics avancées
- Interface de chat intégrée

## User Preferences
- Code style: TypeScript strict, imports organisés
- Database: Préférence pour PostgreSQL avec connexions directes
- Error handling: Logging détaillé avec gestion gracieuse des erreurs
- Architecture: Séparation claire frontend/backend, composants réutilisables

## Development Environment
- Node.js 20
- Package manager: npm
- Dev server: tsx pour hot reload
- Port: 5000 (frontend et API)

## Deployment Configuration
- **Type**: autoscale (pour les applications web stateless)
- **Build**: `npm run build` (compile frontend avec Vite + backend avec esbuild)
- **Run**: `npm start` (démarre en mode production NODE_ENV=production)
- **Production URL**: Disponible après publication sur `<app-name>.replit.app`

## Database Tables
- `users`: Utilisateurs (clients, prestataires, admins)
- `projects`: Projets postés par les clients
- `bids`: Offres des prestataires sur les projets
- `announcements`: Feed d'annonces
- `aiEvents`: Logs des événements IA

## Recent Bug Fixes
- ✅ Certificate chain errors with database connections resolved
- ✅ Mission sync service working correctly
- ✅ Authentication routes functional

## Next Steps
- Monitor database performance with new pg driver
- Consider adding connection pooling optimizations
- Implement better error handling for database operations