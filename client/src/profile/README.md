
# Module Profil - AppelsPro

## Vue d'ensemble

Le module profil offre une solution complète pour la gestion des profils utilisateurs (clients et prestataires) avec intégration IA pour l'optimisation et la complétude.

## Architecture

```
client/src/profile/
├── ProfileDashboard.tsx      # Dashboard principal avec analyse de complétude
├── ProfileWizard.tsx         # Assistant multi-étapes d'édition
├── ProfilePublicView.tsx     # Vue publique respectant la confidentialité
├── useProfile.ts             # Hook de gestion des données
├── components/
│   ├── KeywordsSkillsEditor.tsx    # Éditeur de tags et compétences
│   └── AIAssistButtons.tsx         # Boutons d'assistance IA
└── README.md
```

## Fonctionnalités

### 🎯 Score de Complétude
- Calcul automatique du pourcentage de complétude (0-100%)
- Identification des éléments manquants par priorité
- Suggestions d'amélioration personnalisées

### 🧠 Assistant IA
- Amélioration de texte (bio, titre professionnel)
- Génération de mots-clés depuis le contenu
- Suggestions de compétences
- Fallback local si IA indisponible

### 🏷️ Système de Tags
- Normalisation automatique des mots-clés
- Expansion des synonymes (dictionnaire FR)
- Suggestions contextuelles
- Niveaux de compétences (1-5 étoiles)

### 🔒 Confidentialité
- 3 niveaux de visibilité : Public, Privé, Anonymisé
- Conformité RGPD avec consentement explicite
- Anonymisation automatique des données sensibles

## Routes

- `/profil` - Dashboard principal
- `/profil/editer` - Assistant d'édition (6 étapes)
- `/profil/:userId` - Vue publique

## Intégration

### Ajouter les routes dans votre router :

```typescript
import { ProfileDashboard } from './profile/ProfileDashboard';
import { ProfileWizard } from './profile/ProfileWizard'; 
import { ProfilePublicView } from './profile/ProfilePublicView';

// Dans vos routes :
<Route path="/profil" element={<ProfileDashboard />} />
<Route path="/profil/editer" element={<ProfileWizard />} />
<Route path="/profil/:userId" element={<ProfilePublicView />} />
```

### API Backend (optionnel)

Si vous avez une API backend, créez ces endpoints :

```
GET    /api/profile/me           # Profil utilisateur courant
PUT    /api/profile/me           # Mise à jour profil
GET    /api/profile/:id/public   # Vue publique d'un profil
```

Sinon, le module fonctionne avec le localStorage comme fallback.

## Étapes du Wizard

1. **Informations générales** - Photo, nom, titre, bio
2. **Localisation & Langues** - Ville, pays, langues parlées  
3. **Compétences & Mots-clés** - Tags, compétences avec niveaux
4. **Portfolio & Certifications** - Projets, références, diplômes
5. **Disponibilité & Tarifs** - Modes de travail, tarification
6. **Préférences & Confidentialité** - Visibilité, consentement RGPD

## Types de Données

Les profils utilisent les interfaces définies dans `shared/types/profile.ts` :

- `BaseProfile` - Champs communs
- `ClientProfile` - Spécifique aux clients (entreprise, budgets)
- `ProviderProfile` - Spécifique aux prestataires (expérience, équipement)

## Tests

Vérifications recommandées :

```bash
# Tests unitaires des utilitaires
npm test -- shared/utils/profileScore.test.ts
npm test -- shared/utils/keywords.test.ts

# Tests d'intégration
npm test -- profile/ProfileDashboard.test.tsx
```

## Personnalisation

### Modifier les calculs de score

Éditez `shared/utils/profileScore.ts` pour ajuster les pondérations :

```typescript
export function computeProfileCompleteness(p: Partial<AnyProfile>): number {
  let score = 0;
  if (p.displayName) score += 10; // Ajuster ici
  // ...
}
```

### Ajouter des suggestions IA

Éditez `shared/utils/keywords.ts` pour enrichir le dictionnaire :

```typescript
const synonymDict: Record<string, string> = {
  "votre_terme": "terme_normalisé",
  // ...
};
```

## Performance

- Sauvegarde automatique par étape (évite la perte de données)
- Calcul de complétude en temps réel
- Suggestions IA avec cache et fallback
- Lazy loading des composants lourds

## Sécurité

- Validation côté client ET serveur
- Sanitisation des inputs utilisateur
- Respect des préférences de confidentialité
- Consentement RGPD explicite

---

**Note** : Ce module est autonome et n'impacte pas le reste de l'application. Il peut être activé/désactivé via feature flag.
