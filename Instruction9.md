# Plan d'implémentation : Onglets pour missions d'équipe dans le détail marketplace

## Analyse de la situation actuelle

### ✅ Ce qui fonctionne déjà
1. **Infrastructure de données** : 
   - Table `missions` avec champs `is_team_mission` et `team_size`
   - Type `MissionView` avec `teamRequirements?: TeamRequirement[]`
   - Interface `TeamRequirement` complète avec tous les champs nécessaires

2. **Détection des missions d'équipe** :
   - Ligne 150 dans `mission-detail-modal.tsx` : `const isTeamMission = mission.teamRequirements && mission.teamRequirements.length > 0;`

3. **Système d'onglets** :
   - Import des composants Tabs (ligne 18)
   - Variables d'état : `activeTab` et fonction `handleTabChange` (lignes 53-155)

4. **Support backend** :
   - API endpoints fonctionnels
   - Candidatures équipes via `BidTabs` component

### ❌ Problème identifié
**La modal `MissionDetailModal` affiche toujours un contenu linéaire uniforme, même pour les missions d'équipe. Elle ne tire pas parti du système d'onglets conditionnel selon le type de mission.**

## Fichiers concernés

### Fichier principal à modifier
- `client/src/components/missions/mission-detail-modal.tsx` (lignes 225+)

### Fichiers de référence
- `shared/types.ts` (types `MissionView` et `TeamRequirement`)
- `client/src/components/ui/tabs.tsx` (composants Tabs)
- `client/src/components/missions/bid-tabs.tsx` (exemple d'utilisation d'onglets)

## Plan étape par étape

### Étape 1 : Analyser la structure actuelle de la modal
**Objectif** : Comprendre le contenu actuel et identifier les sections à réorganiser

**Actions** :
1. Lire le contenu complet de `mission-detail-modal.tsx` à partir de la ligne 225
2. Identifier les sections qui sont actuellement affichées linéairement :
   - Description du projet
   - Informations budget/localisation/candidatures
   - Actions pour prestataires (BidTabs)
   - Autres sections

### Étape 2 : Concevoir la structure d'onglets pour les missions d'équipe
**Objectif** : Définir quels onglets afficher quand `isTeamMission === true`

**Onglets proposés** :
1. **"Vue d'ensemble"** : Informations générales (description, budget, localisation, etc.)
2. **"Exigences d'équipe"** : Détail des rôles requis (`teamRequirements`)
3. **"Candidatures"** : Offres reçues avec `BidTabs`
4. **"Actions"** (optionnel) : Actions spécifiques aux équipes

### Étape 3 : Créer le composant d'affichage des exigences d'équipe
**Objectif** : Créer un composant dédié pour afficher les `TeamRequirement[]`

**Actions** :
1. Créer un nouveau composant `TeamRequirementsView` 
2. Afficher chaque rôle avec :
   - Profession et description
   - Compétences requises
   - Budget et durée estimés
   - Niveau d'expérience minimum
   - Statut lead/importance

### Étape 4 : Modifier la logique d'affichage conditionnelle
**Objectif** : Implémenter l'affichage d'onglets pour les missions d'équipe

**Actions** :
1. **Dans `mission-detail-modal.tsx`** :
   - Remplacer le contenu linéaire actuel par un affichage conditionnel
   - Si `isTeamMission === false` : garder l'affichage actuel
   - Si `isTeamMission === true` : afficher le système d'onglets

2. **Structure conditionnelle** :
```typescript
{isTeamMission ? (
  // Système d'onglets pour missions d'équipe
  <Tabs value={activeTab} onValueChange={handleTabChange}>
    <TabsList>
      <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
      <TabsTrigger value="team">Exigences d'équipe</TabsTrigger>
      <TabsTrigger value="bids">Candidatures</TabsTrigger>
    </TabsList>
    
    <TabsContent value="overview">
      {/* Contenu vue d'ensemble */}
    </TabsContent>
    
    <TabsContent value="team">
      <TeamRequirementsView requirements={mission.teamRequirements} />
    </TabsContent>
    
    <TabsContent value="bids">
      {/* BidTabs et gestion candidatures */}
    </TabsContent>
  </Tabs>
) : (
  // Affichage linéaire actuel pour missions individuelles
  <>
    {/* Contenu existant */}
  </>
)}
```

### Étape 5 : Réorganiser le contenu existant
**Objectif** : Distribuer le contenu actuel dans les onglets appropriés

**Actions** :
1. **Onglet "Vue d'ensemble"** :
   - Description du projet
   - Informations budget/localisation
   - Statistiques générales

2. **Onglet "Exigences d'équipe"** :
   - Nouveau composant `TeamRequirementsView`
   - Affichage structuré des `TeamRequirement[]`

3. **Onglet "Candidatures"** :
   - Composant `BidTabs` existant
   - Gestion des candidatures équipes

### Étape 6 : Améliorer l'UX des onglets
**Objectif** : Optimiser l'expérience utilisateur

**Actions** :
1. Ajouter des badges avec compteurs :
   - "Candidatures (X)" avec le nombre d'offres
   - "Exigences d'équipe (X)" avec le nombre de rôles
2. Icônes appropriées pour chaque onglet
3. Gestion de l'onglet par défaut (overview)

### Étape 7 : Tests et validation
**Objectif** : Vérifier que la fonctionnalité fonctionne correctement

**Actions** :
1. Tester avec une mission individuelle (pas d'onglets)
2. Tester avec une mission d'équipe (onglets affichés)
3. Vérifier la navigation entre onglets
4. Valider l'affichage des `teamRequirements`
5. Tester les candidatures dans l'onglet dédié

## Complexité et faisabilité

### ✅ Très faisable
- L'infrastructure existe déjà (types, détection, composants)
- Le système d'onglets est déjà importé et configuré
- Variables d'état déjà en place

### ⚠️ Points d'attention
1. **Réorganisation du contenu** : Attention à ne pas casser l'affichage existant pour les missions individuelles
2. **Gestion d'état** : S'assurer que l'état des onglets se réinitialise correctement entre les missions
3. **Responsive design** : Vérifier que les onglets s'affichent bien sur mobile

### 🎯 Impact estimé
- **Effort** : 2-3 heures de développement
- **Risque** : Faible (infrastructure existante)
- **Valeur** : Haute (améliore significativement l'UX pour les missions d'équipe)

## Recommandations

1. **Commencer par l'étape 1** pour bien comprendre la structure actuelle
2. **Créer d'abord le composant `TeamRequirementsView`** de manière isolée
3. **Implémenter progressivement** l'affichage conditionnel pour minimiser les risques
4. **Tester fréquemment** pendant le développement

## Notes importantes

- La détection `isTeamMission` fonctionne déjà correctement
- Les types TypeScript sont bien définis et complets
- Le composant `BidTabs` fonctionne déjà pour les candidatures équipes
- La solution s'intègre parfaitement dans l'architecture existante

## Conclusion

Cette tâche est **définitivement possible** et s'appuie sur une infrastructure déjà bien établie. Le problème principal est que la modal n'exploite pas le système d'onglets conditionnel selon le type de mission. L'implémentation sera principalement une réorganisation du contenu existant plutôt qu'un développement from scratch.