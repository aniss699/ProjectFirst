
// ============================================
// SHARED SCHEMAS - POINT D'ENTRÉE CENTRALISÉ
// ============================================

// Réexporter tout depuis le schéma principal
export * from './schema';

// Réexporter les types de profil (vérifier existence)
export * from './types/profile';

// Réexporter les utilitaires (vérifier existence)
export * from './utils/keywords';
export * from './utils/profileScore';

// Types TypeScript pour les schémas
export type { 
  InferSelectModel, 
  InferInsertModel 
} from 'drizzle-orm';

// Types dérivés des tables
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { 
  users, 
  missions, 
  bids, 
  announcements, 
  feedFeedback, 
  feedSeen, 
  favorites 
} from './schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Mission = InferSelectModel<typeof missions>;
export type NewMission = InferInsertModel<typeof missions>;
export type Bid = InferSelectModel<typeof bids>;
export type NewBid = InferInsertModel<typeof bids>;
export type Announcement = InferSelectModel<typeof announcements>;
export type NewAnnouncement = InferInsertModel<typeof announcements>;
export type FeedFeedback = InferSelectModel<typeof feedFeedback>;
export type NewFeedFeedback = InferInsertModel<typeof feedFeedback>;
export type FeedSeen = InferSelectModel<typeof feedSeen>;
export type NewFeedSeen = InferInsertModel<typeof feedSeen>;
export type Favorites = InferSelectModel<typeof favorites>;
export type NewFavorites = InferInsertModel<typeof favorites>;
