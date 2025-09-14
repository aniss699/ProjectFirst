
# Plan de correction du chargement des missions marketplace

## Problème identifié
La page marketplace ne peut pas charger les missions à cause d'erreurs de schéma de base de données. L'API retourne une erreur 500 avec le message "Database schema issue - Please run database migrations".

## Analyse des causes racines

### 1. Erreurs de schéma détectées
- Le DTO mapper `mission-dto.ts` utilise des champs qui n'existent pas dans la table missions
- Incohérence entre le schéma Drizzle et la structure réelle de la base de données
- La colonne `excerpt` n'est pas correctement initialisée

### 2. Problèmes dans le code
- `/server/dto/mission-dto.ts` : Utilise des champs comme `location_data`, `budget_display` qui n'existent pas
- `/server/routes/missions.ts` : La route GET `/api/missions` échoue à cause du mapping incorrect
- `/client/src/pages/marketplace.tsx` : Gère mal les erreurs de l'API

## Plan d'exécution étape par étape

### Phase 1: Correction du schéma de base de données
1. ✅ Vérifier la structure actuelle de la table missions
2. ✅ Corriger les champs manquants ou incorrects
3. ✅ Exécuter les migrations nécessaires
4. ✅ Ajouter la colonne excerpt si manquante

### Phase 2: Correction du DTO mapper
1. ✅ Analyser les champs utilisés vs disponibles
2. ✅ Corriger le mapping dans `mission-dto.ts`
3. ✅ Adapter la logique de transformation des données

### Phase 3: Correction de la route API
1. ✅ Simplifier la requête dans `/server/routes/missions.ts`
2. ✅ Utiliser uniquement les champs existants
3. ✅ Améliorer la gestion d'erreurs

### Phase 4: Test et validation
1. ✅ Tester l'endpoint `/api/missions`
2. ✅ Vérifier le chargement de la page marketplace
3. ✅ Valider que les missions s'affichent correctement

### Phase 5: Optimisations
1. ✅ Améliorer la gestion d'erreurs côté client
2. ✅ Ajouter des logs pour le debugging
3. ✅ Optimiser les performances

## Fichiers à modifier

1. `/server/dto/mission-dto.ts` - Corriger le mapping des champs
2. `/server/routes/missions.ts` - Simplifier la requête GET missions
3. `/shared/schema.ts` - Vérifier/corriger le schéma Drizzle
4. `/client/src/pages/marketplace.tsx` - Améliorer la gestion d'erreurs
5. Scripts SQL pour corriger le schéma si nécessaire

## Critères de succès

- [ ] L'endpoint `/api/missions` retourne 200 avec des données valides
- [ ] La page marketplace charge sans erreur
- [ ] Les missions s'affichent correctement avec tous les champs
- [ ] Pas d'erreurs dans la console browser ou serveur
- [ ] Performance acceptable (< 2s pour charger les missions)

## Notes importantes

- Préserver la compatibilité avec les données existantes
- Éviter les migrations destructives
- Tester en mode production (environnement actuel)
- Documenter les changements pour référence future
