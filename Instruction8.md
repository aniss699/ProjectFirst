# Instruction 8 - Correction du problème des missions en équipe non affichées sur le marketplace

## Analyse du problème

### 🔍 Problème principal identifié
Les missions "en équipe" ne s'affichent pas sur la page marketplace parce que l'API `/api/missions` génère des erreurs 500 qui empêchent la récupération de toutes les missions.

### 🚨 Cause racine trouvée
**Incompatibilité de schéma de base de données** : Le code dans `server/routes/missions.ts` tente d'accéder à des colonnes de localisation qui n'existent plus dans le schéma actuel.

**Schéma réel (dans `shared/schema.ts`)** :
```typescript
// Localisation unifiée en JSON
location_data: jsonb('location_data'),
```

**Code problématique (dans `server/routes/missions.ts`, lignes 709-713)** :
```typescript
location_raw: missionsTable.location_raw,     // ❌ N'existe pas
postal_code: missionsTable.postal_code,       // ❌ N'existe pas  
city: missionsTable.city,                     // ❌ N'existe pas
country: missionsTable.country,               // ❌ N'existe pas
remote_allowed: missionsTable.remote_allowed, // ❌ N'existe pas
```

### 🎯 Impact sur les missions en équipe
1. **Création** : ✅ Fonctionnelle (j'ai vu dans les logs qu'une mission team a été créée avec l'ID "team-1757922241162")
2. **Stockage** : ✅ Les champs `is_team_mission` et `team_size` existent dans le schéma
3. **Récupération** : ❌ Impossible à cause des erreurs 500 de l'API
4. **Affichage** : ❌ Le marketplace ne peut pas récupérer les missions

### 📊 Logs d'erreur spécifiques
```
❌ Erreur API missions utilisateur: 500 
{"ok":false,"error":"Internal server error","details":"An error occurred"}
```

### 🔧 Autres erreurs LSP trouvées
- 40 erreurs dans `server/routes/missions.ts`
- Types incompatibles pour les champs `excerpt` (null vs undefined)
- Champs de localisation inexistants dans plusieurs endroits

## Plan de correction étape par étape

### Phase 1 : Audit et préparation 🔍
**Objectif** : Comprendre l'état actuel et préparer les corrections
- [x] Analyser la structure des données des missions en équipe
- [x] Identifier toutes les occurrences des champs obsolètes
- [x] Vérifier le schéma actuel vs code utilisé
- [x] Documenter les erreurs LSP

### Phase 2 : Correction des routes API 🛠️
**Objectif** : Corriger les erreurs 500 dans l'API missions
- [ ] Corriger les champs de localisation dans `server/routes/missions.ts`
  - Remplacer `location_raw`, `postal_code`, `city`, `country`, `remote_allowed` 
  - Utiliser uniquement `location_data` (JSONB)
- [ ] Corriger les types incompatibles (excerpt null vs undefined)
- [ ] Tester l'endpoint `/api/missions` pour vérifier qu'il ne génère plus d'erreurs
- [ ] Tester l'endpoint `/api/missions/users/:userId/missions`

### Phase 3 : Validation du mapping des données 🔄
**Objectif** : S'assurer que les données sont correctement normalisées
- [ ] Vérifier que `mapToMissionView` gère correctement `location_data`
- [ ] Tester que les missions en équipe sont correctement mappées (champs `is_team_mission`, `team_size`)
- [ ] Valider que `dataApi.getMissions()` récupère toutes les missions

### Phase 4 : Test du marketplace 🏪
**Objectif** : Vérifier que les missions en équipe s'affichent
- [ ] Tester l'affichage des missions sur la page marketplace
- [ ] Créer une nouvelle mission en équipe de test
- [ ] Vérifier qu'elle apparaît immédiatement sur le marketplace
- [ ] Tester les filtres et la recherche avec les missions en équipe

### Phase 5 : Validation complète ✅
**Objectif** : S'assurer que tout fonctionne correctement
- [ ] Tester le flow complet : création → affichage → interaction
- [ ] Vérifier les performances (pas de régression)
- [ ] Tester avec différents types de missions (individuelles + équipe)
- [ ] Documenter les corrections apportées

## Fichiers impactés

### Fichiers principaux à corriger
1. **`server/routes/missions.ts`** (40 erreurs LSP)
   - Lignes 709-713 : champs de localisation obsolètes
   - Lignes 824-828 : mêmes champs obsolètes
   - Types incompatibles pour excerpt

2. **`shared/mappers.ts`** (optionnel)
   - Vérifier le mapping de `location_data`

### Fichiers de référence
1. **`shared/schema.ts`** : Schéma de référence correct
2. **`client/src/pages/marketplace.tsx`** : Page qui affiche les missions
3. **`client/src/lib/api/services.ts`** : Service qui récupère les missions

## Priorisation des corrections

### 🔥 Critique (Phase 1)
- Corriger les erreurs de schéma dans `server/routes/missions.ts`
- Restaurer le fonctionnement de l'API `/api/missions`

### 🟡 Important (Phase 2) 
- Valider le mapping des données de localisation
- Tester les missions en équipe spécifiquement

### 🟢 Optionnel (Phase 3)
- Optimiser les performances si nécessaire
- Améliorer la gestion d'erreurs

## Résultat attendu

Après correction :
1. ✅ L'API `/api/missions` fonctionne sans erreur 500
2. ✅ Le marketplace affiche toutes les missions (individuelles + équipe)
3. ✅ Les missions en équipe sont visibles immédiatement après création
4. ✅ Les filtres et recherches fonctionnent avec tous types de missions
5. ✅ Plus d'erreurs LSP dans le code

## Validation finale

- [ ] Zéro erreur 500 dans les logs
- [ ] Marketplace affiche N missions (N > 0)
- [ ] Mission en équipe de test visible et interactive
- [ ] Tous les tests de régression passent

---

**Date de création** : 15 septembre 2025  
**Statut** : Phase 1 en cours  
**Complexité estimée** : Moyenne (corrections de schéma)  
**Temps estimé** : 2-3 heures  