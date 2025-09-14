
# Plan de correction : Chargement des missions marketplace

## Problème identifié
La page marketplace ne peut pas charger les missions à cause d'une erreur 500 dans l'API `/api/missions`. L'erreur "Cannot convert undefined or null to object" indique une incompatibilité entre le schéma de base de données et le mapping des données.

## Analyse des causes racines

### 1. Erreur dans le DTO mapper
- Le fichier `server/dto/mission-dto.ts` utilise des champs inexistants
- Tentative de mapping de `location_data` comme objet alors qu'il pourrait être null
- Champs `budget_display` et autres non définis dans le schéma

### 2. Incohérence schéma/base de données
- Le schéma Drizzle utilise `location_data` en JSONB
- La route missions essaie de mapper des champs legacy
- Colonnes potentiellement manquantes ou mal typées

### 3. Gestion d'erreur frontend insuffisante
- La page marketplace ne récupère pas gracieusement des erreurs API
- Pas de fallback quand l'API échoue

## Plan d'exécution étape par étape

### Phase 1: Diagnostic et vérification de la base de données
1. **Vérifier la structure réelle de la table missions**
   - Examiner les colonnes existantes
   - Identifier les champs manquants ou mal typés
   - Vérifier les types de données JSONB

2. **Tester la connectivité base de données**
   - S'assurer que les connexions fonctionnent
   - Vérifier les permissions

### Phase 2: Correction du DTO mapper
1. **Analyser `server/dto/mission-dto.ts`**
   - Identifier tous les champs mappés
   - Comparer avec le schéma réel
   - Corriger les références de champs inexistants

2. **Implémenter un mapping sécurisé**
   - Ajouter des vérifications null/undefined
   - Utiliser des valeurs par défaut appropriées
   - Gérer les champs JSONB correctement

### Phase 3: Correction de la route missions
1. **Simplifier la requête GET `/api/missions`**
   - Utiliser des colonnes explicites au lieu de select()
   - Éviter le DTO mapper temporairement
   - Implémenter un mapping direct et sûr

2. **Ajouter une gestion d'erreur robuste**
   - Try/catch appropriés
   - Logs structurés pour debugging
   - Réponses d'erreur informatives

### Phase 4: Amélioration du frontend
1. **Renforcer la gestion d'erreur marketplace**
   - Meilleure UX quand l'API échoue
   - Retry automatique
   - Messages d'erreur utilisateur-friendly

2. **Ajouter des fallbacks**
   - Mode dégradé avec données de démo
   - Skeleton loading amélioré

### Phase 5: Tests et validation
1. **Tests unitaires pour le mapping**
   - Tester avec données réelles
   - Cas edge avec valeurs null/undefined
   - Validation de la structure de réponse

2. **Tests d'intégration**
   - Flux complet marketplace
   - Performance de chargement
   - Compatibilité mobile

## Ordre d'implémentation recommandé

### Correction immédiate (Quick Fix)
1. Bypasser le DTO mapper dans la route GET missions
2. Implémenter un mapping direct et simple
3. Tester le chargement marketplace

### Correction à moyen terme
1. Refactoriser le DTO mapper proprement
2. Standardiser la structure des réponses API
3. Améliorer la gestion d'erreur frontend

### Amélioration à long terme
1. Migration de schéma si nécessaire
2. Tests automatisés complets
3. Monitoring et alertes

## Fichiers à modifier prioritairement

### Critiques (blocants)
- `server/routes/missions.ts` - Ligne ~97 (route GET)
- `server/dto/mission-dto.ts` - Fonction mapMission
- `shared/schema.ts` - Vérification des types

### Importants (UX)
- `client/src/pages/marketplace.tsx` - Gestion d'erreur
- `server/database.ts` - Configuration connexion

### Optionnels (amélioration)
- Tests dans `scripts/`
- Monitoring dans `server/services/`

## Métriques de succès
- ✅ API `/api/missions` retourne 200
- ✅ Marketplace charge sans erreur 500
- ✅ Missions affichées correctement
- ✅ Performance < 2s de chargement
- ✅ Gestion d'erreur gracieuse

## Points de vigilance
- Ne pas casser les autres endpoints existants
- Maintenir la compatibilité avec le frontend
- Préserver les données existantes
- Tester sur différents environnements (dev/prod)

## Estimation
- **Temps total** : 2-3 heures
- **Complexité** : Moyenne
- **Risque** : Faible (corrections ciblées)
- **Impact** : Élevé (déblocage fonctionnalité principale)
