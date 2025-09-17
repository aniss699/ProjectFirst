
# Instruction10 - Correction de la page de détail des missions

## Analyse du problème

### Symptôme observé
- Page blanche lors du clic sur une mission depuis le marketplace
- Les logs montrent que les données sont bien chargées (`✅ Mission normalisée chargée`)
- L'erreur React #310 apparaît dans la console (erreur de rendu)

### Fichiers identifiés dans l'analyse

#### 1. Page principale de détail
- `client/src/pages/mission-detail.tsx` - Page de détail complète avec onglets

#### 2. Routage et navigation  
- Navigation depuis `marketplace.tsx` vers `/missions/:id`
- Routing géré par `wouter`

#### 3. Services API
- `client/src/lib/api/services.ts` - Service `dataApi.getMissionById()`
- `server/routes/missions.ts` - Endpoint GET `/api/missions/:id`

#### 4. Mappers et types
- `server/dto/mission-dto.ts` - Mapper `mapMission()`
- `shared/types.ts` - Types `MissionView`, `BidView`

## Problèmes identifiés

### 1. Erreur React #310
L'erreur React #310 indique un problème de rendu, probablement :
- Hook appelé conditionnellement
- Composant qui retourne undefined/null de façon inattendue
- Props invalides passées à un composant

### 2. Conflits potentiels de routage
- Route `/missions/:id` pourrait confliter avec d'autres routes
- Paramètre `id` mal extrait ou non défini

### 3. Problèmes de données
- Mission chargée mais structure de données incompatible
- Props manquantes ou undefined dans les composants

### 4. Problèmes de rendu conditionnel
- Conditions de rendu qui causent des hooks conditionnels
- États de loading/error mal gérés

## Plan de correction étape par étape

### Étape 1 : Vérifier la configuration du routage
- [ ] Vérifier la route dans le routeur principal
- [ ] S'assurer que le paramètre `:id` est correctement extrait
- [ ] Tester la navigation programmatique

### Étape 2 : Analyser la structure de données
- [ ] Vérifier que `mapMission()` retourne une structure cohérente
- [ ] Valider que tous les champs requis sont présents
- [ ] Tester l'endpoint API indépendamment

### Étape 3 : Corriger les problèmes de rendu
- [ ] Identifier les hooks conditionnels
- [ ] Corriger les conditions de rendu
- [ ] Ajouter des gardes de sécurité pour les données

### Étape 4 : Améliorer la gestion d'erreur
- [ ] Ajouter des logs de debug détaillés
- [ ] Améliorer les états de loading/error
- [ ] Ajouter des fallbacks pour les données manquantes

### Étape 5 : Tests et validation
- [ ] Tester le flow complet de navigation
- [ ] Vérifier l'affichage sur différents types de missions
- [ ] Valider les interactions (onglets, boutons)

## Actions immédiates à entreprendre

1. **Diagnostic initial** : Ajouter des logs de debug dans `mission-detail.tsx`
2. **Vérification API** : Tester l'endpoint `/api/missions/:id` directement
3. **Analyse des hooks** : Identifier les hooks potentiellement conditionnels
4. **Correction du rendu** : Corriger les problèmes de structure conditionnelle

## État de la base de données

D'après les logs, la base de données PostgreSQL Google Cloud est correctement configurée et les données sont accessibles. Le problème semble être côté frontend dans le rendu React.
