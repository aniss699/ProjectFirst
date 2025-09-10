# SwipDEAL - Plateforme de mise en relation client-prestataire

## Overview
SwipDEAL est une plateforme moderne de mise en relation entre clients et prestataires, intégrant des fonctionnalités d'intelligence artificielle pour optimiser les correspondances. L'application utilise React + TypeScript pour le frontend et Node.js/Express pour le backend.

## Recent Changes

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