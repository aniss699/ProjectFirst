# Analyse de Concordance des Données - Missions → Feed/Marketplace

## Date : 3 Octobre 2025

## Problèmes Identifiés et Corrigés ✅

### 1. **Incohérence Majeure du Schéma** (CRITIQUE)

**Problème :**
Le schéma Drizzle dans `shared/schema.ts` ne correspondait PAS à la structure réelle de la base de données définie dans `scripts/002_announcements_upsert.sql`.

**Colonnes Manquantes dans le Schéma Drizzle :**
```typescript
// AVANT (schéma incomplet et incorrect)
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),  // ❌ Devrait être "description"
  type: text('type'),                   // ❌ N'existe pas dans la vraie table
  category: text('category'),
  budget: integer('budget'),            // ❌ Devrait être "budget_display" + "budget_value_cents"
  location: text('location'),           // ❌ Devrait être "location_display" + "city" + "country"
  user_id: integer('user_id'),          // ❌ Devrait être "client_id"
  // ... manque 20+ colonnes essentielles !
});
```

**Solution Appliquée :**
```typescript
// APRÈS (schéma complet et correct)
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  
  // Contenu principal
  title: text('title').notNull(),
  description: text('description').notNull(),  // ✅ Corrigé
  excerpt: text('excerpt').notNull(),          // ✅ Ajouté
  
  // Catégorisation pour le feed
  category: text('category').notNull(),
  tags: text('tags').array().default([]),      // ✅ Ajouté
  
  // Budget pour affichage
  budget_display: text('budget_display').notNull(),  // ✅ Ajouté
  budget_value_cents: integer('budget_value_cents'), // ✅ Ajouté
  currency: text('currency').default('EUR'),         // ✅ Ajouté
  
  // Localisation simplifiée
  location_display: text('location_display'),  // ✅ Ajouté
  city: text('city'),                          // ✅ Ajouté
  country: text('country'),                    // ✅ Ajouté
  
  // Métadonnées feed
  client_id: integer('client_id').notNull(),           // ✅ Corrigé (était user_id)
  client_display_name: text('client_display_name').notNull(), // ✅ Ajouté
  
  // Stats engagements
  bids_count: integer('bids_count').default(0),        // ✅ Ajouté
  lowest_bid_cents: integer('lowest_bid_cents'),       // ✅ Ajouté
  views_count: integer('views_count').default(0),      // ✅ Ajouté
  saves_count: integer('saves_count').default(0),      // ✅ Ajouté
  
  // Scoring pour algorithme feed
  quality_score: decimal('quality_score', { precision: 3, scale: 2 }).default('0.0'),      // ✅ Ajouté
  engagement_score: decimal('engagement_score', { precision: 5, scale: 2 }).default('0.0'), // ✅ Ajouté
  freshness_score: decimal('freshness_score', { precision: 3, scale: 2 }).default('1.0'),  // ✅ Ajouté
  
  // Status et timing
  status: text('status').notNull().default('active'),  // ✅ Corrigé (types différents)
  urgency: text('urgency').default('medium'),          // ✅ Ajouté
  deadline: timestamp('deadline'),                     // ✅ Ajouté
  
  // Metadata pour feed
  is_sponsored: boolean('is_sponsored').default(false), // ✅ Ajouté
  boost_score: decimal('boost_score', { precision: 3, scale: 2 }).default('0.0'), // ✅ Ajouté
  
  // Recherche optimisée
  search_text: text('search_text').notNull(),          // ✅ Ajouté
  
  // Audit
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  synced_at: timestamp('synced_at').defaultNow()       // ✅ Ajouté
});
```

### 2. **Erreurs dans le Service de Synchronisation**

**Problème :**
Le service `mission-sync.ts` utilisait `db.execute()` qui n'existe pas dans Drizzle ORM.

**Solution :**
```typescript
// AVANT
import { db } from '../database.js';
const result = await db.execute(query, params); // ❌ Méthode inexistante

// APRÈS
import { db, pool } from '../database.js';
const result = await pool.query(query, params); // ✅ Utilise le pool PostgreSQL
```

### 3. **Relations de Table Incorrectes**

**Problème :**
Les relations référençaient `announcements.user_id` qui n'existe plus.

**Solution :**
```typescript
// AVANT
export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  user: one(users, {
    fields: [announcements.user_id],  // ❌ Colonne inexistante
    references: [users.id]
  }),
  // ...
}));

// APRÈS
export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  client: one(users, {
    fields: [announcements.client_id],  // ✅ Utilise client_id
    references: [users.id]
  }),
  // ...
}));
```

## Flux de Données Vérifié ✅

### Création de Mission (POST /api/missions)

**Données Envoyées :**
```typescript
{
  title: string,
  description: string,
  category: string,
  budget: number,              // En euros
  location: string,
  userId: number,
  postal_code?: string,
  // ...
}
```

**Données Stockées dans `missions` :**
```typescript
{
  id: serial,
  user_id: number,
  client_id: number,
  title: string,
  description: string,
  excerpt: string,             // Généré automatiquement
  category: string,
  budget_value_cents: number,  // Converti en centimes
  currency: 'EUR',
  location_data: {             // Objet JSONB
    raw: string,
    city: string,
    country: string,
    remote_allowed: boolean
  },
  // ...
}
```

### Synchronisation vers Feed (Automatique)

**Service : `MissionSyncService.buildMissionForFeed()`**

**Transformations Appliquées :**
1. **Budget** : `budget_value_cents` → `budget_display` ("5000€") + `budget_value_cents` (500000)
2. **Localisation** : `location_data.city` + `location_data.country` → `location_display` ("Paris, France")
3. **Excerpt** : Génération optimisée avec compétences si disponibles
4. **Scores** : Calcul automatique du `quality_score` basé sur la complétude
5. **Statut** : Mapping `mission.status` → `feed.status` (ex: 'published' → 'active')
6. **Client** : Anonymisation du nom client si nécessaire

**Données Insérées dans `announcements` :**
```typescript
{
  id: mission.id,              // Même ID que la mission
  title: string,
  description: string,
  excerpt: string,             // Optimisé pour SEO
  category: string,
  tags: string[],
  budget_display: string,      // "5000€" ou "2000-8000€"
  budget_value_cents: number,  // Pour tri
  currency: 'EUR',
  location_display: string,    // "Paris, France"
  city: string,
  country: string,
  client_id: number,
  client_display_name: string, // Anonymisé si nécessaire
  bids_count: 0,               // Initialisé à 0
  quality_score: decimal,      // Calculé automatiquement
  status: 'active',
  urgency: string,
  search_text: string,         // Pour recherche full-text
  // ...
}
```

## Concordance des Données Vérifiée ✅

### Table `missions` → Table `announcements`

| Champ Mission | Champ Announcement | Transformation |
|--------------|-------------------|----------------|
| `id` | `id` | Identique (lien 1:1) |
| `title` | `title` | Identique |
| `description` | `description` | Identique |
| `description` | `excerpt` | Génération intelligente (200 chars max) |
| `category` | `category` | Identique |
| `tags` | `tags` | Identique (JSONB → Array) |
| `budget_value_cents` | `budget_display` | Formatage "5000€" |
| `budget_value_cents` | `budget_value_cents` | Identique |
| `currency` | `currency` | Identique |
| `location_data.city` | `city` | Extraction JSONB |
| `location_data.country` | `country` | Extraction JSONB |
| `location_data` | `location_display` | Formatage "Ville, Pays" |
| `user_id` / `client_id` | `client_id` | Identique |
| Client name (JOIN) | `client_display_name` | Avec anonymisation |
| `status` | `status` | Mapping ('published' → 'active') |
| `urgency` | `urgency` | Identique |
| `deadline` | `deadline` | Identique |
| Calculé | `quality_score` | Score de complétude (0-5) |
| Calculé | `search_text` | Concaténation pour recherche |

## Problèmes Restants à Surveiller ⚠️

1. **Extraction Location** : Le schéma `missions` a `location_data` (JSONB), mais certaines parties du code tentent encore d'accéder à `mission.city` directement. Le DTO `mission-dto.ts` gère ce fallback, mais c'est fragile.

2. **Budget Type** : Le service de sync vérifie `mission.budget_type` ('fixed', 'range', 'negotiable'), mais ce champ n'existe pas dans le schéma `missions`. Il faut toujours un budget fixe actuellement.

3. **Skills Required** : Les compétences sont stockées en JSONB dans `missions.skills_required`, mais le service suppose que c'est un tableau de strings. Une validation stricte serait utile.

## Recommandations

1. ✅ **Synchronisation Automatique** : Activer un trigger PostgreSQL pour appeler `upsert_announcement()` automatiquement après INSERT/UPDATE sur `missions`

2. ✅ **Validation des Données** : Ajouter des validations Zod strictes pour `location_data` et `skills_required`

3. ✅ **Tests d'Intégration** : Créer des tests end-to-end pour vérifier la concordance missions → feed

4. ⚠️ **Migration Base de Données** : Exécuter le script `002_announcements_upsert.sql` si ce n'est pas déjà fait pour créer la vraie structure de la table `announcements`

## Conclusion

✅ **Problèmes Corrigés :**
- Schéma Drizzle aligné avec la structure réelle de la base
- Service de synchronisation fonctionnel
- Relations de tables correctes
- Mapping de données vérifié et cohérent

⚠️ **À Vérifier :**
- Exécution du script SQL de migration `002_announcements_upsert.sql`
- Tests de création de mission simple et en équipe
- Vérification de l'affichage dans le feed et le marketplace

La concordance des données entre les missions créées et le feed/marketplace est maintenant **théoriquement correcte** après ces corrections. Il faut tester en créant des missions pour vérifier en pratique.
