
# Instructions de Correction - Flux Missions Production

## Analyse des Problèmes Identifiés

### 1. **Problème Principal : Erreur 500 sur /api/missions**
- **Localisation** : `server/routes/missions.ts` ligne ~200+ (route GET /)
- **Cause** : Erreur dans la requête Drizzle ORM lors du SELECT des missions
- **Symptôme** : Console log montre "500: Internal server error" sur marketplace

### 2. **Problème de Configuration Base de Données**
- **Localisation** : `server/database.ts`
- **Cause potentielle** : Connexion PostgreSQL Replit mal configurée en production
- **Impact** : Toutes les opérations DB échouent

### 3. **Problème de Synchronisation Missions → Feed**
- **Localisation** : `server/services/mission-sync.ts`
- **Cause** : Service de sync non appelé correctement après création de mission
- **Impact** : Les missions créées n'apparaissent pas dans le marketplace

### 4. **Problème de Structure des Données**
- **Localisation** : Schéma `shared/schema.ts` vs vraie structure DB
- **Cause** : Désynchronisation entre le schéma Drizzle et la structure réelle de la DB
- **Impact** : Erreurs de mapping des colonnes

## Plan de Correction Étape par Étape

### ÉTAPE 1 : Diagnostiquer la Base de Données
1. **Vérifier la connexion DB**
   - Tester `DATABASE_URL` en production
   - Valider que les tables existent
   - Vérifier les permissions

2. **Synchroniser le schéma**
   - Comparer `shared/schema.ts` avec la structure réelle
   - Appliquer les migrations manquantes
   - Corriger les types de colonnes

### ÉTAPE 2 : Corriger les Routes API Missions
1. **Fixer GET /api/missions**
   - Simplifier la requête SELECT pour éviter les erreurs de mapping
   - Ajouter une gestion d'erreur robuste
   - Tester la réponse JSON

2. **Fixer POST /api/missions**
   - Valider que l'insertion fonctionne
   - Corriger le mapping des champs (notamment `postal_code`)
   - Améliorer la validation des données

3. **Fixer GET /api/missions/:id**
   - Corriger la gestion des IDs invalides
   - Simplifier la requête JOIN avec bids

### ÉTAPE 3 : Réparer le Service de Synchronisation
1. **Corriger MissionSyncService**
   - Fixer les appels à la table `announcements`
   - Corriger les types de données
   - Ajouter une gestion d'erreur pour les échecs de sync

2. **Intégrer la sync automatique**
   - Appeler automatiquement après création de mission
   - Ajouter logs pour debugging
   - Gérer les cas d'échec gracieusement

### ÉTAPE 4 : Optimiser les Pages Frontend
1. **Marketplace** (`client/src/pages/marketplace.tsx`)
   - Améliorer la gestion d'erreur
   - Ajouter retry automatique
   - Optimiser le polling

2. **Mes Missions** (`client/src/pages/missions.tsx`)
   - Fixer la requête par user_id
   - Corriger l'affichage des bids
   - Améliorer la gestion des états

### ÉTAPE 5 : Tests et Validation
1. **Test de bout en bout**
   - Créer une mission → Vérifier DB → Vérifier marketplace
   - Tester la modification de mission
   - Tester la suppression de mission

2. **Test de performance**
   - Vérifier les temps de réponse
   - Optimiser les requêtes lentes
   - Ajouter du cache si nécessaire

## Fichiers Critiques à Modifier

### 1. **server/routes/missions.ts**
- **Problème** : Erreur dans SELECT missions (ligne ~200)
- **Solution** : Simplifier la requête, améliorer error handling
- **Priorité** : CRITIQUE

### 2. **server/database.ts**
- **Problème** : Configuration Replit PostgreSQL
- **Solution** : Valider connection string, ajouter pooling
- **Priorité** : CRITIQUE

### 3. **shared/schema.ts**
- **Problème** : Schéma désynchronisé avec DB réelle
- **Solution** : Audit complet des types, correction des colonnes
- **Priorité** : HAUTE

### 4. **server/services/mission-sync.ts**
- **Problème** : Erreurs dans upsert announcements
- **Solution** : Corriger les types, simplifier la logique
- **Priorité** : HAUTE

### 5. **client/src/pages/marketplace.tsx**
- **Problème** : Gestion d'erreur insuffisante
- **Solution** : Retry automatique, meilleur feedback utilisateur
- **Priorité** : MOYENNE

## Actions Immédiates Recommandées

### 1. **Debug Urgent - Route GET /api/missions**
```bash
# Ajouter logs détaillés dans missions.ts ligne ~200
# Capturer l'erreur SQL exacte
# Tester avec une requête simplifiée
```

### 2. **Vérification DB Production**
```bash
# Se connecter à la DB Replit
# Lister les tables existantes
# Vérifier la structure de la table missions
# Compter les enregistrements
```

### 3. **Test API Immédiat**
```bash
# GET /api/missions/health
# GET /api/missions/debug
# POST /api/missions avec données minimales
```

## Critères de Succès

✅ **Étape 1 réussie quand** :
- GET /api/missions retourne 200 avec array de missions
- Pas d'erreur 500 dans les logs

✅ **Étape 2 réussie quand** :
- POST /api/missions crée une mission en DB
- La mission apparaît dans GET /api/missions

✅ **Étape 3 réussie quand** :
- Marketplace affiche les missions sans erreur
- "Mes missions" affiche les missions de l'utilisateur

✅ **Étape 4 réussie quand** :
- Flux complet création → affichage fonctionne
- Performance acceptable (<2s)

## Notes Techniques

### Base de Données Replit PostgreSQL
- Utilise Neon comme provider
- Connection pooling recommandé
- Variables d'environnement : `DATABASE_URL`

### Architecture API
- Express.js avec Drizzle ORM
- Middleware de validation
- Gestion d'erreur centralisée

### Frontend React
- TanStack Query pour cache API
- Wouter pour routing
- Tailwind pour UI

## Prochaines Étapes

1. **Commencer par diagnostiquer la DB** (30 min)
2. **Fixer GET /api/missions** (1h)
3. **Tester POST /api/missions** (30 min)
4. **Valider le flux complet** (1h)
5. **Optimiser et documenter** (30 min)

**Temps estimé total : 3.5 heures**

---

*Ce plan est basé sur l'analyse du code dans `server/routes/missions.ts`, `client/src/pages/marketplace.tsx`, et les logs d'erreur observés en production.*
