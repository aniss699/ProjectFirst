
import { db, pool } from '../database.js';
import { missions, announcements } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { MissionDetailResponse } from '../types/api-responses.js';

// ============================================
// SERVICE DE SYNCHRONISATION FEED
// ============================================

export class MissionSyncService {
  private databaseUrl: string;
  
  constructor(databaseUrl: string) {
    this.databaseUrl = databaseUrl;
  }
  
  /**
   * Synchronise une mission vers le feed announcements
   * Gestion idempotente avec upsert
   */
  async syncMissionToFeed(missionId: number): Promise<void> {
    try {
      console.log(`🔄 Sync mission ${missionId} to feed`);
      
      // 1. Récupérer la mission complète
      const mission = await this.getMissionWithDetails(missionId);
      if (!mission) {
        throw new Error(`Mission ${missionId} not found`);
      }
      
      // 2. Construire l'objet feed
      const feedItem = this.buildMissionForFeed(mission);
      
      // 3. Upsert en base avec gestion de conflit
      await this.upsertAnnouncement(feedItem);
      
      console.log(`✅ Mission ${missionId} synced to feed successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to sync mission ${missionId} to feed:`, error);
      throw error;
    }
  }
  
  /**
   * Construit l'objet announcement à partir d'une mission
   * Règles de transformation et optimisation SEO
   */
  buildMissionForFeed(mission: any): any {
    // Calculer excerpt optimisé
    const excerpt = this.generateOptimizedExcerpt(mission.description, mission.skills_required);
    
    // Budget display unifié
    const budgetDisplay = this.formatBudgetForFeed(mission);
    const budgetValueCents = this.extractBudgetValueForSorting(mission);
    
    // Location display
    const locationDisplay = this.formatLocationForFeed(mission);
    
    // Recherche text optimisé
    const searchText = this.buildSearchText(mission);
    
    // Client display name sécurisé
    const clientDisplayName = this.sanitizeClientName(mission.client_name || 'Client anonyme');
    
    return {
      id: mission.id,
      
      // Contenu optimisé SEO
      title: mission.title,
      description: mission.description,
      excerpt,
      
      // Catégorisation pour algorithme feed
      category: mission.category || 'general',
      tags: mission.tags || [],
      
      // Budget pour tri et affichage
      budget_display: budgetDisplay,
      budget_value_cents: budgetValueCents,
      currency: mission.currency || 'EUR',
      
      // Localisation feed-friendly
      location_display: locationDisplay,
      city: mission.city || null,
      country: mission.country || 'France',
      
      // Métadonnées client (anonymisées)
      client_id: mission.user_id,
      client_display_name: clientDisplayName,
      
      // Stats (initialisées à 0, mises à jour par triggers)
      bids_count: 0,
      lowest_bid_cents: null,
      views_count: 0,
      saves_count: 0,
      
      // Scoring pour algorithme feed
      quality_score: this.calculateQualityScore(mission),
      engagement_score: 0.0, // Calculé par les interactions
      freshness_score: 1.0,  // Calculé par trigger
      
      // Status feed
      status: this.mapMissionStatusToFeedStatus(mission.status),
      urgency: mission.urgency || 'medium',
      deadline: mission.deadline,
      
      // Métadonnées feed
      is_sponsored: false, // TODO: logique sponsoring
      boost_score: 0.0,
      
      // Recherche optimisée
      search_text: searchText,
      // search_vector sera calculé par la DB
      
      // Audit
      synced_at: new Date()
    };
  }
  
  /**
   * Upsert idempotent avec gestion des conflits
   */
  private async upsertAnnouncement(feedItem: any): Promise<void> {
    // Utilisation de la fonction SQL upsert_announcement
    const query = `
      SELECT upsert_announcement(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) as announcement_id
    `;
    
    const params = [
      feedItem.id,                    // p_mission_id
      feedItem.title,                 // p_title
      feedItem.description,           // p_description
      feedItem.excerpt,               // p_excerpt
      feedItem.category,              // p_category
      feedItem.tags,                  // p_tags
      feedItem.budget_display,        // p_budget_display
      feedItem.budget_value_cents,    // p_budget_value_cents
      feedItem.currency,              // p_currency
      feedItem.location_display,      // p_location_display
      feedItem.city,                  // p_city
      feedItem.country,               // p_country
      feedItem.client_id,             // p_client_id
      feedItem.client_display_name,   // p_client_display_name
      feedItem.status,                // p_status
      feedItem.urgency,               // p_urgency
      feedItem.deadline,              // p_deadline
      feedItem.quality_score          // p_quality_score
    ];
    
    const result = await pool.query(query, params);
    console.log(`📤 Upserted announcement for mission ${feedItem.id}`);
  }
  
  /**
   * Récupère mission avec détails pour sync
   */
  private async getMissionWithDetails(missionId: number): Promise<any> {
    const query = `
      SELECT 
        m.*,
        u.name as client_name
      FROM missions m
      LEFT JOIN users u ON m.client_id = u.id
      WHERE m.id = $1
    `;
    
    const result = await pool.query(query, [missionId]);
    return result.rows[0] || null;
  }
  
  // ============================================
  // UTILITAIRES DE TRANSFORMATION
  // ============================================
  
  /**
   * Génère un excerpt optimisé pour le feed
   * Priorité : compétences + début description
   */
  private generateOptimizedExcerpt(description: string, skills: string[] = []): string {
    const maxLength = 200;
    
    // Si skills présents, les inclure dans l'excerpt
    if (skills.length > 0) {
      const skillsText = `Compétences: ${skills.slice(0, 3).join(', ')}. `;
      const remainingLength = maxLength - skillsText.length - 3; // -3 pour "..."
      
      if (remainingLength > 50) {
        const descStart = description.substring(0, remainingLength).trim();
        return skillsText + descStart + '...';
      }
    }
    
    // Excerpt classique
    if (description.length <= maxLength) {
      return description;
    }
    
    return description.substring(0, maxLength - 3).trim() + '...';
  }
  
  /**
   * Formate le budget pour affichage feed
   */
  private formatBudgetForFeed(mission: any): string {
    if (mission.budget_type === 'negotiable') return 'À négocier';
    
    if (mission.budget_type === 'fixed' && mission.budget_value_cents) {
      return `${Math.round(mission.budget_value_cents / 100)}€`;
    }
    
    if (mission.budget_type === 'range' && mission.budget_min_cents && mission.budget_max_cents) {
      const min = Math.round(mission.budget_min_cents / 100);
      const max = Math.round(mission.budget_max_cents / 100);
      return `${min}-${max}€`;
    }
    
    return 'Budget non défini';
  }
  
  /**
   * Extrait valeur numérique pour tri
   */
  private extractBudgetValueForSorting(mission: any): number | null {
    if (mission.budget_type === 'fixed' && mission.budget_value_cents) {
      return mission.budget_value_cents;
    }
    
    if (mission.budget_type === 'range' && mission.budget_min_cents && mission.budget_max_cents) {
      // Moyenne pour le tri
      return Math.round((mission.budget_min_cents + mission.budget_max_cents) / 2);
    }
    
    return null;
  }
  
  /**
   * Formate localisation pour feed
   */
  private formatLocationForFeed(mission: any): string {
    if (mission.city && mission.country) {
      return `${mission.city}, ${mission.country}`;
    }
    
    if (mission.city) return mission.city;
    if (mission.remote_allowed) return 'Remote';
    
    return 'Localisation flexible';
  }
  
  /**
   * Construit texte de recherche optimisé
   */
  private buildSearchText(mission: any): string {
    const parts = [
      mission.title,
      mission.description,
      mission.category,
      ...(mission.tags || []),
      ...(mission.skills_required || []),
      mission.city,
      mission.country
    ].filter(Boolean);
    
    return parts.join(' ').toLowerCase();
  }
  
  /**
   * Sanitise nom client pour affichage public
   */
  private sanitizeClientName(name: string): string {
    // Remplacer par initiales si nom complet
    if (name.includes(' ') && name.length > 20) {
      const parts = name.split(' ');
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    
    // Tronquer si trop long
    if (name.length > 30) {
      return name.substring(0, 27) + '...';
    }
    
    return name;
  }
  
  /**
   * Calcule score qualité pour algorithme feed
   */
  private calculateQualityScore(mission: any): number {
    let score = 0.0;
    
    // Titre (0-2 points)
    if (mission.title && mission.title.length >= 10) score += 1.0;
    if (mission.title && mission.title.length >= 30) score += 1.0;
    
    // Description (0-3 points)
    if (mission.description && mission.description.length >= 50) score += 1.0;
    if (mission.description && mission.description.length >= 200) score += 1.0;
    if (mission.description && mission.description.length >= 500) score += 1.0;
    
    // Compétences (0-2 points)
    if (mission.skills_required && mission.skills_required.length > 0) score += 1.0;
    if (mission.skills_required && mission.skills_required.length >= 3) score += 1.0;
    
    // Budget défini (0-1 point)
    if (mission.budget_type !== 'negotiable') score += 1.0;
    
    // Localisation (0-1 point)
    if (mission.city || mission.remote_allowed) score += 1.0;
    
    // Requirements (0-1 point)
    if (mission.requirements && mission.requirements.length >= 50) score += 1.0;
    
    // Normaliser sur 5
    return Math.min(5.0, score);
  }
  
  /**
   * Mappe statut mission vers statut feed
   */
  private mapMissionStatusToFeedStatus(missionStatus: string): string {
    switch (missionStatus) {
      case 'published': return 'active';
      case 'awarded': return 'closed';
      case 'completed': return 'closed';
      case 'cancelled': return 'inactive';
      case 'expired': return 'inactive';
      default: return 'inactive';
    }
  }
  
  /**
   * Supprime une mission du feed
   */
  async removeMissionFromFeed(missionId: number): Promise<void> {
    try {
      await db.delete(announcements).where(eq(announcements.id, missionId));
      console.log(`🗑️ Mission ${missionId} removed from feed`);
    } catch (error) {
      console.error(`❌ Failed to remove mission ${missionId} from feed:`, error);
      throw error;
    }
  }
  
  /**
   * Met à jour les stats d'une announcement
   */
  async updateAnnouncementStats(missionId: number, stats: {
    bidsCount?: number;
    lowestBidCents?: number;
    viewsCount?: number;
    savesCount?: number;
  }): Promise<void> {
    const query = `
      SELECT update_announcement_stats($1, $2, $3, $4, $5)
    `;
    
    await pool.query(query, [
      missionId,
      stats.bidsCount || null,
      stats.lowestBidCents || null,
      stats.viewsCount || null,
      stats.savesCount || null
    ]);
    
    console.log(`📊 Updated stats for announcement ${missionId}`);
  }
}

// Export singleton
export const missionSync = new MissionSyncService(
  process.env.DATABASE_URL || 'postgresql://localhost:5432/swideal'
);
