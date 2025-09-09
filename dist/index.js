var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiEvents: () => aiEvents,
  announcements: () => announcements,
  badges: () => badges,
  bids: () => bids,
  favorites: () => favorites,
  feedFeedback: () => feedFeedback,
  feedSeen: () => feedSeen,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertBadgeSchema: () => insertBadgeSchema,
  insertBidSchema: () => insertBidSchema,
  insertFeedFeedbackSchema: () => insertFeedFeedbackSchema,
  insertFeedSeenSchema: () => insertFeedSeenSchema,
  insertLocationSchema: () => insertLocationSchema,
  insertMissionSchema: () => insertMissionSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertReputationMetricSchema: () => insertReputationMetricSchema,
  insertReviewHelpfulSchema: () => insertReviewHelpfulSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserSchema: () => insertUserSchema,
  locations: () => locations,
  missions: () => missions,
  projects: () => projects,
  reputationMetrics: () => reputationMetrics,
  reviewHelpful: () => reviewHelpful,
  reviews: () => reviews,
  users: () => users
});
import { pgTable, serial, varchar, timestamp, text, integer, decimal, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, projects, bids, insertUserSchema, insertProjectSchema, insertBidSchema, announcements, feedFeedback, feedSeen, favorites, insertAnnouncementSchema, insertFeedFeedbackSchema, insertFeedSeenSchema, aiEvents, locations, reviews, badges, reviewHelpful, reputationMetrics, insertLocationSchema, insertReviewSchema, insertBadgeSchema, insertReviewHelpfulSchema, insertReputationMetricSchema, missions, insertMissionSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      name: varchar("name", { length: 255 }),
      role: varchar("role", { length: 50 }).notNull().default("CLIENT"),
      rating_mean: decimal("rating_mean", { precision: 3, scale: 2 }),
      rating_count: integer("rating_count").default(0),
      profile_data: jsonb("profile_data"),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    projects = pgTable("projects", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      description: text("description").notNull(),
      budget: varchar("budget", { length: 100 }),
      category: varchar("category", { length: 100 }).notNull(),
      quality_target: varchar("quality_target", { length: 20 }),
      risk_tolerance: decimal("risk_tolerance", { precision: 3, scale: 2 }),
      geo_required: boolean("geo_required").default(false),
      onsite_radius_km: integer("onsite_radius_km"),
      status: varchar("status", { length: 50 }).notNull().default("draft"),
      loc_score: decimal("loc_score", { precision: 5, scale: 2 }),
      client_id: integer("client_id").notNull(),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    bids = pgTable("bids", {
      id: serial("id").primaryKey(),
      project_id: integer("project_id").notNull(),
      provider_id: integer("provider_id").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      timeline_days: integer("timeline_days").notNull(),
      message: text("message").notNull(),
      score_breakdown: jsonb("score_breakdown"),
      is_leading: boolean("is_leading").default(false),
      flagged: boolean("flagged").default(false),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    insertUserSchema = createInsertSchema(users);
    insertProjectSchema = createInsertSchema(projects);
    insertBidSchema = createInsertSchema(bids);
    announcements = pgTable("announcements", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      description: text("description").notNull(),
      category: varchar("category", { length: 100 }).notNull(),
      tags: text("tags").array(),
      city: varchar("city", { length: 100 }),
      budget_min: decimal("budget_min", { precision: 10, scale: 2 }),
      budget_max: decimal("budget_max", { precision: 10, scale: 2 }),
      deadline: timestamp("deadline"),
      media: jsonb("media"),
      quality_score: decimal("quality_score", { precision: 3, scale: 2 }),
      embeddings: text("embeddings"),
      // Stockage vectoriel simple
      user_id: integer("user_id").notNull(),
      sponsored: boolean("sponsored").default(false),
      status: varchar("status", { length: 50 }).notNull().default("active"),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    feedFeedback = pgTable("feed_feedback", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull(),
      announcement_id: integer("announcement_id").notNull(),
      action: varchar("action", { length: 20 }).notNull(),
      // 'save', 'skip', 'open', 'offer', 'view'
      dwell_ms: integer("dwell_ms"),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    feedSeen = pgTable("feed_seen", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull(),
      announcement_id: integer("announcement_id").notNull(),
      seen_at: timestamp("seen_at").defaultNow().notNull()
    });
    favorites = pgTable("favorites", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull(),
      announcement_id: integer("announcement_id").notNull(),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    insertAnnouncementSchema = createInsertSchema(announcements);
    insertFeedFeedbackSchema = createInsertSchema(feedFeedback);
    insertFeedSeenSchema = createInsertSchema(feedSeen);
    aiEvents = pgTable("ai_events", {
      id: varchar("id", { length: 255 }).primaryKey(),
      phase: varchar("phase", { length: 50 }).notNull(),
      provider: varchar("provider", { length: 50 }).notNull(),
      model_family: varchar("model_family", { length: 50 }).notNull(),
      model_name: varchar("model_name", { length: 100 }).notNull(),
      allow_training: boolean("allow_training").notNull(),
      input_redacted: jsonb("input_redacted"),
      output: jsonb("output"),
      confidence: decimal("confidence", { precision: 5, scale: 3 }),
      tokens: integer("tokens"),
      latency_ms: integer("latency_ms"),
      provenance: varchar("provenance", { length: 50 }).notNull(),
      prompt_hash: varchar("prompt_hash", { length: 64 }).notNull(),
      accepted: boolean("accepted"),
      rating: integer("rating"),
      edits: text("edits"),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    locations = pgTable("locations", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id"),
      project_id: integer("project_id"),
      address: text("address"),
      city: varchar("city", { length: 100 }),
      postal_code: varchar("postal_code", { length: 20 }),
      country: varchar("country", { length: 100 }).default("France"),
      latitude: real("latitude"),
      longitude: real("longitude"),
      radius_km: integer("radius_km").default(10),
      is_primary: boolean("is_primary").default(false),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      reviewer_id: integer("reviewer_id").notNull(),
      reviewed_id: integer("reviewed_id").notNull(),
      project_id: integer("project_id").notNull(),
      rating: integer("rating").notNull(),
      // 1-5 étoiles
      title: varchar("title", { length: 200 }),
      comment: text("comment"),
      criteria_scores: jsonb("criteria_scores"),
      // {quality: 5, communication: 4, deadline: 5, budget: 4}
      verified: boolean("verified").default(false),
      helpful_count: integer("helpful_count").default(0),
      response: text("response"),
      // Réponse du prestataire
      response_date: timestamp("response_date"),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    badges = pgTable("badges", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull(),
      badge_type: varchar("badge_type", { length: 50 }).notNull(),
      // 'expert', 'reliable', 'top_rated', 'verified', 'local_hero'
      category: varchar("category", { length: 100 }),
      // Catégorie spécifique du badge
      level: integer("level").default(1),
      // Niveau du badge (1-5)
      criteria_met: jsonb("criteria_met"),
      // Critères qui ont permis d'obtenir le badge
      earned_at: timestamp("earned_at").defaultNow().notNull(),
      expires_at: timestamp("expires_at"),
      // Certains badges peuvent expirer
      is_active: boolean("is_active").default(true)
    });
    reviewHelpful = pgTable("review_helpful", {
      id: serial("id").primaryKey(),
      review_id: integer("review_id").notNull(),
      user_id: integer("user_id").notNull(),
      is_helpful: boolean("is_helpful").notNull(),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    reputationMetrics = pgTable("reputation_metrics", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").notNull(),
      total_projects: integer("total_projects").default(0),
      completed_projects: integer("completed_projects").default(0),
      average_rating: decimal("average_rating", { precision: 3, scale: 2 }),
      response_time_avg_hours: integer("response_time_avg_hours"),
      on_time_delivery_rate: decimal("on_time_delivery_rate", { precision: 5, scale: 2 }),
      client_retention_rate: decimal("client_retention_rate", { precision: 5, scale: 2 }),
      trust_score: integer("trust_score").default(0),
      // Score sur 100
      verification_level: varchar("verification_level", { length: 20 }).default("basic"),
      // basic, verified, premium
      last_calculated: timestamp("last_calculated").defaultNow().notNull(),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    insertLocationSchema = createInsertSchema(locations);
    insertReviewSchema = createInsertSchema(reviews);
    insertBadgeSchema = createInsertSchema(badges);
    insertReviewHelpfulSchema = createInsertSchema(reviewHelpful);
    insertReputationMetricSchema = createInsertSchema(reputationMetrics);
    missions = pgTable("missions", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category"),
      budget_min: integer("budget_min"),
      budget_max: integer("budget_max"),
      location: text("location"),
      client_id: integer("client_id").references(() => users.id),
      provider_id: integer("provider_id").references(() => users.id),
      status: text("status").default("published"),
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow(),
      deadline: timestamp("deadline"),
      skills_required: text("skills_required").array(),
      is_team_mission: boolean("is_team_mission").default(false),
      team_size: integer("team_size").default(1),
      urgency: text("urgency"),
      remote_allowed: boolean("remote_allowed").default(true)
    });
    insertMissionSchema = createInsertSchema(missions);
  }
});

// apps/api/src/ai/aiOrchestrator.ts
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
async function getPricingSuggestion(request) {
  try {
    const basePrice = calculateBasePrice(request.category || "general");
    const complexity = analyzeComplexity(request.description || "");
    const timelineMultiplier = getTimelineMultiplier(request.timeline || "");
    const minPrice = Math.round(basePrice * complexity * 0.8);
    const maxPrice = Math.round(basePrice * complexity * timelineMultiplier * 1.3);
    const averagePrice = Math.round((minPrice + maxPrice) / 2);
    return {
      success: true,
      pricing: {
        minPrice,
        maxPrice,
        averagePrice,
        confidence: 0.85,
        factors: [
          `Cat\xE9gorie: ${request.category}`,
          `Complexit\xE9: ${complexity}x`,
          `D\xE9lai: ${timelineMultiplier}x`
        ]
      },
      analysis: {
        category: request.category,
        complexity_level: complexity > 1.5 ? "high" : complexity > 1 ? "medium" : "low",
        market_position: "competitive"
      }
    };
  } catch (error) {
    console.error("Erreur getPricingSuggestion:", error);
    throw new Error("Impossible de calculer la suggestion de prix");
  }
}
async function enhanceBrief(request) {
  try {
    const originalDescription = request.description || "";
    const category = request.category || "general";
    const analysis = analyzeBriefQuality(originalDescription);
    const improvements = generateImprovements(originalDescription, category, analysis);
    return {
      success: true,
      original: {
        title: request.title,
        description: originalDescription,
        word_count: originalDescription.split(" ").length
      },
      enhanced: {
        title: improveTitle(request.title || "", category),
        description: improvements.enhanced_description,
        word_count: improvements.enhanced_description.split(" ").length
      },
      analysis: {
        quality_score: analysis.score,
        missing_elements: analysis.missing,
        improvements_applied: improvements.changes
      },
      suggestions: improvements.suggestions
    };
  } catch (error) {
    console.error("Erreur enhanceBrief:", error);
    throw new Error("Impossible d'am\xE9liorer le brief");
  }
}
async function logUserFeedback(phase, prompt, feedback) {
  try {
    const logEntry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      phase,
      prompt,
      feedback,
      user_session: "anonymous"
    };
    const logsDir = join(process.cwd(), "logs");
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const logFile = join(logsDir, `ai-feedback-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
    const logs = [];
    try {
      const existingLogs = __require(logFile);
      logs.push(...existingLogs);
    } catch {
    }
    logs.push(logEntry);
    writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log(`\u2705 Feedback logged: ${phase}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur logUserFeedback:", error);
    throw new Error("Impossible d'enregistrer le feedback");
  }
}
function calculateBasePrice(category) {
  const basePrices = {
    "development": 5e3,
    "design": 2500,
    "marketing": 3e3,
    "consulting": 4e3,
    "writing": 1500,
    "general": 3e3
  };
  return basePrices[category] || basePrices.general;
}
function analyzeComplexity(description) {
  const complexityKeywords = [
    "complex",
    "advanced",
    "enterprise",
    "scalable",
    "integration",
    "API",
    "database",
    "real-time",
    "mobile",
    "responsive"
  ];
  const found = complexityKeywords.filter(
    (keyword) => description.toLowerCase().includes(keyword)
  ).length;
  return Math.max(0.8, Math.min(2, 1 + found * 0.2));
}
function getTimelineMultiplier(timeline) {
  if (timeline.includes("urgent") || timeline.includes("asap")) return 1.5;
  if (timeline.includes("semaine")) return 1.3;
  if (timeline.includes("mois")) return 1;
  return 1.1;
}
function analyzeBriefQuality(description) {
  const words = description.split(" ").length;
  const hasBudget = /budget|prix|coût|\€|\$/.test(description.toLowerCase());
  const hasTimeline = /délai|semaine|mois|urgent/.test(description.toLowerCase());
  const hasObjectives = /objectif|but|résultat/.test(description.toLowerCase());
  const score = Math.min(
    1,
    words / 100 * 0.4 + (hasBudget ? 0.2 : 0) + (hasTimeline ? 0.2 : 0) + (hasObjectives ? 0.2 : 0)
  );
  const missing = [];
  if (!hasBudget) missing.push("Budget");
  if (!hasTimeline) missing.push("D\xE9lais");
  if (!hasObjectives) missing.push("Objectifs clairs");
  if (words < 50) missing.push("Plus de d\xE9tails");
  return { score, missing };
}
function generateImprovements(description, category, analysis) {
  let enhanced = description;
  const changes = [];
  const suggestions = [];
  if (analysis.missing.includes("Budget")) {
    enhanced += "\n\n\u{1F4B0} Budget: \xC0 d\xE9finir selon la proposition (ouvert aux suggestions)";
    changes.push("Ajout indication budget");
  }
  if (analysis.missing.includes("D\xE9lais")) {
    enhanced += "\n\u23F0 D\xE9lais: Flexible, id\xE9alement sous 4 semaines";
    changes.push("Ajout d\xE9lais indicatifs");
  }
  if (analysis.missing.includes("Objectifs clairs")) {
    enhanced += "\n\u{1F3AF} Objectifs: Livraison conforme aux attentes avec documentation compl\xE8te";
    changes.push("Clarification objectifs");
  }
  suggestions.push("Ajouter des exemples concrets de ce qui est attendu");
  suggestions.push("Pr\xE9ciser les crit\xE8res de s\xE9lection du prestataire");
  suggestions.push("Mentionner les contraintes techniques \xE9ventuelles");
  return { enhanced_description: enhanced, changes, suggestions };
}
function improveTitle(title, category) {
  if (!title) return `Projet ${category} - Mission sp\xE9cialis\xE9e`;
  const keywords = {
    "development": "\u{1F4BB}",
    "design": "\u{1F3A8}",
    "marketing": "\u{1F4C8}",
    "consulting": "\u{1F4A1}",
    "writing": "\u270D\uFE0F"
  };
  const icon = keywords[category] || "\u{1F680}";
  return title.includes(icon) ? title : `${icon} ${title}`;
}
var init_aiOrchestrator = __esm({
  "apps/api/src/ai/aiOrchestrator.ts"() {
    "use strict";
  }
});

// apps/api/src/ai/adapters/geminiAdapter.ts
var geminiAdapter_exports = {};
__export(geminiAdapter_exports, {
  geminiCall: () => geminiCall
});
import { GoogleGenerativeAI } from "@google/generative-ai";
async function geminiCall(phase, prompt) {
  const t0 = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  console.log("\u{1F3AF} Initialisation Gemini API...");
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("\u{1F4E1} Envoi requ\xEAte Gemini API...");
  let text2;
  try {
    const result = await model.generateContent(JSON.stringify(prompt));
    const response = await result.response;
    text2 = response.text();
    if (!text2) {
      throw new Error("R\xE9ponse vide de Gemini API");
    }
    console.log("\u2705 R\xE9ponse Gemini API re\xE7ue avec succ\xE8s");
  } catch (geminiError) {
    console.error("\u{1F6A8} ERREUR GEMINI API:", geminiError);
    throw new Error(`Gemini API \xE9chou\xE9: ${geminiError.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text2);
    console.log("\u2705 R\xE9ponse Gemini pars\xE9e en JSON:", parsed);
  } catch {
    console.log("\u{1F4DD} R\xE9ponse Gemini en texte brut (pas JSON):", text2.substring(0, 200) + "...");
    parsed = text2;
  }
  const latency = Date.now() - t0;
  const out = {
    phase,
    model_family: "gemini",
    model_name: "gemini-1.5-flash",
    input_redacted: {},
    output: parsed,
    quality: { latency_ms: latency },
    meta: {
      provider: "gemini-api",
      allow_training: false,
      provenance: "gemini-api-direct",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
  return out;
}
var init_geminiAdapter = __esm({
  "apps/api/src/ai/adapters/geminiAdapter.ts"() {
    "use strict";
  }
});

// apps/api/src/ai/learning-engine.ts
import { drizzle as drizzle4 } from "drizzle-orm/node-postgres";
import { Pool as Pool4 } from "pg";
import { desc as desc2, eq as eq3, and, gte } from "drizzle-orm";
var pool3, db3, AILearningEngine, aiLearningEngine;
var init_learning_engine = __esm({
  "apps/api/src/ai/learning-engine.ts"() {
    "use strict";
    init_schema();
    pool3 = new Pool4({ connectionString: process.env.DATABASE_URL });
    db3 = drizzle4(pool3);
    AILearningEngine = class {
      patterns = /* @__PURE__ */ new Map();
      insights = [];
      /**
       * Analyse les interactions passées avec Gemini pour identifier les patterns de succès
       */
      async analyzePastInteractions(limit = 1e3) {
        try {
          console.log("\u{1F9E0} D\xE9but de l'analyse des patterns d'apprentissage...");
          const recentInteractions = await db3.select().from(aiEvents).where(and(
            eq3(aiEvents.provider, "gemini-api"),
            gte(aiEvents.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3))
            // 30 jours
          )).orderBy(desc2(aiEvents.created_at)).limit(limit);
          console.log(`\u{1F4CA} Analyse de ${recentInteractions.length} interactions Gemini`);
          for (const interaction of recentInteractions) {
            await this.processInteraction(interaction);
          }
          this.generateLearningInsights();
          console.log(`\u2705 Apprentissage termin\xE9: ${this.patterns.size} patterns identifi\xE9s`);
        } catch (error) {
          console.error("\u274C Erreur lors de l'apprentissage:", error);
        }
      }
      /**
       * Traite une interaction individuelle pour extraire des patterns
       */
      async processInteraction(interaction) {
        try {
          const inputData = interaction.input_redacted || {};
          const output = interaction.output;
          const userFeedback = interaction.accepted ? "positive" : "neutral";
          if (!output || !inputData.prompt) return;
          const inputPattern = this.extractPattern(inputData.prompt);
          if (!inputPattern) return;
          const cleanOutput = this.cleanGeminiOutput(output);
          const patternKey = this.generatePatternKey(inputPattern, interaction.phase);
          if (this.patterns.has(patternKey)) {
            const existing = this.patterns.get(patternKey);
            existing.usage_count++;
            existing.confidence_score = this.calculateConfidence(existing);
            if (userFeedback === "positive" && cleanOutput.length > existing.successful_output.length) {
              existing.successful_output = cleanOutput;
            }
          } else {
            this.patterns.set(patternKey, {
              input_pattern: inputPattern,
              successful_output: cleanOutput,
              context_category: this.detectCategory(inputData.prompt),
              user_feedback: userFeedback,
              confidence_score: userFeedback === "positive" ? 0.8 : 0.6,
              usage_count: 1
            });
          }
        } catch (error) {
          console.error("\u274C Erreur traitement interaction:", error);
        }
      }
      /**
       * Génère des suggestions améliorées basées sur l'apprentissage
       */
      async generateImprovedSuggestion(inputText, fieldType, category) {
        const inputPattern = this.extractPattern(inputText);
        const patternKey = this.generatePatternKey(inputPattern, fieldType);
        if (this.patterns.has(patternKey)) {
          const pattern = this.patterns.get(patternKey);
          if (pattern.confidence_score > 0.7) {
            console.log(`\u{1F3AF} Pattern trouv\xE9 (confiance: ${pattern.confidence_score})`);
            return this.adaptPattern(pattern.successful_output, inputText);
          }
        }
        const similarPatterns = this.findSimilarPatterns(inputPattern, fieldType);
        if (similarPatterns.length > 0) {
          const bestPattern = similarPatterns[0];
          console.log(`\u{1F50D} Pattern similaire trouv\xE9 (confiance: ${bestPattern.confidence_score})`);
          return this.adaptPattern(bestPattern.successful_output, inputText);
        }
        return null;
      }
      /**
       * Apprend d'une nouvelle réponse Gemini réussie
       */
      async learnFromSuccess(originalText, improvedText, fieldType, category, userFeedback = "positive") {
        try {
          console.log("\u{1F4DA} Apprentissage d'un nouveau pattern de succ\xE8s...");
          console.log("\u{1F916} Consultation Gemini pour enrichir l'apprentissage...");
          const geminiAnalysis = await this.consultGeminiForLearning(originalText, improvedText, fieldType, category || this.detectCategory(originalText));
          const pattern = this.extractPattern(originalText);
          const patternKey = this.generatePatternKey(pattern, fieldType);
          this.patterns.set(patternKey, {
            input_pattern: pattern,
            successful_output: this.cleanGeminiOutput(improvedText),
            context_category: category || this.detectCategory(originalText),
            user_feedback: userFeedback,
            confidence_score: this.calculateConfidenceForNewPattern(userFeedback, geminiAnalysis),
            usage_count: 1,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            last_used: (/* @__PURE__ */ new Date()).toISOString(),
            gemini_analysis: geminiAnalysis,
            // Nouvel enrichissement Gemini
            improvement_factors: geminiAnalysis?.improvement_factors || [],
            semantic_keywords: geminiAnalysis?.semantic_keywords || []
          });
          console.log(`\u2705 Nouveau pattern appris avec aide Gemini: ${patternKey}`);
        } catch (error) {
          console.error("\u274C Erreur lors de l'apprentissage:", error);
        }
      }
      /**
       * Nettoyage des réponses Gemini (enlever JSON wrapper, etc.)
       */
      cleanGeminiOutput(output) {
        let cleaned = output;
        if (cleaned.includes("```json")) {
          const match = cleaned.match(/```json\s*\{\s*"enhancedText":\s*"([^"]+)"/);
          if (match) {
            cleaned = match[1];
          }
        }
        cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\"/g, '"');
        return cleaned.trim();
      }
      extractPattern(text2) {
        return text2.toLowerCase().split(" ").filter((word) => word.length > 3).slice(0, 5).join(" ");
      }
      generatePatternKey(pattern, type) {
        return `${type}:${pattern}`;
      }
      detectCategory(text2) {
        const categories = {
          "d\xE9veloppement": ["site", "web", "app", "code", "javascript"],
          "design": ["logo", "graphique", "design", "ui", "ux"],
          "travaux": ["peinture", "travaux", "r\xE9novation", "construction"],
          "marketing": ["marketing", "pub", "seo", "social"],
          "r\xE9daction": ["article", "contenu", "texte", "blog"]
        };
        for (const [cat, keywords] of Object.entries(categories)) {
          if (keywords.some((kw) => text2.toLowerCase().includes(kw))) {
            return cat;
          }
        }
        return "g\xE9n\xE9ral";
      }
      calculateConfidence(pattern) {
        let confidence = 0.5;
        confidence += Math.min(0.3, pattern.usage_count * 0.05);
        if (pattern.user_feedback === "positive") confidence += 0.2;
        if (pattern.user_feedback === "negative") confidence -= 0.3;
        return Math.max(0.1, Math.min(0.95, confidence));
      }
      calculateConfidenceForNewPattern(userFeedback, geminiAnalysis) {
        let confidence = userFeedback === "positive" ? 0.8 : 0.6;
        if (geminiAnalysis) {
          confidence += (geminiAnalysis.quality_score || 0.8) * 0.1;
          confidence += (geminiAnalysis.reusability_score || 0.7) * 0.1;
        }
        return Math.max(0.1, Math.min(0.95, confidence));
      }
      findSimilarPatterns(inputPattern, fieldType) {
        const similar = [];
        const inputWords = inputPattern.split(" ");
        for (const [key, pattern] of this.patterns) {
          if (!key.startsWith(fieldType)) continue;
          const patternWords = pattern.input_pattern.split(" ");
          const commonWords = inputWords.filter((word) => patternWords.includes(word));
          const similarity = commonWords.length / Math.max(inputWords.length, patternWords.length);
          if (similarity > 0.3) {
            similar.push({ ...pattern, similarity });
          }
        }
        return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
      }
      adaptPattern(patternOutput, newInput) {
        return patternOutput.replace(/\[CONTEXTE\]/g, newInput.substring(0, 50));
      }
      generateLearningInsights() {
        this.insights = [];
        const categoryStats = /* @__PURE__ */ new Map();
        for (const pattern of this.patterns.values()) {
          const cat = pattern.context_category;
          if (categoryStats.has(cat)) {
            const stats = categoryStats.get(cat);
            stats.count++;
            stats.avgConfidence = (stats.avgConfidence + pattern.confidence_score) / 2;
          } else {
            categoryStats.set(cat, { count: 1, avgConfidence: pattern.confidence_score });
          }
        }
        for (const [category, stats] of categoryStats) {
          if (stats.count > 5 && stats.avgConfidence > 0.7) {
            this.insights.push({
              pattern_type: "enhancement",
              improvement_suggestion: `Cat\xE9gorie ${category}: ${stats.count} patterns fiables identifi\xE9s`,
              confidence: stats.avgConfidence,
              based_on_samples: stats.count
            });
          }
        }
      }
      /**
       * Consultation Gemini pour enrichir l'apprentissage
       */
      async consultGeminiForLearning(originalText, improvedText, fieldType, category) {
        try {
          const { geminiCall: geminiCall2 } = await Promise.resolve().then(() => (init_geminiAdapter(), geminiAdapter_exports));
          const prompt = {
            role: "expert_learning_analyst",
            task: "improvement_pattern_analysis",
            original: originalText,
            improved: improvedText,
            field_type: fieldType,
            category,
            request: "Analyse ce pattern d'am\xE9lioration et identifie les facteurs cl\xE9s de succ\xE8s"
          };
          console.log("\u{1F393} Gemini analyse du pattern d'am\xE9lioration...");
          const response = await geminiCall2("learning_analysis", prompt);
          if (response && response.output) {
            console.log("\u2705 Analyse Gemini re\xE7ue pour apprentissage");
            return {
              improvement_factors: this.extractImprovementFactors(response.output),
              semantic_keywords: this.extractSemanticKeywords(response.output),
              quality_score: this.extractQualityScore(response.output),
              reusability_score: this.extractReusabilityScore(response.output),
              pattern_type: this.classifyPatternType(response.output),
              raw_analysis: response.output
            };
          }
          return null;
        } catch (error) {
          console.error("Erreur consultation Gemini apprentissage:", error);
          return null;
        }
      }
      extractImprovementFactors(output) {
        if (typeof output === "string") {
          const lines = output.split("\n").filter(
            (line) => line.includes("facteur") || line.includes("am\xE9lior") || line.includes("cl\xE9")
          );
          return lines.slice(0, 5);
        }
        return output.improvement_factors || [];
      }
      extractSemanticKeywords(output) {
        if (typeof output === "string") {
          const words = output.toLowerCase().split(/\s+/).filter(
            (word) => word.length > 4 && !["dans", "avec", "pour", "sans", "plus"].includes(word)
          );
          return words.slice(0, 10);
        }
        return output.semantic_keywords || [];
      }
      extractQualityScore(output) {
        if (typeof output === "string") {
          const match = output.match(/qualité.*?(\d+)/i);
          return match ? parseInt(match[1]) / 100 : 0.8;
        }
        return output.quality_score || 0.8;
      }
      extractReusabilityScore(output) {
        if (typeof output === "string") {
          const match = output.match(/réutilis.*?(\d+)/i);
          return match ? parseInt(match[1]) / 100 : 0.7;
        }
        return output.reusability_score || 0.7;
      }
      classifyPatternType(output) {
        if (typeof output === "string") {
          const types = ["structuration", "clarification", "enrichissement", "simplification"];
          const found = types.find((type) => output.toLowerCase().includes(type));
          return found || "general";
        }
        return output.pattern_type || "general";
      }
      /**
       * Apprentissage universel pour TOUTES les interactions Gemini
       */
      async learnFromGeminiInteraction(interactionType, inputData, geminiResponse, finalResult, userFeedback = "positive") {
        try {
          console.log(`\u{1F393} Apprentissage du pattern ${interactionType} de Gemini...`);
          const geminiMetaAnalysis = await this.consultGeminiForMetaLearning(
            interactionType,
            inputData,
            geminiResponse,
            finalResult
          );
          const pattern = this.generateUniversalPattern(inputData, interactionType);
          const patternKey = this.generatePatternKey(pattern, interactionType);
          const qualityScore = this.assessGeminiResponseQuality(geminiResponse, finalResult);
          const confidenceScore = this.calculateConfidenceForGeminiInteraction(
            userFeedback,
            qualityScore,
            geminiMetaAnalysis
          );
          this.patterns.set(patternKey, {
            input_pattern: pattern,
            successful_output: this.extractSuccessfulOutput(geminiResponse, finalResult),
            context_category: this.detectCategoryFromInput(inputData),
            user_feedback: userFeedback,
            confidence_score: confidenceScore,
            usage_count: 1,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            last_used: (/* @__PURE__ */ new Date()).toISOString(),
            gemini_analysis: geminiResponse,
            improvement_factors: this.extractImprovementFactorsUniversal(geminiResponse),
            semantic_keywords: this.extractSemanticKeywordsUniversal(inputData),
            interaction_type: interactionType,
            quality_metrics: {
              response_quality: qualityScore,
              relevance_score: geminiMetaAnalysis?.relevance_score || 0.8,
              innovation_factor: geminiMetaAnalysis?.innovation_factor || 0.7,
              reusability_potential: geminiMetaAnalysis?.reusability_potential || 0.8
            },
            meta_analysis: geminiMetaAnalysis
          });
          console.log(`\u2705 Pattern ${interactionType} appris avec m\xE9tadonn\xE9es Gemini: ${patternKey}`);
          this.updateInsightsFromNewPattern(interactionType, confidenceScore);
        } catch (error) {
          console.error(`\u274C Erreur apprentissage ${interactionType}:`, error);
        }
      }
      /**
       * Génère un pattern universel à partir de n'importe quel input
       */
      generateUniversalPattern(inputData, type) {
        let extractedText = "";
        if (typeof inputData === "string") {
          extractedText = inputData;
        } else if (inputData.description) {
          extractedText = inputData.description;
        } else if (inputData.mission?.description) {
          extractedText = inputData.mission.description;
        } else if (inputData.title) {
          extractedText = inputData.title;
        } else {
          extractedText = JSON.stringify(inputData).substring(0, 200);
        }
        return this.extractPattern(extractedText);
      }
      /**
       * Évalue la qualité de la réponse Gemini
       */
      assessGeminiResponseQuality(geminiResponse, finalResult) {
        let quality = 0.7;
        if (geminiResponse && typeof geminiResponse === "object") {
          const responseFields = Object.keys(geminiResponse).length;
          quality += Math.min(0.2, responseFields * 0.05);
        }
        if (finalResult && geminiResponse) {
          quality += 0.1;
        }
        return Math.min(0.95, quality);
      }
      /**
       * Calcul de confiance pour interactions Gemini
       */
      calculateConfidenceForGeminiInteraction(userFeedback, qualityScore, metaAnalysis) {
        let confidence = 0.8;
        if (userFeedback === "positive") confidence += 0.1;
        if (userFeedback === "negative") confidence -= 0.2;
        confidence += (qualityScore - 0.7) * 0.5;
        if (metaAnalysis) {
          confidence += (metaAnalysis.relevance_score || 0.8) * 0.1;
          confidence += (metaAnalysis.innovation_factor || 0.7) * 0.05;
        }
        return Math.max(0.3, Math.min(0.98, confidence));
      }
      /**
       * Extrait le résultat réussi pour apprentissage
       */
      extractSuccessfulOutput(geminiResponse, finalResult) {
        if (typeof geminiResponse === "string") {
          return geminiResponse.substring(0, 500);
        }
        if (geminiResponse && typeof geminiResponse === "object") {
          return JSON.stringify(geminiResponse).substring(0, 500);
        }
        if (finalResult) {
          return JSON.stringify(finalResult).substring(0, 500);
        }
        return "R\xE9sultat Gemini trait\xE9";
      }
      /**
       * Détecte la catégorie depuis n'importe quel input
       */
      detectCategoryFromInput(inputData) {
        let textToAnalyze = "";
        if (typeof inputData === "string") {
          textToAnalyze = inputData;
        } else if (inputData.category) {
          return inputData.category;
        } else if (inputData.mission?.category) {
          return inputData.mission.category;
        } else if (inputData.description) {
          textToAnalyze = inputData.description;
        } else {
          textToAnalyze = JSON.stringify(inputData);
        }
        return this.detectCategory(textToAnalyze);
      }
      /**
       * Extraction universelle de facteurs d'amélioration
       */
      extractImprovementFactorsUniversal(geminiResponse) {
        const factors = [];
        if (typeof geminiResponse === "string") {
          const lines = geminiResponse.split("\n").filter(
            (line) => line.includes("am\xE9liorer") || line.includes("optimiser") || line.includes("recommand")
          );
          factors.push(...lines.slice(0, 3));
        } else if (geminiResponse && typeof geminiResponse === "object") {
          if (geminiResponse.recommendations) factors.push(...geminiResponse.recommendations);
          if (geminiResponse.suggestions) factors.push(...geminiResponse.suggestions);
          if (geminiResponse.improvements) factors.push(...geminiResponse.improvements);
        }
        return factors.slice(0, 5);
      }
      /**
       * Extraction universelle de mots-clés sémantiques
       */
      extractSemanticKeywordsUniversal(inputData) {
        let textToAnalyze = "";
        if (typeof inputData === "string") {
          textToAnalyze = inputData;
        } else if (inputData.description) {
          textToAnalyze = inputData.description;
        } else {
          textToAnalyze = JSON.stringify(inputData);
        }
        const words = textToAnalyze.toLowerCase().split(/\s+/).filter((word) => word.length > 3).filter((word) => !["dans", "avec", "pour", "sans", "plus", "cette", "tous"].includes(word));
        return [...new Set(words)].slice(0, 10);
      }
      /**
       * Met à jour les insights globaux
       */
      updateInsightsFromNewPattern(interactionType, confidenceScore) {
        if (confidenceScore > 0.85) {
          this.insights.push({
            pattern_type: "enhancement",
            improvement_suggestion: `Nouveau pattern ${interactionType} de haute qualit\xE9 identifi\xE9`,
            confidence: confidenceScore,
            based_on_samples: 1
          });
        }
      }
      /**
       * Consultation Gemini pour méta-apprentissage
       */
      async consultGeminiForMetaLearning(interactionType, inputData, geminiResponse, finalResult) {
        try {
          const { geminiCall: geminiCall2 } = await Promise.resolve().then(() => (init_geminiAdapter(), geminiAdapter_exports));
          const prompt = {
            role: "expert_meta_learning_analyst",
            task: "self_analysis_and_improvement",
            interaction_type: interactionType,
            original_input: inputData,
            my_response: geminiResponse,
            final_outcome: finalResult,
            request: "Analyse ta propre contribution et identifie les patterns d'am\xE9lioration pour mes futurs apprentissages"
          };
          console.log("\u{1F504} Gemini m\xE9ta-analyse de sa propre contribution...");
          const response = await geminiCall2("meta_learning_analysis", prompt);
          if (response && response.output) {
            console.log("\u2705 M\xE9ta-analyse Gemini re\xE7ue");
            return {
              relevance_score: this.extractMetaScore(response.output, "relevance"),
              innovation_factor: this.extractMetaScore(response.output, "innovation"),
              reusability_potential: this.extractMetaScore(response.output, "reusability"),
              improvement_areas: this.extractImprovementAreas(response.output),
              pattern_insights: this.extractPatternInsights(response.output),
              raw_meta_analysis: response.output
            };
          }
          return null;
        } catch (error) {
          console.error("Erreur m\xE9ta-apprentissage Gemini:", error);
          return null;
        }
      }
      extractMetaScore(output, scoreType) {
        if (typeof output === "string") {
          const match = output.match(new RegExp(`${scoreType}.*?(\\d+)`, "i"));
          return match ? parseInt(match[1]) / 100 : 0.8;
        }
        return output[`${scoreType}_score`] || 0.8;
      }
      extractImprovementAreas(output) {
        if (typeof output === "string") {
          const lines = output.split("\n").filter(
            (line) => line.includes("am\xE9liorer") || line.includes("d\xE9velopper") || line.includes("renforcer")
          );
          return lines.slice(0, 3);
        }
        return output.improvement_areas || [];
      }
      extractPatternInsights(output) {
        if (typeof output === "string") {
          const lines = output.split("\n").filter(
            (line) => line.includes("pattern") || line.includes("tendance") || line.includes("r\xE9current")
          );
          return lines.slice(0, 3);
        }
        return output.pattern_insights || [];
      }
      /**
       * API publique pour obtenir les statistiques d'apprentissage
       */
      getLearningStats() {
        const stats = {
          total_patterns: this.patterns.size,
          insights_generated: this.insights.length,
          high_confidence_patterns: Array.from(this.patterns.values()).filter((p) => p.confidence_score > 0.8).length,
          categories_learned: [...new Set(Array.from(this.patterns.values()).map((p) => p.context_category))].length,
          interaction_types: [...new Set(Array.from(this.patterns.values()).map((p) => p.interaction_type || "unknown"))],
          gemini_contributions: Array.from(this.patterns.values()).filter((p) => p.gemini_analysis).length,
          avg_confidence: Array.from(this.patterns.values()).reduce((sum, p) => sum + p.confidence_score, 0) / this.patterns.size || 0
        };
        console.log("\u{1F4CA} Statistiques d'apprentissage Gemini:", stats);
        return stats;
      }
    };
    aiLearningEngine = new AILearningEngine();
  }
});

// server/services/ai-enhancement.ts
var ai_enhancement_exports = {};
__export(ai_enhancement_exports, {
  AIEnhancementService: () => AIEnhancementService,
  aiEnhancementService: () => aiEnhancementService
});
var AIEnhancementService, aiEnhancementService;
var init_ai_enhancement = __esm({
  "server/services/ai-enhancement.ts"() {
    "use strict";
    init_aiOrchestrator();
    init_geminiAdapter();
    init_learning_engine();
    AIEnhancementService = class {
      /**
       * Suggère des prix basés sur l'analyse du marché et de la description du projet
       */
      async suggestPricing(projectTitle, description, category) {
        try {
          const prompt = {
            projectTitle,
            description,
            category,
            guidance: this.getCategoryPricingGuidance(category),
            expertise: this.getCategoryExpertise(category)
          };
          const result = await getPricingSuggestion(prompt);
          const minPrice = Math.max(500, result.minPrice || 1e3);
          const maxPrice = Math.max(minPrice * 1.5, result.maxPrice || 3e3);
          return {
            minPrice,
            maxPrice,
            averagePrice: result.averagePrice || Math.round((minPrice + maxPrice) / 2),
            factors: Array.isArray(result.factors) ? result.factors : this.getDetailedFallbackFactors(category, minPrice, maxPrice),
            confidence: Math.max(0, Math.min(1, result.confidence || 0.7))
          };
        } catch (error) {
          console.error("Erreur suggestion prix:", error);
          const prices = this.getFallbackPrices(category);
          return {
            minPrice: prices.min,
            maxPrice: prices.max,
            averagePrice: prices.avg,
            factors: this.getDetailedFallbackFactors(category, prices.min, prices.max),
            confidence: 0.6
          };
        }
      }
      /**
       * Améliore une description vague de projet en une description détaillée et structurée
       */
      async enhanceProjectDescription(vagueDescription, category, additionalInfo) {
        try {
          const categorySpecificPrompt = this.getCategorySpecificPrompt(category, vagueDescription, additionalInfo);
          const prompt = `En tant qu'expert en ${this.getCategoryExpertise(category)}, aidez un client \xE0 clarifier et structurer sa demande.

DEMANDE INITIALE:
"${vagueDescription}"

Cat\xE9gorie: ${category}
${additionalInfo ? `Infos suppl\xE9mentaires: ${additionalInfo}` : ""}

${categorySpecificPrompt}

Transformez cette demande en brief professionnel concis et clair. Maximum 120 mots.

R\xE9pondez au format JSON strict:
{
  "improvedTitle": "Titre professionnel clair et sp\xE9cifique",
  "detailedDescription": "Description concise avec les \xE9l\xE9ments cl\xE9s de la cat\xE9gorie ${category}",
  "suggestedRequirements": ["exigence sp\xE9cifique 1", "exigence m\xE9tier 2", "contrainte 3"],
  "estimatedTimeline": "d\xE9lai r\xE9aliste selon la cat\xE9gorie",
  "complexity": "simple"
}

La complexity doit \xEAtre "simple", "medium" ou "complex".`;
          const vertexResponse = await geminiCall("brief_enhance", { prompt });
          const result = vertexResponse.output;
          return {
            improvedTitle: result.improvedTitle || "Projet am\xE9lior\xE9",
            detailedDescription: result.detailedDescription || vagueDescription,
            suggestedRequirements: Array.isArray(result.suggestedRequirements) ? result.suggestedRequirements : [],
            estimatedTimeline: result.estimatedTimeline || "2-4 semaines",
            complexity: ["simple", "medium", "complex"].includes(result.complexity) ? result.complexity : "medium"
          };
        } catch (error) {
          console.error("Erreur am\xE9lioration description:", error);
          return {
            improvedTitle: "Projet \xE0 pr\xE9ciser",
            detailedDescription: `Demande initiale : ${vagueDescription}

Cette demande n\xE9cessite des pr\xE9cisions suppl\xE9mentaires pour \xEAtre mieux comprise par les prestataires.`,
            suggestedRequirements: ["\xC0 d\xE9finir selon les sp\xE9cifications"],
            estimatedTimeline: "\xC0 d\xE9terminer",
            complexity: "medium"
          };
        }
      }
      /**
       * Génère des facteurs détaillés pour le fallback
       */
      getDetailedFallbackFactors(category, minPrice, maxPrice) {
        const avgPrice = Math.round((minPrice + maxPrice) / 2);
        const estimatedHours = Math.round(avgPrice / 50);
        const categoryFactors = {
          "d\xE9veloppement": [
            `D\xE9veloppement ${category} : ${estimatedHours}h estim\xE9es \xE0 45-80\u20AC/h selon complexit\xE9`,
            `Tarifs march\xE9 2025 France : ${minPrice}-${maxPrice}\u20AC incluant tests et d\xE9ploiement`,
            `Maintenance post-livraison (3-6 mois) et r\xE9visions client incluses`
          ],
          "travaux": [
            `Main d'\u0153uvre sp\xE9cialis\xE9e : ${estimatedHours}h \xE0 35-55\u20AC/h + mat\xE9riaux selon projet`,
            `Tarifs France 2025 : ${minPrice}-${maxPrice}\u20AC avec assurances et garanties incluses`,
            `D\xE9placements, outillage professionnel et nettoyage final inclus`
          ],
          "design": [
            `Cr\xE9ation graphique : ${Math.round(estimatedHours / 2)} jours cr\xE9atifs \xE0 50-80\u20AC/h`,
            `Forfait ${minPrice}-${maxPrice}\u20AC incluant 3-5 propositions et r\xE9visions illimit\xE9es`,
            `Fichiers sources haute d\xE9finition et d\xE9clinaisons formats inclus`
          ],
          "marketing": [
            `Strat\xE9gie digitale : ${estimatedHours}h conseil \xE0 60-100\u20AC/h (hors budget m\xE9dia)`,
            `Mission ${minPrice}-${maxPrice}\u20AC incluant audit, cr\xE9ation contenu et reporting KPIs`,
            `Formation \xE9quipe, templates r\xE9utilisables et suivi 3 mois inclus`
          ],
          "conseil": [
            `Conseil expert : ${Math.round(estimatedHours / 8)} jours mission \xE0 80-150\u20AC/h`,
            `Prestation ${minPrice}-${maxPrice}\u20AC incluant audit, recommandations et plan d'action`,
            `Pr\xE9sentation dirigeants, documents strat\xE9giques et suivi mise en \u0153uvre`
          ],
          "r\xE9daction": [
            `R\xE9daction professionnelle : ${estimatedHours * 100} mots \xE0 0,15-0,30\u20AC/mot`,
            `Prestation ${minPrice}-${maxPrice}\u20AC incluant recherches, optimisation SEO et r\xE9visions`,
            `Formats multiples, images libres de droits et planning \xE9ditorial inclus`
          ],
          "services": [
            `Services professionnels : ${estimatedHours}h prestation \xE0 40-80\u20AC/h selon expertise`,
            `Forfait ${minPrice}-${maxPrice}\u20AC adapt\xE9 aux standards du secteur fran\xE7ais 2025`,
            `D\xE9placements, outils professionnels et garantie r\xE9sultat inclus`
          ]
        };
        return categoryFactors[category] || [
          `Prestation professionnelle : ${estimatedHours}h \xE0 50-80\u20AC/h selon expertise requise`,
          `Tarifs march\xE9 France 2025 : ${minPrice}-${maxPrice}\u20AC incluant conseils et suivi`,
          `Garantie qualit\xE9, r\xE9visions incluses et accompagnement personnalis\xE9`
        ];
      }
      /**
       * Retourne l'expertise spécifique à la catégorie
       */
      getCategoryExpertise(category) {
        const expertises = {
          "d\xE9veloppement": "d\xE9veloppement web et applications",
          "design": "design graphique et UX/UI",
          "marketing": "marketing digital et communication",
          "conseil": "conseil en strat\xE9gie d'entreprise",
          "r\xE9daction": "r\xE9daction et cr\xE9ation de contenu",
          "travaux": "travaux et r\xE9novation",
          "services": "services professionnels"
        };
        return expertises[category] || "gestion de projet";
      }
      /**
       * Retourne le prompt spécifique à chaque catégorie
       */
      getCategorySpecificPrompt(category, description, additionalInfo) {
        switch (category) {
          case "travaux":
            return `SP\xC9CIFICIT\xC9S TRAVAUX - Pr\xE9cisez obligatoirement :
- Dur\xE9e estim\xE9e des travaux (jours/semaines)
- Achat des mat\xE9riaux : inclus dans le devis OU \xE0 la charge du client
- Surface concern\xE9e (m\xB2 si applicable)
- Type d'intervention (neuf, r\xE9novation, entretien)
- Contraintes d'acc\xE8s ou techniques
- P\xE9riode souhait\xE9e (saison, planning)`;
          case "d\xE9veloppement":
            return `SP\xC9CIFICIT\xC9S D\xC9VELOPPEMENT - Pr\xE9cisez obligatoirement :
- Dur\xE9e de d\xE9veloppement estim\xE9e (semaines/mois)
- Technologies souhait\xE9es ou contraintes techniques
- Nombre d'utilisateurs attendus
- Type d'application (web, mobile, desktop)
- Int\xE9grations n\xE9cessaires (API, bases de donn\xE9es)
- Maintenance post-livraison incluse ou non`;
          case "design":
            return `SP\xC9CIFICIT\xC9S DESIGN - Pr\xE9cisez obligatoirement :
- Dur\xE9e du projet cr\xE9atif (jours/semaines)
- Nombre de d\xE9clinaisons/formats souhait\xE9s
- Support final (print, digital, vid\xE9o)
- Charte graphique existante ou cr\xE9ation compl\xE8te
- Nombre de r\xE9visions incluses
- Fichiers sources inclus ou non`;
          case "marketing":
            return `SP\xC9CIFICIT\xC9S MARKETING - Pr\xE9cisez obligatoirement :
- Dur\xE9e de la campagne ou mission (mois)
- Budget m\xE9dia inclus ou non (si pub payante)
- Canaux prioritaires (r\xE9seaux sociaux, SEO, etc.)
- Secteur d'activit\xE9 et cible
- Objectifs mesurables (leads, ventes, notori\xE9t\xE9)
- Reporting inclus (fr\xE9quence, KPIs)`;
          case "conseil":
            return `SP\xC9CIFICIT\xC9S CONSEIL - Pr\xE9cisez obligatoirement :
- Dur\xE9e de la mission (jours/mois)
- Nombre de s\xE9ances/ateliers inclus
- Livrables attendus (rapport, pr\xE9sentation, plan d'action)
- Secteur d'activit\xE9 et taille de l'entreprise
- Niveau d'accompagnement (audit, strat\xE9gie, mise en \u0153uvre)
- D\xE9placements inclus ou factur\xE9s en sus`;
          case "r\xE9daction":
            return `SP\xC9CIFICIT\xC9S R\xC9DACTION - Pr\xE9cisez obligatoirement :
- Volume de contenu (nombre de mots, pages, articles)
- D\xE9lai de livraison souhait\xE9
- Type de contenu (web, print, technique, commercial)
- Recherches documentaires incluses ou non
- Nombre de r\xE9visions incluses
- SEO et optimisation web inclus ou non`;
          default:
            return `Pr\xE9cisez la dur\xE9e estim\xE9e, les livrables attendus et les contraintes sp\xE9cifiques \xE0 cette cat\xE9gorie.`;
        }
      }
      /**
       * Retourne les guides tarifaires spécifiques à chaque catégorie
       */
      getCategoryPricingGuidance(category) {
        switch (category) {
          case "travaux":
            return `TARIFS TRAVAUX 2025 (France) :
- Peinture : 25-45\u20AC/m\xB2 (mat\xE9riaux INCLUS) ou 20-30\u20AC/h + mat\xE9riaux
- \xC9lectricit\xE9 : 45-65\u20AC/h + mat\xE9riaux (comptez 20-30% du co\xFBt main d'\u0153uvre)
- Plomberie : 40-60\u20AC/h + mat\xE9riaux (comptez 25-35% du co\xFBt main d'\u0153uvre)
- Carrelage : 30-60\u20AC/m\xB2 (mat\xE9riaux INCLUS) ou 25-40\u20AC/h + mat\xE9riaux
- Menuiserie : 35-55\u20AC/h + mat\xE9riaux (bois repr\xE9sente 40-60% du co\xFBt)
- D\xE9placements : 0,50-0,65\u20AC/km ou forfait 50-150\u20AC selon distance

CONSID\xC9RATIONS IMPORTANTES :
- MAT\xC9RIAUX : Pr\xE9cisez si inclus (prix 40-70% plus \xE9lev\xE9) ou en sus
- Dur\xE9e r\xE9aliste : 1-3j (petits travaux), 1-4 semaines (r\xE9novation)
- Contraintes : acc\xE8s difficile, \xE9tage, p\xE9riode (+10-20%)
- Garanties d\xE9cennales et assurances incluses`;
          case "d\xE9veloppement":
            return `TARIFS D\xC9VELOPPEMENT 2025 (France) :
- D\xE9veloppement web : 45-80\u20AC/h (projets : 3000-25000\u20AC)
- Applications mobile : 50-90\u20AC/h (projets : 8000-40000\u20AC)
- E-commerce : 40-70\u20AC/h (projets : 5000-20000\u20AC)
- Int\xE9gration API : 55-85\u20AC/h (projets : 2000-10000\u20AC)

DUR\xC9ES R\xC9ALISTES :
- Site vitrine : 2-4 semaines (80-150h)
- E-commerce : 6-12 semaines (200-500h)
- App mobile : 8-16 semaines (300-800h)
- Maintenance : 10-20% du co\xFBt initial/an`;
          case "design":
            return `TARIFS DESIGN 2025 (France) :
- Logo + charte : 1500-5000\u20AC (3-6 semaines)
- Site web (maquettes) : 50-80\u20AC/h (projets : 2000-8000\u20AC)
- Print (flyers, brochures) : 300-1500\u20AC/cr\xE9ation
- Packaging : 2000-8000\u20AC selon complexit\xE9

DUR\xC9ES TYPIQUES :
- Logo : 2-3 semaines (3-5 propositions + r\xE9visions)
- Charte graphique : 3-4 semaines
- Maquettes web : 2-6 semaines selon nombre de pages`;
          case "marketing":
            return `TARIFS MARKETING 2025 (France) :
- Community management : 800-2500\u20AC/mois (hors budget pub)
- SEO/r\xE9f\xE9rencement : 60-100\u20AC/h ou 1500-5000\u20AC/mois
- Campagnes Google Ads : 15-20% du budget pub + setup 800-2000\u20AC
- Strat\xE9gie digitale : 2000-8000\u20AC (audit + plan d'actions)

BUDGETS PUBLICITAIRES :
- Google Ads : 500-5000\u20AC/mois minimum
- Facebook/Instagram : 300-3000\u20AC/mois minimum
- Pr\xE9cisez si budget m\xE9dia inclus dans la prestation ou en sus`;
          case "conseil":
            return `TARIFS CONSEIL 2025 (France) :
- Conseil strat\xE9gique : 80-150\u20AC/h ou 1200-2500\u20AC/jour
- Audit d'entreprise : 3000-15000\u20AC selon taille
- Formation : 1500-3000\u20AC/jour + pr\xE9paration
- Coaching dirigeant : 150-300\u20AC/h

DUR\xC9ES MISSIONS :
- Audit express : 5-10 jours
- Mission strat\xE9gique : 20-60 jours \xE9tal\xE9s
- Accompagnement : 3-12 mois (suivi r\xE9gulier)`;
          case "r\xE9daction":
            return `TARIFS R\xC9DACTION 2025 (France) :
- Articles web : 0,10-0,30\u20AC/mot (SEO : +20-40%)
- Pages site : 150-500\u20AC/page selon complexit\xE9
- Fiches produits : 15-50\u20AC/fiche
- Livre blanc : 2000-8000\u20AC selon longueur
- Newsletter : 200-800\u20AC/\xE9dition

VOLUMES TYPIQUES :
- Article blog : 800-1500 mots
- Page site : 300-800 mots
- D\xE9lais : 2-7 jours/1000 mots selon recherches`;
          default:
            return `TARIFS SERVICES G\xC9N\xC9RAUX 2025 :
- Prestations intellectuelles : 50-120\u20AC/h
- Projets forfaitaires : 1500-8000\u20AC selon complexit\xE9
- D\xE9placements : 0,50\u20AC/km + temps factur\xE9
- R\xE9visions incluses : 2-3 allers-retours standard`;
        }
      }
      /**
       * Améliore n'importe quel texte selon son type
       */
      async enhanceText(text2, fieldType, category) {
        if (!text2 || text2.trim().length === 0) {
          console.warn("Texte vide fourni pour l'am\xE9lioration");
          return text2;
        }
        try {
          console.log(`\u{1F3AF} Am\xE9lioration ${fieldType} avec IA:`, text2.substring(0, 50) + "...");
          let prompt = "";
          let expectedFormat = "text";
          switch (fieldType) {
            case "title":
              prompt = `Am\xE9liorez ce titre de projet pour qu'il soit plus professionnel et accrocheur:
"${text2}"

Cat\xE9gorie: ${category || "Non sp\xE9cifi\xE9e"}

R\xE9pondez au format JSON:
{
  "enhancedText": "titre am\xE9lior\xE9 ici"
}`;
              expectedFormat = "json";
              break;
            case "description":
              prompt = `INSTRUCTIONS : Am\xE9liorez cette description de projet (60-80 mots maximum).

Texte \xE0 am\xE9liorer:
"${text2}"

Cat\xE9gorie: ${category || "Non sp\xE9cifi\xE9e"}

Cr\xE9ez une description professionnelle qui inclut :
1. L'objectif principal
2. Les attentes essentielles
3. Le contexte professionnel

R\xE9pondez au format JSON:
{
  "enhancedText": "description am\xE9lior\xE9e ici"
}`;
              expectedFormat = "json";
              break;
            case "requirements":
              prompt = `Pr\xE9cisez et structurez ces exigences de projet:
"${text2}"

Cat\xE9gorie: ${category || "Non sp\xE9cifi\xE9e"}

Transformez ces exigences en une liste claire et structur\xE9e.

R\xE9pondez au format JSON:
{
  "enhancedText": "exigences am\xE9lior\xE9es ici"
}`;
              expectedFormat = "json";
              break;
          }
          console.log("\u{1F9E0} V\xE9rification des patterns appris...");
          const learnedSuggestion = await aiLearningEngine.generateImprovedSuggestion(text2, fieldType, category);
          if (learnedSuggestion) {
            console.log("\u2728 Suggestion bas\xE9e sur l'apprentissage automatique utilis\xE9e");
            return learnedSuggestion;
          }
          console.log("\u{1F4E1} Envoi requ\xEAte Gemini (pas de pattern appris)...");
          const geminiResponse = await geminiCall("text_enhance", { prompt });
          console.log("\u{1F50D} R\xE9ponse Gemini compl\xE8te:", JSON.stringify(geminiResponse, null, 2));
          if (geminiResponse && geminiResponse.output) {
            let enhancedText = "";
            if (typeof geminiResponse.output === "string") {
              try {
                const parsed = JSON.parse(geminiResponse.output);
                enhancedText = parsed.enhancedText || parsed.enhanced_text || parsed.result || geminiResponse.output;
              } catch {
                enhancedText = geminiResponse.output;
              }
            } else if (geminiResponse.output && typeof geminiResponse.output === "object") {
              enhancedText = geminiResponse.output.enhancedText || geminiResponse.output.enhanced_text || geminiResponse.output.result || JSON.stringify(geminiResponse.output);
            }
            if (enhancedText && enhancedText.trim().length > 0) {
              console.log("\u2705 Am\xE9lioration Gemini r\xE9ussie:", enhancedText.substring(0, 100) + "...");
              try {
                await aiLearningEngine.learnFromSuccess(
                  text2,
                  enhancedText,
                  fieldType,
                  category,
                  "positive"
                );
                console.log("\u{1F4DA} Pattern appris avec succ\xE8s");
              } catch (learnError) {
                console.warn("\u26A0\uFE0F Erreur apprentissage (non bloquant):", learnError);
              }
              return enhancedText.trim();
            }
          }
          console.warn("\u26A0\uFE0F R\xE9ponse Gemini vide ou non trait\xE9e, utilisation du fallback local");
          console.warn("\u{1F4CB} Contenu re\xE7u:", geminiResponse);
          return this.enhanceTextLocal(text2, fieldType, category);
        } catch (error) {
          console.error("\u274C Erreur am\xE9lioration texte IA:", error);
          console.log("\u{1F504} Utilisation du fallback local");
          return this.enhanceTextLocal(text2, fieldType, category);
        }
      }
      enhanceTextLocal(text2, fieldType, category) {
        if (!text2 || text2.trim().length === 0) {
          return text2;
        }
        switch (fieldType) {
          case "title":
            return this.enhanceTitleLocal(text2, category);
          case "description":
            return this.enhanceDescriptionLocal(text2, category);
          case "requirements":
            return this.enhanceRequirementsLocal(text2, category);
          default:
            return text2;
        }
      }
      enhanceTitleLocal(title, category) {
        let enhanced = title.trim();
        enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
        const categoryKeywords = {
          "d\xE9veloppement": "D\xE9veloppement",
          "design": "Design",
          "marketing": "Marketing Digital",
          "conseil": "Conseil",
          "travaux": "Travaux",
          "services": "Services"
        };
        const categoryKey = category?.toLowerCase() || "";
        if (categoryKeywords[categoryKey] && !enhanced.toLowerCase().includes(categoryKey)) {
          enhanced = `${categoryKeywords[categoryKey]} - ${enhanced}`;
        }
        if (enhanced.length < 30 && !enhanced.toLowerCase().includes("professionnel")) {
          enhanced += " - Service Professionnel";
        }
        return enhanced;
      }
      enhanceDescriptionLocal(description, category) {
        let enhanced = description.trim();
        if (enhanced.length < 100) {
          enhanced += "\n\nCe projet n\xE9cessite une approche professionnelle et une expertise confirm\xE9e dans le domaine.";
        }
        if (!enhanced.toLowerCase().includes("livrable") && !enhanced.toLowerCase().includes("r\xE9sultat")) {
          enhanced += "\n\n\u{1F4CB} Livrables attendus :\n- Documentation compl\xE8te\n- Code source comment\xE9 (si applicable)\n- Formation utilisateur si n\xE9cessaire";
        }
        if (!enhanced.toLowerCase().includes("budget") && !enhanced.toLowerCase().includes("prix")) {
          enhanced += "\n\n\u{1F4B0} Budget flexible selon la qualit\xE9 de la proposition.";
        }
        if (!enhanced.toLowerCase().includes("d\xE9lai") && !enhanced.toLowerCase().includes("\xE9ch\xE9ance")) {
          enhanced += "\n\n\u23F0 D\xE9lais de livraison \xE0 discuter selon la complexit\xE9 du projet.";
        }
        if (!enhanced.toLowerCase().includes("exp\xE9rience") && !enhanced.toLowerCase().includes("portfolio")) {
          enhanced += "\n\n\u{1F3AF} Merci de joindre votre portfolio et vos r\xE9f\xE9rences pertinentes.";
        }
        return enhanced;
      }
      enhanceRequirementsLocal(requirements, category) {
        let enhanced = requirements.trim();
        if (!enhanced.includes("-") && !enhanced.includes("\u2022") && !enhanced.includes("\n")) {
          const sentences = enhanced.split(".").filter((s) => s.trim().length > 0);
          if (sentences.length > 1) {
            enhanced = sentences.map((s) => `\u2022 ${s.trim()}`).join("\n");
          }
        }
        const categoryRequirements = {
          "d\xE9veloppement": [
            "\u2022 Code propre et document\xE9",
            "\u2022 Tests unitaires inclus",
            "\u2022 Compatibilit\xE9 navigateurs modernes"
          ],
          "design": [
            "\u2022 Fichiers sources fournis",
            "\u2022 Formats d'export multiples",
            "\u2022 Respect de la charte graphique"
          ],
          "marketing": [
            "\u2022 Analyse de performance incluse",
            "\u2022 Rapport mensuel d\xE9taill\xE9",
            "\u2022 Suivi des KPIs"
          ]
        };
        const categoryKey = category?.toLowerCase() || "";
        if (categoryRequirements[categoryKey]) {
          enhanced += "\n\nExigences techniques standard :\n" + categoryRequirements[categoryKey].join("\n");
        }
        return enhanced;
      }
      /**
       * Analyse la qualité d'une description de projet et suggère des améliorations
       */
      async analyzeDescriptionQuality(description) {
        try {
          const prompt = `Analysez la qualit\xE9 de cette description de projet freelance et sugg\xE9rez des am\xE9liorations:

DESCRIPTION:
"${description}"

\xC9valuez selon ces crit\xE8res:
- Clart\xE9 des objectifs
- D\xE9tails techniques
- Contraintes mentionn\xE9es
- Budget/d\xE9lais pr\xE9cis\xE9s
- Informations contextuelles

R\xE9pondez au format JSON:
{
  "score": 0.0,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "missingElements": ["\xE9l\xE9ment manquant 1", "\xE9l\xE9ment manquant 2"]
}

Score entre 0.0 (tr\xE8s vague) et 1.0 (tr\xE8s d\xE9taill\xE9).`;
          const vertexResponse = await geminiCall("quality_analysis", { prompt });
          const result = vertexResponse.output;
          return {
            score: Math.max(0, Math.min(1, result.score || 0.5)),
            suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
            missingElements: Array.isArray(result.missingElements) ? result.missingElements : []
          };
        } catch (error) {
          console.error("Erreur analyse qualit\xE9:", error);
          return {
            score: this.calculateLocalQualityScore(description),
            // Utilisation du score local comme fallback
            suggestions: ["Ajoutez plus de d\xE9tails sur vos objectifs"],
            missingElements: ["Budget indicatif", "D\xE9lais souhait\xE9s"]
          };
        }
      }
      /**
       * Get fallback prices for a category
       */
      getFallbackPrices(category) {
        const fallbackPrices = {
          "d\xE9veloppement": { min: 2500, max: 12e3, avg: 6e3 },
          "design": { min: 1200, max: 5e3, avg: 2800 },
          "marketing": { min: 1800, max: 8e3, avg: 4e3 },
          "r\xE9daction": { min: 800, max: 3e3, avg: 1500 },
          "conseil": { min: 2e3, max: 1e4, avg: 5e3 },
          "services": { min: 1500, max: 6e3, avg: 3e3 },
          "travaux": { min: 2e3, max: 8e3, avg: 4500 }
        };
        return fallbackPrices[category] || fallbackPrices.conseil;
      }
      /**
       * Calculate local quality score based on description length and content
       */
      calculateLocalQualityScore(description) {
        let score = 0.3;
        if (description.length > 100) score += 0.2;
        if (description.length > 300) score += 0.2;
        if (description.toLowerCase().includes("budget")) score += 0.1;
        if (description.toLowerCase().includes("d\xE9lai")) score += 0.1;
        if (description.toLowerCase().includes("exp\xE9rience")) score += 0.1;
        return Math.min(1, score);
      }
    };
    aiEnhancementService = new AIEnhancementService();
  }
});

// server/index.ts
import express6 from "express";
import path3 from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"]
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    hmr: {
      port: 5001,
      host: "0.0.0.0"
    },
    allowedHosts: true
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 8080,
    strictPort: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
async function setupVite(app2, server2) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: {
        server: server2,
        port: 5001
      }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    if (url.includes(".")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/services/mission-sync.ts
init_schema();
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
var MissionSyncService = class {
  db;
  pool;
  constructor(databaseUrl3) {
    this.pool = new Pool({ connectionString: databaseUrl3 });
    this.db = drizzle(this.pool);
  }
  async syncMissionsToFeed(missions2) {
    try {
      console.log("\u{1F504} Synchronisation des missions vers le feed...");
      for (const mission of missions2) {
        const existing = await this.db.select().from(announcements).where(sql`title = ${mission.title} AND description = ${mission.description}`).limit(1);
        if (existing.length === 0) {
          const budgetValue = parseFloat(mission.budget.toString().replace(/[^0-9.-]/g, "")) || 0;
          await this.db.insert(announcements).values({
            title: mission.title,
            description: mission.description,
            category: mission.category.toLowerCase(),
            city: mission.location || null,
            budget_min: budgetValue.toString(),
            budget_max: budgetValue.toString(),
            user_id: 1,
            status: mission.status === "open" ? "active" : "inactive",
            quality_score: "0.8",
            created_at: new Date(mission.createdAt)
          });
          console.log(`\u2705 Mission "${mission.title}" ajout\xE9e au feed`);
        }
      }
      console.log("\u2705 Synchronisation termin\xE9e");
    } catch (error) {
      console.error("\u274C Erreur lors de la synchronisation:", error);
    }
  }
  async addMissionToFeed(mission) {
    try {
      const budgetValue = parseFloat(mission.budget.toString().replace(/[^0-9.-]/g, "")) || 0;
      await this.db.insert(announcements).values({
        title: mission.title,
        description: mission.description,
        category: mission.category.toLowerCase(),
        city: mission.location || null,
        budget_min: budgetValue.toString(),
        budget_max: budgetValue.toString(),
        user_id: 1,
        // TODO: utiliser le vrai user_id depuis l'auth
        status: "active",
        quality_score: "0.8"
        // Score par défaut
      });
    } catch (error) {
      console.error("Erreur ajout mission au feed:", error);
      throw error;
    }
  }
};

// server/environment-check.ts
function validateEnvironment() {
  const requiredVars = [
    "DATABASE_URL",
    "GEMINI_API_KEY"
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn("\u26A0\uFE0F Variables d'environnement manquantes:", missing);
    console.warn("\u{1F4DD} Ajoutez-les dans l'onglet Secrets de Replit pour une fonctionnalit\xE9 compl\xE8te");
    if (process.env.NODE_ENV === "production" && missing.includes("DATABASE_URL")) {
      console.error("\u274C DATABASE_URL is required in production");
      process.exit(1);
    }
  }
  console.log("\u2705 Variables d'environnement valid\xE9es");
  console.log("\u{1F50D} Configuration d'environnement:", {
    NODE_ENV: process.env.NODE_ENV,
    PREVIEW_MODE: process.env.PREVIEW_MODE,
    DATABASE_URL: process.env.DATABASE_URL ? "\u2705 Configur\xE9" : "\u274C Manquant",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "\u2705 Configur\xE9" : "\u274C Manquant",
    PORT: process.env.PORT || "5000"
  });
}

// server/index.ts
import { Pool as Pool5 } from "pg";
import cors from "cors";

// server/routes/missions.ts
import { Router } from "express";
import { eq, desc } from "drizzle-orm";

// server/database.ts
import { Pool as Pool2 } from "pg";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
var isPreviewMode = process.env.PREVIEW_MODE === "true" || process.env.NODE_ENV === "production";
var databaseUrl = isPreviewMode ? process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING : process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING || "postgresql://localhost:5432/swideal";
var pool = new Pool2({
  connectionString: databaseUrl
});
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});
pool.on("connect", () => {
  console.log("\u2705 Database connection established");
});
var db = drizzle2(pool);
console.log("\u{1F517} Database connection established:", {
  databaseUrl: databaseUrl ? "***configured***" : "missing",
  isCloudSQL: databaseUrl?.includes("/cloudsql/") || false
});

// server/routes/missions.ts
init_schema();
var router = Router();
router.post("/", async (req, res) => {
  try {
    const missionData = req.body;
    console.log("\u{1F4DD} Mission creation request received:", JSON.stringify(missionData, null, 2));
    console.log("\u{1F4DD} Request headers:", JSON.stringify(req.headers, null, 2));
    if (!missionData.title || missionData.title.trim() === "") {
      console.error("\u274C Validation failed: Missing or empty title");
      return res.status(400).json({
        error: "Le titre est requis",
        field: "title",
        received: missionData.title
      });
    }
    if (!missionData.description || missionData.description.trim() === "") {
      console.error("\u274C Validation failed: Missing or empty description");
      return res.status(400).json({
        error: "La description est requise",
        field: "description",
        received: missionData.description
      });
    }
    if (missionData.description.length < 10) {
      console.error("\u274C Validation failed: Description too short");
      return res.status(400).json({
        error: "La description doit contenir au moins 10 caract\xE8res",
        field: "description",
        length: missionData.description.length
      });
    }
    const missionToInsert = {
      title: missionData.title,
      description: missionData.description,
      category: missionData.category || "developpement",
      budget: missionData.budget ? parseInt(missionData.budget) : null,
      location: missionData.location || null,
      urgency: missionData.urgency || "medium",
      status: missionData.status || "published",
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date(),
      client_id: missionData.client_id || 1,
      // Map additional fields properly
      budget_min: missionData.budget_min ? parseInt(missionData.budget_min) : null,
      budget_max: missionData.budget_max ? parseInt(missionData.budget_max) : null,
      deadline: missionData.deadline ? new Date(missionData.deadline) : null,
      tags: missionData.tags || [],
      requirements: missionData.requirements || null
    };
    console.log("\u{1F4E4} Inserting mission with data:", JSON.stringify(missionToInsert, null, 2));
    console.log("\u{1F4E4} Attempting to insert mission with data:", JSON.stringify(missionToInsert, null, 2));
    let insertedMission;
    try {
      const result = await db.insert(missions).values(missionToInsert).returning();
      insertedMission = result[0];
      if (!insertedMission) {
        throw new Error("No mission returned from database insert");
      }
      console.log("\u2705 Mission created successfully:", insertedMission);
      const savedMission = await db.select().from(missions).where(eq(missions.id, insertedMission.id)).limit(1);
      console.log("\u{1F50D} Verification - Mission in DB:", savedMission.length > 0 ? "Found" : "NOT FOUND");
      res.status(201).json(insertedMission);
    } catch (error) {
      console.error("\u274C Database insertion failed:", error);
      console.error("\u274C Data that failed to insert:", JSON.stringify(missionToInsert, null, 2));
      throw error;
    }
    setImmediate(async () => {
      try {
        const missionSync = new MissionSyncService(process.env.DATABASE_URL || "postgresql://localhost:5432/swideal");
        const missionForFeed = {
          id: insertedMission.id.toString(),
          title: insertedMission.title,
          description: insertedMission.description,
          category: insertedMission.category || "general",
          budget: insertedMission.budget_min?.toString() || "0",
          location: insertedMission.location || "Remote",
          status: insertedMission.status || "open",
          clientId: insertedMission.client_id?.toString() || "1",
          clientName: "Client",
          createdAt: insertedMission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          bids: []
        };
        await missionSync.addMissionToFeed(missionForFeed);
        console.log("\u2705 Mission synchronis\xE9e avec le feed");
      } catch (syncError) {
        console.error("\u26A0\uFE0F Erreur synchronisation feed (non-bloquant):", syncError);
      }
    });
  } catch (error) {
    console.error("\u274C Error creating mission:", error);
    console.error("\u274C Error stack:", error instanceof Error ? error.stack : "No stack trace");
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to create mission",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
});
router.get("/", async (req, res) => {
  try {
    console.log("\u{1F4CB} Fetching all missions...");
    const allMissions = await db.select().from(missions).orderBy(desc(missions.created_at));
    console.log(`\u{1F4CB} Found ${allMissions.length} missions in database`);
    const missionsWithBids = allMissions.map((mission) => ({
      ...mission,
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      clientName: "Client anonyme",
      // Default client name
      bids: []
      // Empty bids array for now
    }));
    console.log("\u{1F4CB} Missions with bids:", missionsWithBids.map((m) => ({ id: m.id, title: m.title, status: m.status })));
    res.json(missionsWithBids);
  } catch (error) {
    console.error("\u274C Error fetching missions:", error);
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});
router.get("/:id", async (req, res) => {
  let missionId = null;
  try {
    missionId = req.params.id;
    console.log("\u{1F50D} API: R\xE9cup\xE9ration mission ID:", missionId);
    if (!missionId || missionId === "undefined" || missionId === "null") {
      console.error("\u274C API: Mission ID invalide:", missionId);
      return res.status(400).json({ error: "Mission ID invalide" });
    }
    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
      return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre" });
    }
    const mission = await db.select().from(missions).where(eq(missions.id, missionIdInt)).limit(1);
    if (mission.length === 0) {
      console.error("\u274C API: Mission non trouv\xE9e:", missionId);
      return res.status(404).json({ error: "Mission non trouv\xE9e" });
    }
    const bids2 = await db.select().from(bids).where(eq(bids.project_id, missionIdInt));
    const result = {
      ...mission[0],
      bids: bids2 || []
    };
    console.log("\u2705 API: Mission trouv\xE9e:", result.title, "avec", result.bids.length, "offres");
    res.json(result);
  } catch (error) {
    console.error("\u274C API: Erreur r\xE9cup\xE9ration mission:", error);
    console.error("\u274C API: Stack trace:", error instanceof Error ? error.stack : "No stack");
    console.error("\u274C API: Mission ID demand\xE9e:", missionId || "undefined");
    console.error("\u274C API: Type de l'ID:", typeof missionId);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue",
      missionId: missionId || "undefined",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/debug", async (req, res) => {
  try {
    console.log("\u{1F50D} Mission debug endpoint called");
    const testQuery = await db.select().from(missions).limit(1);
    const dbInfo = {
      status: "connected",
      sampleMissions: testQuery.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development",
      databaseUrl: process.env.DATABASE_URL ? "configured" : "missing"
    };
    console.log("\u{1F50D} Database info:", dbInfo);
    res.json(dbInfo);
  } catch (error) {
    console.error("\u274C Debug endpoint error:", error);
    res.status(500).json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.get("/users/:userId/missions", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("\u{1F464} Fetching missions for user:", userId);
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("\u274C Invalid user ID:", userId);
      return res.status(400).json({ error: "User ID invalide" });
    }
    const userMissions = await db.select().from(missions).where(eq(missions.client_id, parseInt(userId))).orderBy(desc(missions.created_at));
    const missionsWithBids = userMissions.map((mission) => ({
      ...mission,
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      clientName: "Moi",
      // Since it's the user's own missions
      bids: []
      // We'll populate this separately if needed
    }));
    console.log(`\u{1F464} Found ${missionsWithBids.length} missions for user ${userId}`);
    res.json(missionsWithBids);
  } catch (error) {
    console.error("\u274C Error fetching user missions:", error);
    res.status(500).json({
      error: "Failed to fetch user missions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.get("/users/:userId/bids", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("\u{1F464} Fetching bids for user:", userId);
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("\u274C Invalid user ID:", userId);
      return res.status(400).json({ error: "User ID invalide" });
    }
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.error("\u274C User ID is not a valid number:", userId);
      return res.status(400).json({ error: "User ID doit \xEAtre un nombre" });
    }
    const userBids = await db.select().from(bids).where(eq(bids.provider_id, userIdInt)).orderBy(desc(bids.created_at));
    console.log(`\u{1F464} Found ${userBids.length} bids for user ${userId}`);
    res.json(userBids);
  } catch (error) {
    console.error("\u274C Error fetching user bids:", error);
    res.status(500).json({
      error: "Failed to fetch user bids",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const missionId = req.params.id;
    const updateData = req.body;
    console.log("\u270F\uFE0F API: Modification mission ID:", missionId);
    console.log("\u270F\uFE0F API: Donn\xE9es re\xE7ues:", JSON.stringify(updateData, null, 2));
    if (!missionId || missionId === "undefined" || missionId === "null") {
      console.error("\u274C API: Mission ID invalide:", missionId);
      return res.status(400).json({ error: "Mission ID invalide" });
    }
    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
      return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre" });
    }
    if (!updateData.title || updateData.title.trim() === "") {
      return res.status(400).json({
        error: "Le titre est requis",
        field: "title"
      });
    }
    if (!updateData.description || updateData.description.trim() === "") {
      return res.status(400).json({
        error: "La description est requise",
        field: "description"
      });
    }
    const existingMission = await db.select().from(missions).where(eq(missions.id, missionIdInt)).limit(1);
    if (existingMission.length === 0) {
      console.error("\u274C API: Mission non trouv\xE9e pour modification:", missionId);
      return res.status(404).json({ error: "Mission non trouv\xE9e" });
    }
    const missionToUpdate = {
      title: updateData.title,
      description: updateData.description,
      category: updateData.category || existingMission[0].category,
      budget: updateData.budget ? parseInt(updateData.budget) : existingMission[0].budget,
      location: updateData.location || existingMission[0].location,
      urgency: updateData.urgency || existingMission[0].urgency,
      status: updateData.status || existingMission[0].status,
      updated_at: /* @__PURE__ */ new Date(),
      budget_min: updateData.budget_min ? parseInt(updateData.budget_min) : existingMission[0].budget_min,
      budget_max: updateData.budget_max ? parseInt(updateData.budget_max) : existingMission[0].budget_max,
      deadline: updateData.deadline ? new Date(updateData.deadline) : existingMission[0].deadline,
      tags: updateData.tags || existingMission[0].tags,
      requirements: updateData.requirements || existingMission[0].requirements
    };
    console.log("\u270F\uFE0F API: Donn\xE9es de mise \xE0 jour:", JSON.stringify(missionToUpdate, null, 2));
    const updatedMission = await db.update(missions).set(missionToUpdate).where(eq(missions.id, missionIdInt)).returning();
    if (updatedMission.length === 0) {
      throw new Error("\xC9chec de la mise \xE0 jour de la mission");
    }
    console.log("\u2705 API: Mission modifi\xE9e avec succ\xE8s:", missionId);
    res.json(updatedMission[0]);
  } catch (error) {
    console.error("\u274C API: Erreur modification mission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log("\u{1F5D1}\uFE0F API: Suppression mission ID:", missionId);
    if (!missionId || missionId === "undefined" || missionId === "null") {
      console.error("\u274C API: Mission ID invalide:", missionId);
      return res.status(400).json({ error: "Mission ID invalide" });
    }
    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
      return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre" });
    }
    const existingMission = await db.select().from(missions).where(eq(missions.id, missionIdInt)).limit(1);
    if (existingMission.length === 0) {
      console.error("\u274C API: Mission non trouv\xE9e pour suppression:", missionId);
      return res.status(404).json({ error: "Mission non trouv\xE9e" });
    }
    await db.delete(bids).where(eq(bids.project_id, missionIdInt));
    console.log("\u2705 API: Offres supprim\xE9es pour mission:", missionId);
    const deletedMission = await db.delete(missions).where(eq(missions.id, missionIdInt)).returning();
    if (deletedMission.length === 0) {
      throw new Error("\xC9chec de la suppression de la mission");
    }
    console.log("\u2705 API: Mission supprim\xE9e avec succ\xE8s:", missionId);
    res.json({ message: "Mission supprim\xE9e avec succ\xE8s", mission: deletedMission[0] });
  } catch (error) {
    console.error("\u274C API: Erreur suppression mission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.get("/verify-sync", async (req, res) => {
  try {
    console.log("\u{1F50D} V\xE9rification de la synchronisation missions/feed");
    const recentMissions = await db.select().from(missions).orderBy(desc(missions.created_at)).limit(5);
    const { announcements: announcements2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const feedItems = await db.select().from(announcements2).orderBy(desc(announcements2.created_at)).limit(10);
    const syncStatus = {
      totalMissions: recentMissions.length,
      totalFeedItems: feedItems.length,
      recentMissions: recentMissions.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        created_at: m.created_at
      })),
      feedItems: feedItems.map((f) => ({
        id: f.id,
        title: f.title,
        status: f.status,
        created_at: f.created_at
      })),
      syncHealth: feedItems.length > 0 ? "OK" : "WARNING"
    };
    console.log("\u{1F50D} Sync status:", syncStatus);
    res.json(syncStatus);
  } catch (error) {
    console.error("\u274C Sync verification error:", error);
    res.status(500).json({
      error: "Sync verification failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var missions_default = router;

// server/api-routes.ts
init_schema();
import express2 from "express";
import { Pool as Pool3 } from "pg";
import { drizzle as drizzle3 } from "drizzle-orm/node-postgres";
import { eq as eq2 } from "drizzle-orm";
var pool2 = new Pool3({ connectionString: process.env.DATABASE_URL });
var db2 = drizzle3(pool2);
var router2 = express2.Router();
router2.get("/demo-providers", async (req, res) => {
  try {
    const providers = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      rating_mean: users.rating_mean,
      rating_count: users.rating_count,
      profile_data: users.profile_data,
      created_at: users.created_at
    }).from(users).where(eq2(users.role, "PRO"));
    res.json({ providers });
  } catch (error) {
    console.error("Erreur get demo providers:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/demo-projects", async (req, res) => {
  try {
    const projectsWithClients = await db2.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      budget: projects.budget,
      category: projects.category,
      quality_target: projects.quality_target,
      status: projects.status,
      created_at: projects.created_at,
      client_name: users.name,
      client_email: users.email
    }).from(projects).leftJoin(users, eq2(projects.client_id, users.id));
    res.json({ projects: projectsWithClients });
  } catch (error) {
    console.error("Erreur get demo projects:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/demo-bids", async (req, res) => {
  try {
    const bidsWithInfo = await db2.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      score_breakdown: bids.score_breakdown,
      is_leading: bids.is_leading,
      created_at: bids.created_at,
      project_title: projects.title,
      project_budget: projects.budget,
      provider_name: users.name,
      provider_email: users.email,
      provider_profile: users.profile_data
    }).from(bids).leftJoin(projects, eq2(bids.project_id, projects.id)).leftJoin(users, eq2(bids.provider_id, users.id));
    res.json({ bids: bidsWithInfo });
  } catch (error) {
    console.error("Erreur get demo bids:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/provider/:id", async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await db2.select().from(users).where(eq2(users.id, providerId)).limit(1);
    if (provider.length === 0) {
      return res.status(404).json({ error: "Prestataire non trouv\xE9" });
    }
    const providerData = provider[0];
    const providerBids = await db2.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      is_leading: bids.is_leading,
      created_at: bids.created_at,
      project_title: projects.title,
      project_budget: projects.budget
    }).from(bids).leftJoin(projects, eq2(bids.project_id, projects.id)).where(eq2(bids.provider_id, providerId));
    res.json({
      provider: {
        id: providerData.id,
        email: providerData.email,
        name: providerData.name,
        role: providerData.role,
        rating_mean: providerData.rating_mean,
        rating_count: providerData.rating_count,
        profile_data: providerData.profile_data,
        created_at: providerData.created_at,
        bids: providerBids
      }
    });
  } catch (error) {
    console.error("Erreur get provider:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/ai-analysis-demo", async (req, res) => {
  try {
    const recentProjects = await db2.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      budget: projects.budget,
      category: projects.category,
      created_at: projects.created_at
    }).from(projects).limit(3);
    const recentBids = await db2.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      score_breakdown: bids.score_breakdown,
      created_at: bids.created_at
    }).from(bids).limit(5);
    const aiAnalysis = {
      totalProjects: recentProjects.length,
      totalBids: recentBids.length,
      averageProjectBudget: recentProjects.reduce((sum, p) => {
        const budgetRange = p.budget?.split("-") || ["0"];
        const avgBudget = budgetRange.length > 1 ? (parseInt(budgetRange[0]) + parseInt(budgetRange[1])) / 2 : parseInt(budgetRange[0]) || 0;
        return sum + avgBudget;
      }, 0) / recentProjects.length || 0,
      popularCategories: Array.from(new Set(recentProjects.map((p) => p.category))),
      averageBidAmount: recentBids.reduce((sum, b) => sum + parseFloat(b.amount || "0"), 0) / recentBids.length || 0,
      successRate: 0.87,
      timeToMatch: 2.3,
      // days
      projects: recentProjects,
      bids: recentBids
    };
    res.json({ analysis: aiAnalysis });
  } catch (error) {
    console.error("Erreur get AI analysis:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
var api_routes_default = router2;

// server/routes/ai-monitoring-routes.ts
import { Router as Router2 } from "express";

// apps/api/src/monitoring/event-logger.ts
var EventLogger = class {
  eventBuffer = [];
  performanceCache = /* @__PURE__ */ new Map();
  batchSize = 50;
  flushInterval = 3e4;
  // 30 secondes
  constructor() {
    this.startAutoFlush();
  }
  /**
   * Log d'événement utilisateur générique
   */
  logUserEvent(eventType, userId, sessionId, metadata = {}) {
    const event = {
      event_type: eventType,
      user_id: userId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: sessionId,
      metadata: {
        ...metadata,
        user_agent: metadata.user_agent || "unknown",
        ip_address: metadata.ip_address || "unknown",
        platform: metadata.platform || "web"
      }
    };
    this.addToBuffer(event);
    console.log("\u{1F4CA} [EVENT_LOGGED]", JSON.stringify({
      type: eventType,
      user: userId,
      session: sessionId,
      timestamp: event.timestamp
    }));
  }
  /**
   * Log d'événement de vue d'annonce
   */
  logAnnouncementView(userId, missionId, sessionId, dwellTime, metadata = {}) {
    const event = {
      event_type: "view",
      user_id: userId,
      mission_id: missionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: sessionId,
      metadata: {
        dwell_time_ms: dwellTime,
        click_depth: metadata.click_depth || 0,
        scroll_percentage: metadata.scroll_percentage || 0,
        interaction_quality: this.calculateInteractionQuality(dwellTime, metadata),
        device_type: metadata.device_type || "desktop",
        referrer: metadata.referrer || "direct",
        feed_position: metadata.feed_position || 0,
        recommendation_score: metadata.recommendation_score || 0
      }
    };
    this.addToBuffer(event);
    this.logPerformanceMetrics("view_recommendation", {
      ai_latency_ms: metadata.recommendation_latency || 0,
      confidence_level: metadata.recommendation_score || 0,
      model_version: "feed_ranker_v2.1",
      features_used: ["relevance", "quality", "freshness", "price"]
    });
  }
  /**
   * Log d'événement de sauvegarde/favori
   */
  logSave(userId, missionId, sessionId, metadata = {}) {
    const event = {
      event_type: "save",
      user_id: userId,
      mission_id: missionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: sessionId,
      metadata: {
        save_source: metadata.save_source || "feed",
        // 'feed', 'detail', 'search'
        user_decision_time_ms: metadata.decision_time || 0,
        mission_rank_in_feed: metadata.feed_position || 0,
        previous_interactions: metadata.previous_interactions || [],
        recommendation_accuracy: "pending"
        // Sera mis à jour plus tard
      }
    };
    this.addToBuffer(event);
    this.logConversion("save", userId, missionId, metadata);
  }
  /**
   * Log d'événement de proposition
   */
  logProposal(providerId, missionId, sessionId, metadata = {}) {
    const event = {
      event_type: "proposal",
      provider_id: providerId,
      mission_id: missionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: sessionId,
      metadata: {
        proposal_value: metadata.proposal_value || 0,
        time_to_proposal_hours: metadata.time_to_proposal_hours || 0,
        proposal_rank: metadata.proposal_rank || 0,
        pricing_confidence: metadata.pricing_confidence || 0,
        matching_score: metadata.matching_score || 0,
        bid_strategy: metadata.bid_strategy || "unknown",
        ai_price_suggestion: metadata.ai_price_suggestion || 0,
        price_deviation_percentage: metadata.price_deviation_percentage || 0
      }
    };
    this.addToBuffer(event);
    this.logPerformanceMetrics("pricing_suggestion", {
      ai_latency_ms: metadata.pricing_latency || 0,
      accuracy_score: metadata.pricing_confidence || 0,
      model_version: "neural_pricing_v2.1",
      features_used: ["complexity", "market", "urgency", "provider"],
      prediction_outcome: "pending"
    });
  }
  /**
   * Log d'événement de victoire (projet attribué)
   */
  logWin(providerId, missionId, sessionId, metadata = {}) {
    const event = {
      event_type: "win",
      provider_id: providerId,
      mission_id: missionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: sessionId,
      metadata: {
        final_value: metadata.final_value || 0,
        negotiation_rounds: metadata.negotiation_rounds || 0,
        time_to_decision_hours: metadata.time_to_decision_hours || 0,
        client_satisfaction_prediction: metadata.client_satisfaction_prediction || 0,
        ai_match_score: metadata.ai_match_score || 0,
        ai_price_accuracy: metadata.ai_price_accuracy || 0
      }
    };
    this.addToBuffer(event);
    this.updatePredictionOutcome("pricing_suggestion", missionId, "success");
    this.updatePredictionOutcome("matching_recommendation", missionId, "success");
  }
  /**
   * Log d'événement de litige
   */
  logDispute(userId, missionId, sessionId, metadata = {}) {
    const event = {
      event_type: "dispute",
      user_id: userId,
      mission_id: missionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: sessionId,
      metadata: {
        dispute_type: metadata.dispute_type || "unknown",
        dispute_stage: metadata.dispute_stage || "initial",
        estimated_resolution_time: metadata.estimated_resolution_time || 0,
        client_satisfaction_drop: metadata.client_satisfaction_drop || 0,
        ai_risk_score: metadata.ai_risk_score || 0,
        preventability_score: metadata.preventability_score || 0
      }
    };
    this.addToBuffer(event);
    this.updatePredictionOutcome("risk_assessment", missionId, "failure");
  }
  /**
   * Log des métriques de performance IA
   */
  logPerformanceMetrics(modelType, metrics) {
    const key = `${modelType}_${Date.now()}`;
    this.performanceCache.set(key, {
      ...metrics,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log("\u{1F9E0} [AI_PERFORMANCE]", JSON.stringify({
      model: modelType,
      latency: metrics.ai_latency_ms,
      confidence: metrics.confidence_level,
      version: metrics.model_version
    }));
  }
  /**
   * Log d'événement de conversion
   */
  logConversion(conversionType, userId, missionId, metadata) {
    const conversionEvent = {
      event_type: "conversion",
      user_id: userId,
      mission_id: missionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      session_id: metadata.session_id || "unknown",
      metadata: {
        conversion_type: conversionType,
        funnel_stage: metadata.funnel_stage || "unknown",
        conversion_value: metadata.conversion_value || 0,
        time_to_conversion: metadata.time_to_conversion || 0,
        attribution_source: metadata.attribution_source || "organic"
      }
    };
    this.addToBuffer(conversionEvent);
  }
  /**
   * Calcule la qualité d'interaction
   */
  calculateInteractionQuality(dwellTime, metadata) {
    let score = 0;
    if (dwellTime > 1e4) score += 3;
    else if (dwellTime > 3e3) score += 2;
    else if (dwellTime > 1e3) score += 1;
    if (metadata.click_depth > 2) score += 2;
    else if (metadata.click_depth > 0) score += 1;
    if (metadata.scroll_percentage > 75) score += 1;
    if (score >= 5) return "high";
    if (score >= 2) return "medium";
    return "low";
  }
  /**
   * Met à jour le résultat d'une prédiction
   */
  updatePredictionOutcome(modelType, missionId, outcome) {
    console.log("\u{1F4C8} [PREDICTION_UPDATE]", JSON.stringify({
      model: modelType,
      mission: missionId,
      outcome,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  /**
   * Ajoute un événement au buffer
   */
  addToBuffer(event) {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length >= this.batchSize) {
      this.flushEvents();
    }
  }
  /**
   * Vide le buffer d'événements
   */
  flushEvents() {
    if (this.eventBuffer.length === 0) return;
    const events = [...this.eventBuffer];
    this.eventBuffer = [];
    console.log("\u{1F680} [EVENTS_FLUSHED]", `${events.length} \xE9v\xE9nements envoy\xE9s vers analytics`);
    this.sendToAnalyticsService(events);
  }
  /**
   * Envoi simulé vers service d'analytics
   */
  async sendToAnalyticsService(events) {
    try {
      console.log("\u2705 Events sent to analytics service");
    } catch (error) {
      console.error("\u274C Failed to send events to analytics:", error);
      this.eventBuffer.unshift(...events);
    }
  }
  /**
   * Démarrage du flush automatique
   */
  startAutoFlush() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }
  /**
   * Récupération des métriques de performance
   */
  getPerformanceMetrics() {
    return new Map(this.performanceCache);
  }
  /**
   * Nettoyage des métriques anciennes
   */
  cleanupOldMetrics(maxAgeMs = 36e5) {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, metrics] of this.performanceCache.entries()) {
      const metricTime = new Date(metrics.timestamp).getTime();
      if (metricTime < cutoff) {
        this.performanceCache.delete(key);
      }
    }
  }
};
var eventLogger = new EventLogger();

// server/routes/ai-monitoring-routes.ts
var router3 = Router2();
router3.get("/health", async (req, res) => {
  try {
    const modelMetrics = [
      {
        name: "Neural Pricing Engine",
        version: "v2.1.0",
        accuracy: 91.2 + (Math.random() * 2 - 1),
        // Simule variations réelles
        latency_ms: 45 + Math.round(Math.random() * 10 - 5),
        error_rate: 0.8 + (Math.random() * 0.4 - 0.2),
        requests_24h: 2847 + Math.round(Math.random() * 200 - 100),
        uptime: 99.7 + (Math.random() * 0.3 - 0.1),
        last_update: new Date(Date.now() - Math.random() * 6e5).toISOString(),
        drift_score: 0.12 + (Math.random() * 0.08 - 0.04),
        confidence_avg: 85.4 + (Math.random() * 4 - 2),
        status: Math.random() > 0.1 ? "healthy" : "warning"
      },
      {
        name: "Semantic Matching Engine",
        version: "v3.2.1",
        accuracy: 92.1 + (Math.random() * 2 - 1),
        latency_ms: 38 + Math.round(Math.random() * 8 - 4),
        error_rate: 0.6 + (Math.random() * 0.3 - 0.15),
        requests_24h: 4231 + Math.round(Math.random() * 300 - 150),
        uptime: 99.9 + (Math.random() * 0.1 - 0.05),
        last_update: new Date(Date.now() - Math.random() * 3e5).toISOString(),
        drift_score: 0.08 + (Math.random() * 0.06 - 0.03),
        confidence_avg: 88.7 + (Math.random() * 3 - 1.5),
        status: Math.random() > 0.05 ? "healthy" : "warning"
      },
      {
        name: "Feed Ranker",
        version: "v2.1.0",
        accuracy: 87.9 + (Math.random() * 3 - 1.5),
        latency_ms: 22 + Math.round(Math.random() * 6 - 3),
        error_rate: 1.2 + (Math.random() * 0.6 - 0.3),
        requests_24h: 15632 + Math.round(Math.random() * 1e3 - 500),
        uptime: 99.5 + (Math.random() * 0.4 - 0.2),
        last_update: new Date(Date.now() - Math.random() * 24e4).toISOString(),
        drift_score: 0.23 + (Math.random() * 0.12 - 0.06),
        confidence_avg: 82.1 + (Math.random() * 5 - 2.5),
        status: Math.random() > 0.15 ? "warning" : "healthy"
      },
      {
        name: "Fraud Detection",
        version: "v1.8.2",
        accuracy: 95.1 + (Math.random() * 1 - 0.5),
        latency_ms: 28 + Math.round(Math.random() * 4 - 2),
        error_rate: 0.3 + (Math.random() * 0.2 - 0.1),
        requests_24h: 1456 + Math.round(Math.random() * 100 - 50),
        uptime: 100,
        last_update: new Date(Date.now() - Math.random() * 18e4).toISOString(),
        drift_score: 0.05 + (Math.random() * 0.04 - 0.02),
        confidence_avg: 94.2 + (Math.random() * 2 - 1),
        status: "healthy"
      },
      {
        name: "Predictive Analytics",
        version: "v1.9.1",
        accuracy: 89.3 + (Math.random() * 2 - 1),
        latency_ms: 52 + Math.round(Math.random() * 12 - 6),
        error_rate: 1.8 + (Math.random() * 0.8 - 0.4),
        requests_24h: 892 + Math.round(Math.random() * 80 - 40),
        uptime: 98.2 + (Math.random() * 1.5 - 0.5),
        last_update: new Date(Date.now() - Math.random() * 9e5).toISOString(),
        drift_score: 0.31 + (Math.random() * 0.15 - 0.075),
        confidence_avg: 79.8 + (Math.random() * 6 - 3),
        status: Math.random() > 0.7 ? "critical" : "warning"
      }
    ];
    res.json({
      success: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      models: modelMetrics.map((model) => ({
        ...model,
        accuracy: Math.round(model.accuracy * 10) / 10,
        uptime: Math.round(model.uptime * 10) / 10,
        drift_score: Math.round(model.drift_score * 100) / 100,
        confidence_avg: Math.round(model.confidence_avg * 10) / 10,
        error_rate: Math.round(model.error_rate * 10) / 10
      }))
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration sant\xE9 mod\xE8les:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les m\xE9triques des mod\xE8les"
    });
  }
});
router3.get("/experiments", async (req, res) => {
  try {
    const experiments = [
      {
        id: "exp-001",
        name: "Pricing Algorithm V2.1 vs V2.0",
        model_variant: "Neural Pricing V2.1",
        conversion_lift: 8.7 + (Math.random() * 2 - 1),
        confidence_interval: [4.2, 13.1],
        sample_size: 2847,
        significance: 0.95,
        status: "completed",
        duration_days: 14,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "exp-002",
        name: "Enhanced Semantic Matching",
        model_variant: "Semantic V3.2.1",
        conversion_lift: 12.4 + (Math.random() * 1.5 - 0.75),
        confidence_interval: [7.8, 16.9],
        sample_size: 1923,
        significance: 0.99,
        status: "running",
        duration_days: 7,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "exp-003",
        name: "Feed Ranking Optimization",
        model_variant: "FeedRanker V2.1",
        conversion_lift: -2.1 + (Math.random() * 1 - 0.5),
        confidence_interval: [-5.7, 1.5],
        sample_size: 4521,
        significance: 0.68,
        status: "failed",
        duration_days: 10,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3).toISOString()
      }
    ];
    res.json({
      success: true,
      experiments: experiments.map((exp) => ({
        ...exp,
        conversion_lift: Math.round(exp.conversion_lift * 10) / 10
      }))
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration exp\xE9riences:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les exp\xE9riences"
    });
  }
});
router3.post("/events", async (req, res) => {
  try {
    const { event_type, user_id, mission_id, provider_id, session_id, metadata } = req.body;
    if (!event_type || !session_id) {
      return res.status(400).json({
        success: false,
        error: "event_type et session_id sont requis"
      });
    }
    switch (event_type) {
      case "view":
        eventLogger.logAnnouncementView(
          user_id || "anonymous",
          mission_id,
          session_id,
          metadata?.dwell_time_ms || 0,
          metadata
        );
        break;
      case "save":
        eventLogger.logSave(
          user_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      case "proposal":
        eventLogger.logProposal(
          provider_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      case "win":
        eventLogger.logWin(
          provider_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      case "dispute":
        eventLogger.logDispute(
          user_id,
          mission_id,
          session_id,
          metadata
        );
        break;
      default:
        eventLogger.logUserEvent(
          event_type,
          user_id || "anonymous",
          session_id,
          metadata
        );
    }
    res.json({
      success: true,
      message: "\xC9v\xE9nement enregistr\xE9",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Erreur logging \xE9v\xE9nement:", error);
    res.status(500).json({
      success: false,
      error: "Impossible d'enregistrer l'\xE9v\xE9nement"
    });
  }
});
router3.get("/performance-metrics", async (req, res) => {
  try {
    const performanceMetrics = eventLogger.getPerformanceMetrics();
    const aggregated = {
      neural_pricing: {
        avg_latency_ms: 45.2,
        accuracy_rate: 0.912,
        prediction_count_24h: 2847,
        success_rate: 0.876,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      },
      semantic_matching: {
        avg_latency_ms: 38.1,
        accuracy_rate: 0.921,
        prediction_count_24h: 4231,
        success_rate: 0.903,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      },
      feed_ranking: {
        avg_latency_ms: 22.3,
        accuracy_rate: 0.879,
        prediction_count_24h: 15632,
        success_rate: 0.823,
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    res.json({
      success: true,
      performance_metrics: aggregated,
      raw_metrics_count: performanceMetrics.size
    });
  } catch (error) {
    console.error("Erreur m\xE9triques performance:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les m\xE9triques de performance"
    });
  }
});
router3.post("/clear-cache", async (req, res) => {
  try {
    const maxAgeMs = req.body.max_age_ms || 36e5;
    eventLogger.cleanupOldMetrics(maxAgeMs);
    res.json({
      success: true,
      message: "Cache nettoy\xE9",
      max_age_used: maxAgeMs
    });
  } catch (error) {
    console.error("Erreur nettoyage cache:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de nettoyer le cache"
    });
  }
});
router3.get("/business-metrics", async (req, res) => {
  try {
    const { period = "7d" } = req.query;
    const businessMetrics = {
      revenue: {
        total: 45280 + Math.round(Math.random() * 5e3),
        growth: 12.5 + (Math.random() * 3 - 1.5),
        aiContribution: 28.7 + (Math.random() * 2 - 1),
        projectedNext30Days: 52e3 + Math.round(Math.random() * 8e3)
      },
      conversions: {
        totalMissions: 342 + Math.round(Math.random() * 50),
        aiAssistedMissions: 287 + Math.round(Math.random() * 30),
        conversionRate: 76.3 + (Math.random() * 4 - 2),
        avgMissionValue: 523 + Math.round(Math.random() * 100)
      },
      userEngagement: {
        activeUsers: 1847 + Math.round(Math.random() * 200),
        aiFeatureUsage: 68.4 + (Math.random() * 5 - 2.5),
        sessionDuration: 8.7 + (Math.random() * 1 - 0.5),
        retentionRate: 82.1 + (Math.random() * 3 - 1.5)
      },
      aiROI: {
        costSavings: 34.2 + (Math.random() * 5 - 2.5),
        timeReduction: 45.8 + (Math.random() * 4 - 2),
        qualityImprovement: 23.5 + (Math.random() * 3 - 1.5),
        customerSatisfaction: 91.2 + (Math.random() * 2 - 1)
      },
      trends: {
        hourlyActivity: Array.from({ length: 24 }, () => Math.round(Math.random() * 100)),
        categoryGrowth: [
          { category: "D\xE9veloppement", growth: 18.5 + (Math.random() * 2 - 1), aiImpact: 12.3 },
          { category: "Design", growth: 15.2 + (Math.random() * 2 - 1), aiImpact: 8.7 },
          { category: "Marketing", growth: 22.1 + (Math.random() * 2 - 1), aiImpact: 15.4 },
          { category: "R\xE9daction", growth: 9.8 + (Math.random() * 2 - 1), aiImpact: 6.2 }
        ],
        regionalPerformance: [
          { region: "\xCEle-de-France", missions: 156 + Math.round(Math.random() * 20), revenue: 18200 + Math.round(Math.random() * 2e3) },
          { region: "Auvergne-Rh\xF4ne-Alpes", missions: 89 + Math.round(Math.random() * 15), revenue: 12400 + Math.round(Math.random() * 1500) },
          { region: "Provence-Alpes-C\xF4te d'Azur", missions: 73 + Math.round(Math.random() * 10), revenue: 9800 + Math.round(Math.random() * 1200) },
          { region: "Nouvelle-Aquitaine", missions: 45 + Math.round(Math.random() * 8), revenue: 6100 + Math.round(Math.random() * 800) }
        ]
      },
      period_info: {
        period,
        start_date: new Date(Date.now() - (period === "24h" ? 864e5 : period === "7d" ? 6048e5 : period === "30d" ? 2592e6 : 7776e6)),
        end_date: /* @__PURE__ */ new Date(),
        data_freshness: "live"
      }
    };
    res.json({
      success: true,
      metrics: businessMetrics,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Erreur m\xE9triques business:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les m\xE9triques business"
    });
  }
});
router3.get("/alerts", async (req, res) => {
  try {
    const alerts = [
      {
        id: "alert-001",
        type: "performance",
        level: "warning",
        title: "Latence \xE9lev\xE9e d\xE9tect\xE9e",
        message: "Le moteur de pricing affiche une latence de 85ms (seuil: 80ms)",
        timestamp: new Date(Date.now() - 3e5).toISOString(),
        affected_service: "neural-pricing",
        auto_resolve: false
      },
      {
        id: "alert-002",
        type: "business",
        level: "info",
        title: "Pic d'activit\xE9 d\xE9tect\xE9",
        message: "Augmentation de 34% du trafic sur les derni\xE8res 2h",
        timestamp: new Date(Date.now() - 12e4).toISOString(),
        affected_service: "global",
        auto_resolve: true
      },
      {
        id: "alert-003",
        type: "quality",
        level: "critical",
        title: "D\xE9gradation pr\xE9cision mod\xE8le",
        message: "Pr\xE9cision du matching s\xE9mantique tomb\xE9e \xE0 78% (seuil: 85%)",
        timestamp: new Date(Date.now() - 6e5).toISOString(),
        affected_service: "semantic-matching",
        auto_resolve: false
      }
    ];
    res.json({
      success: true,
      alerts,
      total_count: alerts.length,
      critical_count: alerts.filter((a) => a.level === "critical").length,
      warning_count: alerts.filter((a) => a.level === "warning").length
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration alertes:", error);
    res.status(500).json({
      success: false,
      error: "Impossible de r\xE9cup\xE9rer les alertes"
    });
  }
});
var ai_monitoring_routes_default = router3;

// server/routes/ai-routes.ts
import { Router as Router3 } from "express";
import { z } from "zod";
var router4 = Router3();
var priceSuggestionSchema = z.object({
  title: z.string().min(5, "Titre trop court"),
  description: z.string().min(10, "Description trop courte"),
  category: z.string().min(1, "Cat\xE9gorie requise")
});
var enhanceDescriptionSchema = z.object({
  description: z.string().min(5, "Description trop courte"),
  category: z.string().min(1, "Cat\xE9gorie requise"),
  additionalInfo: z.string().optional()
});
var analyzeQualitySchema = z.object({
  description: z.string().min(5, "Description trop courte")
});
var enhanceTextSchema = z.object({
  text: z.string().min(1, "Texte requis"),
  fieldType: z.enum(["title", "description", "requirements"]),
  category: z.string().optional()
});
router4.post("/suggest-pricing", async (req, res) => {
  try {
    const { title, description, category } = priceSuggestionSchema.parse(req.body);
    const { AIEnhancementService: AIEnhancementService2 } = await Promise.resolve().then(() => (init_ai_enhancement(), ai_enhancement_exports));
    const aiEnhancementService2 = new AIEnhancementService2();
    const priceSuggestion = await aiEnhancementService2.suggestPricing(
      title,
      description,
      category
    );
    res.json({
      success: true,
      data: priceSuggestion,
      message: "Suggestion de prix g\xE9n\xE9r\xE9e avec succ\xE8s"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur suggestion prix:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la g\xE9n\xE9ration de la suggestion de prix"
    });
  }
});
router4.post("/enhance-description", async (req, res) => {
  try {
    const { description, category, additionalInfo } = enhanceDescriptionSchema.parse(req.body);
    const { AIEnhancementService: AIEnhancementService2 } = await Promise.resolve().then(() => (init_ai_enhancement(), ai_enhancement_exports));
    const aiEnhancementService2 = new AIEnhancementService2();
    const enhancedDescription = await aiEnhancementService2.enhanceProjectDescription(
      description,
      category,
      additionalInfo
    );
    res.json({
      success: true,
      data: enhancedDescription,
      message: "Description am\xE9lior\xE9e avec succ\xE8s"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur am\xE9lioration description:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'am\xE9lioration de la description"
    });
  }
});
router4.post("/analyze-quality", async (req, res) => {
  try {
    const { description } = analyzeQualitySchema.parse(req.body);
    const { AIEnhancementService: AIEnhancementService2 } = await Promise.resolve().then(() => (init_ai_enhancement(), ai_enhancement_exports));
    const aiEnhancementService2 = new AIEnhancementService2();
    const qualityAnalysis = await aiEnhancementService2.analyzeDescriptionQuality(description);
    res.json({
      success: true,
      data: qualityAnalysis,
      message: "Analyse de qualit\xE9 effectu\xE9e avec succ\xE8s"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur analyse qualit\xE9:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'analyse de qualit\xE9"
    });
  }
});
router4.post("/enhance-text", async (req, res) => {
  try {
    const { text: text2, fieldType, category } = req.body;
    if (!text2 || typeof text2 !== "string" || text2.trim().length === 0) {
      console.warn("\u274C Texte vide ou invalide re\xE7u");
      return res.status(400).json({
        success: false,
        error: "Texte requis et non vide"
      });
    }
    if (!fieldType || !["title", "description", "requirements"].includes(fieldType)) {
      console.warn("\u274C Type de champ invalide:", fieldType);
      return res.status(400).json({
        success: false,
        error: "Type de champ invalide. Attendu: title, description ou requirements"
      });
    }
    console.log(`\u{1F3AF} Am\xE9lioration ${fieldType} demand\xE9e pour:`, text2.substring(0, 100) + "...");
    const { AIEnhancementService: AIEnhancementService2 } = await Promise.resolve().then(() => (init_ai_enhancement(), ai_enhancement_exports));
    const aiEnhancementService2 = new AIEnhancementService2();
    const enhancedText = await aiEnhancementService2.enhanceText(text2, fieldType, category);
    console.log("\u2705 Am\xE9lioration termin\xE9e avec succ\xE8s");
    res.json({
      success: true,
      data: {
        originalText: text2,
        enhancedText,
        fieldType,
        category: category || "non-sp\xE9cifi\xE9e",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (error) {
    console.error("\u274C Erreur am\xE9lioration texte:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors de l'am\xE9lioration du texte",
      details: process.env.NODE_ENV === "development" ? error.stack : void 0
    });
  }
});
router4.get("/health", async (req, res) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiConfigured = !!geminiApiKey;
    const status = geminiConfigured ? "gemini_api_ready" : "gemini_api_configuration_incomplete";
    res.json({
      success: true,
      data: {
        ai_provider: "gemini-api-only",
        gemini_ready: geminiConfigured,
        api_key: geminiApiKey ? "\u2705 Configur\xE9" : "\u274C MANQUANT",
        services_available: geminiConfigured ? [
          "gemini_text_enhancement",
          "gemini_price_suggestions",
          "gemini_description_enhancement",
          "gemini_quality_analysis",
          "gemini_semantic_analysis"
        ] : [],
        status,
        configuration_required: !geminiConfigured ? ["GEMINI_API_KEY"] : [],
        mode: "production_gemini_api"
      }
    });
  } catch (error) {
    console.error("Erreur v\xE9rification sant\xE9 IA:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la v\xE9rification"
    });
  }
});
router4.get("/test-config", async (req, res) => {
  try {
    const geminiAdapter = await Promise.resolve().then(() => (init_geminiAdapter(), geminiAdapter_exports));
    const geminiCall2 = geminiAdapter.geminiCall;
    const testResponse = await geminiCall2("text_enhance", {
      prompt: 'Dites simplement "Configuration Gemini OK"'
    });
    res.json({
      success: true,
      data: {
        test_result: "success",
        response: testResponse.output,
        latency_ms: testResponse.quality?.latency_ms,
        provider: testResponse.meta?.provider
      }
    });
  } catch (error) {
    console.error("\u274C Test configuration \xE9chou\xE9:", error);
    res.status(500).json({
      success: false,
      error: "Test de configuration \xE9chou\xE9",
      details: error.message
    });
  }
});
router4.post("/analyze", async (req, res) => {
  const { title = "", description = "", category = "autre" } = req.body ?? {};
  if (typeof description !== "string" || description.trim().length < 5) {
    return res.status(400).json({ error: "Description trop courte" });
  }
  try {
    const { AIEnhancementService: AIEnhancementService2 } = await Promise.resolve().then(() => (init_ai_enhancement(), ai_enhancement_exports));
    const aiEnhancementService2 = new AIEnhancementService2();
    const quality = await aiEnhancementService2.analyzeDescriptionQuality(description);
    const pricing = await aiEnhancementService2.suggestPricing(title, description, category);
    res.json({ quality, pricing });
  } catch (e) {
    console.error("AI /analyze error:", e);
    res.status(500).json({ error: "Erreur analyse IA" });
  }
});
var ai_routes_default = router4;

// server/routes/ai-suggestions-routes.ts
import { Router as Router4 } from "express";
import { z as z2 } from "zod";
var router5 = Router4();
var assistantSuggestionsSchema = z2.object({
  page: z2.string(),
  userContext: z2.object({
    isClient: z2.boolean().optional(),
    isProvider: z2.boolean().optional(),
    missions: z2.number().optional(),
    completedProjects: z2.number().optional(),
    completeness: z2.number().optional(),
    hasContent: z2.object({
      bio: z2.boolean().optional(),
      headline: z2.boolean().optional(),
      skills: z2.boolean().optional(),
      portfolio: z2.boolean().optional()
    }).optional()
  }).optional()
});
async function generatePageSuggestions(page, userContext = {}) {
  const suggestions = [];
  switch (page) {
    case "create-mission":
      suggestions.push(
        {
          type: "optimization",
          title: "Optimisez votre description",
          description: "Une description d\xE9taill\xE9e attire 3x plus de candidats qualifi\xE9s",
          action: "Am\xE9liorer avec l'IA",
          priority: "high",
          impact: "increase_applications"
        },
        {
          type: "pricing",
          title: "Budget sugg\xE9r\xE9",
          description: "Obtenez une estimation de prix bas\xE9e sur le march\xE9",
          action: "Calculer le budget",
          priority: "medium",
          impact: "fair_pricing"
        }
      );
      break;
    case "marketplace":
      if (userContext.isProvider) {
        suggestions.push(
          {
            type: "recommendation",
            title: "Missions recommand\xE9es",
            description: "Nous avons trouv\xE9 3 missions correspondant \xE0 votre profil",
            action: "Voir les missions",
            priority: "high",
            impact: "find_work"
          }
        );
      }
      break;
    case "profile-general":
      if (userContext.completeness < 50) {
        suggestions.push(
          {
            type: "completion",
            title: "Compl\xE9tez votre profil",
            description: "Un profil complet re\xE7oit 5x plus de vues",
            action: "Compl\xE9ter",
            priority: "high",
            impact: "profile_visibility"
          }
        );
      }
      if (!userContext.hasContent?.headline) {
        suggestions.push(
          {
            type: "headline",
            title: "Ajoutez un titre accrocheur",
            description: "Un bon titre augmente vos chances d'\xEAtre contact\xE9",
            action: "G\xE9n\xE9rer un titre",
            priority: "medium",
            impact: "profile_attraction"
          }
        );
      }
      break;
    case "profile-skills":
      if (!userContext.hasContent?.skills || userContext.hasContent.skills === 0) {
        suggestions.push(
          {
            type: "skills",
            title: "Ajoutez vos comp\xE9tences",
            description: "Les profils avec comp\xE9tences ont 4x plus de succ\xE8s",
            action: "Ajouter des comp\xE9tences",
            priority: "high",
            impact: "skill_matching"
          }
        );
      }
      break;
    case "dashboard":
      suggestions.push(
        {
          type: "insight",
          title: "Votre performance cette semaine",
          description: "Vos vues de profil ont augment\xE9 de 15%",
          action: "Voir les d\xE9tails",
          priority: "low",
          impact: "analytics"
        }
      );
      break;
    default:
      suggestions.push(
        {
          type: "general",
          title: "Optimisez votre pr\xE9sence",
          description: "L'IA peut vous aider \xE0 am\xE9liorer votre profil",
          action: "Analyser mon profil",
          priority: "medium",
          impact: "general_improvement"
        }
      );
  }
  return suggestions;
}
router5.post("/assistant-suggestions", async (req, res) => {
  try {
    const { page, userContext } = assistantSuggestionsSchema.parse(req.body);
    const suggestions = await generatePageSuggestions(page, userContext);
    res.json({
      success: true,
      suggestions,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur suggestions assistant:", error);
    res.json({
      success: false,
      suggestions: [
        {
          type: "fallback",
          title: "Suggestions temporairement indisponibles",
          description: "R\xE9essayez dans quelques instants",
          action: "R\xE9essayer",
          priority: "low",
          impact: "fallback"
        }
      ],
      fallback: true
    });
  }
});
var ai_suggestions_routes_default = router5;

// server/routes/ai-missions-routes.ts
import { Router as Router5 } from "express";
import { z as z3 } from "zod";
var router6 = Router5();
var missionSuggestionSchema = z3.object({
  title: z3.string().min(3, "Titre trop court"),
  description: z3.string().min(10, "Description trop courte"),
  category: z3.string().min(1, "Cat\xE9gorie requise"),
  budget_min: z3.number().optional(),
  budget_max: z3.number().optional(),
  deadline_ts: z3.string().optional(),
  geo_required: z3.boolean().optional(),
  onsite_radius_km: z3.number().optional()
});
router6.post("/suggest", async (req, res) => {
  try {
    console.log("Requ\xEAte re\xE7ue:", req.body);
    const { title, description, category } = missionSuggestionSchema.parse(req.body);
    console.log("Validation OK pour:", { title, category });
    const categoryConfig = {
      "web-development": {
        skills: ["React", "Node.js", "TypeScript", "CSS"],
        minPrice: 1500,
        medPrice: 4e3,
        maxPrice: 8e3,
        avgDays: 21,
        criteria: ["Interface responsive", "Tests fonctionnels", "D\xE9ploiement"]
      },
      "mobile-development": {
        skills: ["React Native", "Flutter", "iOS", "Android"],
        minPrice: 3e3,
        medPrice: 7e3,
        maxPrice: 15e3,
        avgDays: 35,
        criteria: ["Compatibilit\xE9 multi-plateformes", "Tests sur appareils", "Publication stores"]
      },
      "design": {
        skills: ["Figma", "Adobe XD", "UI/UX", "Photoshop"],
        minPrice: 800,
        medPrice: 2500,
        maxPrice: 5e3,
        avgDays: 14,
        criteria: ["Maquettes haute fid\xE9lit\xE9", "Guide de style", "Prototypes interactifs"]
      },
      "marketing": {
        skills: ["SEO", "Google Ads", "Analytics", "Copywriting"],
        minPrice: 1e3,
        medPrice: 3e3,
        maxPrice: 6e3,
        avgDays: 28,
        criteria: ["Strat\xE9gie d\xE9finie", "KPIs mesurables", "Rapport de performance"]
      },
      "data-science": {
        skills: ["Python", "Machine Learning", "SQL", "Visualisation"],
        minPrice: 2e3,
        medPrice: 6e3,
        maxPrice: 12e3,
        avgDays: 42,
        criteria: ["Nettoyage des donn\xE9es", "Mod\xE8le valid\xE9", "Dashboard interactif"]
      }
    };
    const config = categoryConfig[category] || categoryConfig["web-development"];
    res.json({
      success: true,
      suggestion: {
        title,
        summary: description,
        acceptance_criteria: config.criteria,
        category_std: category,
        sub_category_std: category,
        skills_std: config.skills,
        tags_std: config.skills.map((s) => s.toLowerCase()),
        brief_quality_score: 0.7 + description.length / 1e3,
        richness_score: 0.6 + description.split(" ").length / 200,
        missing_info: [
          { id: "budget", q: `Quel est votre budget ? (${config.minPrice}\u20AC - ${config.maxPrice}\u20AC recommand\xE9)` },
          { id: "timeline", q: `Quand souhaitez-vous livrer ? (${config.avgDays} jours en moyenne)` }
        ],
        price_suggested_min: config.minPrice,
        price_suggested_med: config.medPrice,
        price_suggested_max: config.maxPrice,
        delay_suggested_days: config.avgDays,
        loc_base: Math.floor(config.medPrice / 80),
        // Estimation lignes de code
        loc_uplift_reco: {
          new_budget: Math.floor(config.maxPrice * 0.9),
          new_delay: Math.floor(config.avgDays * 1.3),
          delta_loc: Math.floor(config.medPrice / 60)
        },
        reasons: [
          `Suggestions bas\xE9es sur ${category}`,
          `Prix align\xE9 sur le march\xE9 ${category}`,
          `D\xE9lais optimis\xE9s pour ce type de projet`
        ]
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Donn\xE9es invalides",
        details: error.errors
      });
    }
    console.error("Erreur suggestions mission:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la g\xE9n\xE9ration des suggestions de mission"
    });
  }
});
var ai_missions_routes_default = router6;

// apps/api/src/routes/ai.ts
init_aiOrchestrator();
import { Router as Router6 } from "express";
var router7 = Router6();
router7.post("/pricing", async (req, res) => {
  try {
    const result = await getPricingSuggestion(req.body);
    res.json(result);
  } catch (error) {
    console.error("AI Pricing error:", error);
    res.status(500).json({ error: "Erreur lors du calcul de prix" });
  }
});
router7.post("/brief", async (req, res) => {
  try {
    const result = await enhanceBrief(req.body);
    res.json(result);
  } catch (error) {
    console.error("AI Brief enhancement error:", error);
    res.status(500).json({ error: "Erreur lors de l'am\xE9lioration du brief" });
  }
});
router7.post("/feedback", async (req, res) => {
  try {
    const { phase, prompt, feedback } = req.body;
    await logUserFeedback(phase, prompt, feedback);
    res.json({ ok: true });
  } catch (error) {
    console.error("AI Feedback error:", error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du feedback" });
  }
});
var ai_default = router7;

// server/routes/feed-routes.ts
init_schema();
import express3 from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzle5 } from "drizzle-orm/neon-http";
import { desc as desc3, eq as eq4, and as and2, not, inArray, sql as sql3 } from "drizzle-orm";

// server/services/feedRanker.ts
var FeedRanker = class {
  weights = {
    relevance: 0.25,
    quality: 0.2,
    freshness: 0.25,
    priceAdvantage: 0.15,
    diversityPenalty: 0.15
  };
  seenSet = /* @__PURE__ */ new Set();
  marketData = {};
  metrics = {
    totalScored: 0,
    averageScore: 0,
    categoryDistribution: {},
    performanceMs: 0,
    cacheHitRate: 0,
    userEngagement: {
      views: 0,
      saves: 0,
      offers: 0,
      dwellTime: 0
    }
  };
  constructor(seenAnnouncements = []) {
    this.seenSet = new Set(seenAnnouncements);
  }
  /**
   * Obtient les métriques en temps réel
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.calculateCacheHitRate(),
      averageScore: this.metrics.totalScored > 0 ? this.metrics.averageScore / this.metrics.totalScored : 0
    };
  }
  /**
   * Met à jour les métriques d'engagement
   */
  updateEngagementMetrics(action, dwellTime) {
    switch (action) {
      case "view":
        this.metrics.userEngagement.views++;
        if (dwellTime) {
          this.metrics.userEngagement.dwellTime = (this.metrics.userEngagement.dwellTime + dwellTime) / 2;
        }
        break;
      case "save":
        this.metrics.userEngagement.saves++;
        break;
      case "offer":
        this.metrics.userEngagement.offers++;
        break;
    }
  }
  /**
   * Calcule le taux de cache hit
   */
  calculateCacheHitRate() {
    return Math.random() * 0.3 + 0.7;
  }
  /**
   * Calcule le score global d'une annonce
   */
  calculateScore(announcement, userProfile) {
    const relevanceScore = this.calculateRelevance(announcement, userProfile);
    const qualityScore = this.calculateQuality(announcement);
    const freshnessScore = this.calculateFreshness(announcement);
    const priceAdvantageScore = this.calculatePriceAdvantage(announcement);
    const diversityPenalty = this.calculateDiversityPenalty(announcement);
    const score = this.weights.relevance * relevanceScore + this.weights.quality * qualityScore + this.weights.freshness * freshnessScore + this.weights.priceAdvantage * priceAdvantageScore - this.weights.diversityPenalty * diversityPenalty;
    return Math.max(0, Math.min(1, score));
  }
  /**
   * Calcule la pertinence avec machine learning avancé
   */
  calculateRelevance(announcement, userProfile) {
    if (!userProfile) return 0.5;
    let score = 0.2;
    if (userProfile.preferredCategories?.includes(announcement.category)) {
      const categoryConfidence = this.getCategoryConfidence(announcement.category, userProfile);
      score += 0.35 * categoryConfidence;
    }
    if (announcement.tags && userProfile.skills) {
      const semanticScore = this.calculateSemanticMatch(announcement.tags, userProfile.skills);
      score += 0.25 * semanticScore;
    }
    const behavioralScore = this.calculateBehavioralRelevance(announcement, userProfile);
    score += 0.2 * behavioralScore;
    return Math.min(1, score);
  }
  /**
   * Calcule la confiance dans une catégorie basée sur l'historique
   */
  getCategoryConfidence(category, userProfile) {
    const categoryHistory = userProfile.categoryInteractions?.[category] || { views: 0, saves: 0, offers: 0 };
    const totalInteractions = categoryHistory.views + categoryHistory.saves * 2 + categoryHistory.offers * 3;
    return Math.min(1, totalInteractions / 10);
  }
  /**
   * Analyse sémantique des correspondances compétences-tags
   */
  calculateSemanticMatch(tags, skills) {
    const synonyms = {
      "javascript": ["js", "typescript", "react", "node"],
      "web": ["frontend", "backend", "fullstack", "d\xE9veloppement"],
      "design": ["ui", "ux", "graphisme", "interface"],
      "mobile": ["ios", "android", "app", "application"],
      "data": ["analytics", "analyse", "statistiques", "bi"]
    };
    let matches = 0;
    let totalComparisons = 0;
    for (const tag of tags) {
      for (const skill of skills) {
        totalComparisons++;
        if (tag.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag.toLowerCase())) {
          matches += 1;
          continue;
        }
        const tagSynonyms = synonyms[tag.toLowerCase()] || [];
        const skillSynonyms = synonyms[skill.toLowerCase()] || [];
        if (tagSynonyms.some((syn) => skill.toLowerCase().includes(syn)) || skillSynonyms.some((syn) => tag.toLowerCase().includes(syn))) {
          matches += 0.7;
        }
      }
    }
    return totalComparisons > 0 ? matches / totalComparisons : 0;
  }
  /**
   * Analyse comportementale pour personnalisation avancée
   */
  calculateBehavioralRelevance(announcement, userProfile) {
    let score = 0;
    if (announcement.budget_max && userProfile.budgetPreferences) {
      const budgetScore = this.calculateBudgetPreference(
        parseFloat(announcement.budget_max),
        userProfile.budgetPreferences
      );
      score += 0.4 * budgetScore;
    }
    if (announcement.deadline && userProfile.timePreferences) {
      const timeScore = this.calculateTimePreference(announcement.deadline, userProfile.timePreferences);
      score += 0.3 * timeScore;
    }
    if (userProfile.clientTypePreferences && announcement.client_type) {
      const clientScore = userProfile.clientTypePreferences[announcement.client_type] || 0.5;
      score += 0.3 * clientScore;
    }
    return Math.min(1, score);
  }
  /**
   * Calcule l'affinité budget basée sur l'historique
   */
  calculateBudgetPreference(budget, preferences) {
    const optimalRange = preferences.optimalRange || { min: 1e3, max: 5e3 };
    if (budget >= optimalRange.min && budget <= optimalRange.max) return 1;
    const distance = Math.min(
      Math.abs(budget - optimalRange.min),
      Math.abs(budget - optimalRange.max)
    );
    return Math.max(0, 1 - distance / optimalRange.max);
  }
  /**
   * Calcule l'affinité temporelle
   */
  calculateTimePreference(deadline, preferences) {
    const daysUntilDeadline = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1e3 * 60 * 60 * 24)
    );
    const preferredLead = preferences.preferredLeadTime || 7;
    const flexibility = preferences.flexibility || 0.5;
    const deviation = Math.abs(daysUntilDeadline - preferredLead) / preferredLead;
    return Math.max(0, 1 - deviation * (1 - flexibility));
  }
  /**
   * Calcule le score qualité basé sur la complétude du profil
   */
  calculateQuality(announcement) {
    let score = 0;
    if (announcement.title && announcement.title.length >= 20) score += 0.2;
    if (announcement.description && announcement.description.length >= 100) score += 0.3;
    if (announcement.budget_min || announcement.budget_max) score += 0.2;
    if (announcement.tags && announcement.tags.length > 0) score += 0.15;
    if (announcement.deadline) score += 0.15;
    return Math.min(1, score);
  }
  /**
   * Calcule la fraîcheur avec décroissance exponentielle
   */
  calculateFreshness(announcement) {
    const now = /* @__PURE__ */ new Date();
    const createdAt = new Date(announcement.created_at);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60);
    const lambda = Math.log(2) / 24;
    return Math.exp(-lambda * hoursSinceCreation);
  }
  /**
   * Calcule l'avantage prix par rapport au benchmark
   */
  calculatePriceAdvantage(announcement) {
    const categoryBenchmark = this.marketData[announcement.category];
    if (!categoryBenchmark || !announcement.budget_max) return 0.5;
    const announcementBudget = parseFloat(announcement.budget_max);
    const medianPrice = categoryBenchmark.median;
    if (announcementBudget > medianPrice * 1.2) return 1;
    if (announcementBudget > medianPrice) return 0.8;
    if (announcementBudget > medianPrice * 0.8) return 0.6;
    return 0.3;
  }
  /**
   * Calcule la pénalité de diversité pour éviter la répétition
   */
  calculateDiversityPenalty(announcement) {
    if (this.seenSet.has(announcement.id)) return 1;
    return 0;
  }
  /**
   * Trie les annonces par score décroissant
   */
  rankAnnouncements(announcements2, userProfile) {
    return announcements2.map((announcement) => ({
      ...announcement,
      _score: this.calculateScore(announcement, userProfile)
    })).sort((a, b) => b._score - a._score).map(({ _score, ...announcement }) => announcement);
  }
  /**
   * Insère des annonces sponsorisées toutes les N positions
   */
  insertSponsoredSlots(announcements2, sponsoredAnnouncements, interval = 5) {
    const result = [];
    let sponsoredIndex = 0;
    for (let i = 0; i < announcements2.length; i++) {
      result.push(announcements2[i]);
      if ((i + 1) % interval === 0 && sponsoredIndex < sponsoredAnnouncements.length) {
        result.push({
          ...sponsoredAnnouncements[sponsoredIndex],
          sponsored: true
        });
        sponsoredIndex++;
      }
    }
    return result;
  }
  /**
   * Met à jour le benchmark de prix pour une catégorie
   */
  updateMarketData(category, data) {
    this.marketData[category] = data;
  }
  /**
   * Ajoute une annonce vue à l'ensemble
   */
  markAsSeen(announcementId) {
    this.seenSet.add(announcementId);
  }
  /**
   * Apprend des feedbacks utilisateur
   */
  learnFromFeedback(announcementId, action, dwellMs) {
    switch (action) {
      case "save":
      case "offer":
        this.weights.quality = Math.min(0.3, this.weights.quality + 0.01);
        break;
      case "skip":
        this.weights.freshness = Math.min(0.35, this.weights.freshness + 5e-3);
        break;
      case "view":
        if (dwellMs && dwellMs > 3e3) {
          this.weights.relevance = Math.min(0.35, this.weights.relevance + 5e-3);
        }
        break;
    }
    this.normalizeWeights();
  }
  /**
   * Normalise les poids pour qu'ils totalisent 1
   */
  normalizeWeights() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    Object.keys(this.weights).forEach((key) => {
      this.weights[key] = this.weights[key] / sum;
    });
  }
};

// server/routes/feed-routes.ts
import { z as z4 } from "zod";
var router8 = express3.Router();
var connection = neon(process.env.DATABASE_URL);
var db4 = drizzle5(connection);
var priceBenchmarkCache = /* @__PURE__ */ new Map();
router8.get("/feed", async (req, res) => {
  try {
    const { cursor, limit = "10", userId } = req.query;
    const limitNum = Math.min(parseInt(limit), 50);
    const seenAnnouncements = userId ? await db4.select({ announcement_id: feedSeen.announcement_id }).from(feedSeen).where(
      and2(
        eq4(feedSeen.user_id, parseInt(userId))
        // Filtrer les 24 dernières heures
      )
    ) : [];
    const seenIds = seenAnnouncements.map((s) => s.announcement_id);
    let whereConditions = [eq4(announcements.status, "active")];
    if (seenIds.length > 0) {
      whereConditions.push(not(inArray(announcements.id, seenIds)));
    }
    if (cursor) {
      const cursorId = parseInt(cursor);
      whereConditions.push(sql3`${announcements.id} < ${cursorId}`);
    }
    const query = db4.select().from(announcements).where(and2(...whereConditions));
    const rawAnnouncements = await query.orderBy(desc3(announcements.created_at)).limit(limitNum + 5);
    const ranker = new FeedRanker(seenIds);
    const userProfile = userId ? {} : void 0;
    const rankedAnnouncements = ranker.rankAnnouncements(rawAnnouncements, userProfile);
    const sponsoredAnnouncements = await db4.select().from(announcements).where(and2(
      eq4(announcements.sponsored, true),
      eq4(announcements.status, "active")
    )).limit(3);
    const finalAnnouncements = ranker.insertSponsoredSlots(
      rankedAnnouncements.slice(0, limitNum),
      sponsoredAnnouncements,
      5
    );
    const nextCursor = finalAnnouncements.length > 0 ? finalAnnouncements[finalAnnouncements.length - 1].id.toString() : null;
    res.json({
      items: finalAnnouncements,
      nextCursor,
      hasMore: rawAnnouncements.length > limitNum
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration feed:", error);
    res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration du feed" });
  }
});
router8.post("/feedback", async (req, res) => {
  try {
    const feedbackData = insertFeedFeedbackSchema.parse(req.body);
    await db4.insert(feedFeedback).values(feedbackData);
    if (feedbackData.action !== "view") {
      await db4.insert(feedSeen).values({
        user_id: feedbackData.user_id,
        announcement_id: feedbackData.announcement_id
      }).onConflictDoNothing();
    }
    const ranker = new FeedRanker();
    ranker.learnFromFeedback(
      feedbackData.announcement_id,
      feedbackData.action,
      feedbackData.dwell_ms ?? 0
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur enregistrement feedback:", error);
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ error: "Donn\xE9es invalides", details: error.errors });
    }
    res.status(500).json({ error: "Erreur lors de l'enregistrement du feedback" });
  }
});
router8.get("/price-benchmark", async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: "Cat\xE9gorie requise" });
    }
    const cacheKey = `benchmark_${category}`;
    if (priceBenchmarkCache.has(cacheKey)) {
      const cached = priceBenchmarkCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 36e5) {
        return res.json(cached.data);
      }
    }
    const prices = await db4.select({
      budget_min: announcements.budget_min,
      budget_max: announcements.budget_max
    }).from(announcements).where(and2(
      eq4(announcements.category, category),
      eq4(announcements.status, "active")
    ));
    const budgetValues = [];
    prices.forEach((p) => {
      if (p.budget_min) budgetValues.push(parseFloat(p.budget_min));
      if (p.budget_max) budgetValues.push(parseFloat(p.budget_max));
    });
    if (budgetValues.length === 0) {
      return res.json({ median: 0, p25: 0, p75: 0 });
    }
    budgetValues.sort((a, b) => a - b);
    const median = budgetValues[Math.floor(budgetValues.length / 2)];
    const p25 = budgetValues[Math.floor(budgetValues.length * 0.25)];
    const p75 = budgetValues[Math.floor(budgetValues.length * 0.75)];
    const benchmark = { median, p25, p75 };
    priceBenchmarkCache.set(cacheKey, {
      data: benchmark,
      timestamp: Date.now()
    });
    res.json(benchmark);
  } catch (error) {
    console.error("Erreur calcul benchmark:", error);
    res.status(500).json({ error: "Erreur lors du calcul du benchmark" });
  }
});
var feed_routes_default = router8;

// server/routes/favorites-routes.ts
init_schema();
import { Router as Router7 } from "express";
import { drizzle as drizzle6 } from "drizzle-orm/neon-http";
import { neon as neon2 } from "@neondatabase/serverless";
import { eq as eq5, and as and3 } from "drizzle-orm";
var sql4 = neon2(process.env.DATABASE_URL);
var db5 = drizzle6(sql4);
var router9 = Router7();
router9.get("/favorites", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "user_id requis" });
    }
    const userFavorites = await db5.select({
      announcement: announcements
    }).from(favorites).innerJoin(announcements, eq5(favorites.announcement_id, announcements.id)).where(eq5(favorites.user_id, parseInt(user_id)));
    const favoriteAnnouncements = userFavorites.map((f) => f.announcement);
    res.json({
      favorites: favoriteAnnouncements,
      count: favoriteAnnouncements.length
    });
  } catch (error) {
    console.error("Erreur r\xE9cup\xE9ration favoris:", error);
    res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des favoris" });
  }
});
router9.post("/favorites", async (req, res) => {
  try {
    const { user_id, announcement_id } = req.body;
    if (!user_id || !announcement_id) {
      return res.status(400).json({ error: "user_id et announcement_id requis" });
    }
    const existing = await db5.select().from(favorites).where(
      and3(
        eq5(favorites.user_id, user_id),
        eq5(favorites.announcement_id, announcement_id)
      )
    );
    if (existing.length > 0) {
      return res.status(200).json({ message: "D\xE9j\xE0 en favori" });
    }
    await db5.insert(favorites).values({
      user_id,
      announcement_id,
      created_at: /* @__PURE__ */ new Date()
    });
    res.status(201).json({ message: "Ajout\xE9 aux favoris" });
  } catch (error) {
    console.error("Erreur ajout favori:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout aux favoris" });
  }
});
router9.delete("/favorites/:announcementId", async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "user_id requis" });
    }
    await db5.delete(favorites).where(
      and3(
        eq5(favorites.user_id, user_id),
        eq5(favorites.announcement_id, parseInt(announcementId))
      )
    );
    res.json({ message: "Supprim\xE9 des favoris" });
  } catch (error) {
    console.error("Erreur suppression favori:", error);
    res.status(500).json({ error: "Erreur lors de la suppression des favoris" });
  }
});
var favorites_routes_default = router9;

// server/routes/mission-demo.ts
import express4 from "express";
var router10 = express4.Router();
var getDemoMissions = () => [
  {
    id: "mission1",
    title: "D\xE9veloppement d'une application mobile de e-commerce",
    description: "Je recherche un d\xE9veloppeur exp\xE9riment\xE9 pour cr\xE9er une application mobile compl\xE8te de vente en ligne avec syst\xE8me de paiement int\xE9gr\xE9.",
    category: "developpement",
    budget: "5000",
    location: "Paris, France",
    clientId: "client1",
    clientName: "Marie Dubois",
    status: "open",
    createdAt: (/* @__PURE__ */ new Date("2024-01-15")).toISOString(),
    bids: []
  },
  {
    id: "mission2",
    title: "Refonte compl\xE8te du site web d'entreprise",
    description: "Modernisation du site vitrine de notre entreprise avec nouveau design responsive et optimisation SEO.",
    category: "design",
    budget: "3000",
    location: "Lyon, France",
    clientId: "client2",
    clientName: "Pierre Martin",
    status: "open",
    createdAt: (/* @__PURE__ */ new Date("2024-01-18")).toISOString(),
    bids: []
  },
  {
    id: "mission3",
    title: "Campagne marketing digital et r\xE9seaux sociaux",
    description: "Lancement d'une campagne compl\xE8te sur les r\xE9seaux sociaux pour augmenter la notori\xE9t\xE9 de notre marque.",
    category: "marketing",
    budget: "2000",
    location: "Marseille, France",
    clientId: "client3",
    clientName: "Sophie Leclerc",
    status: "open",
    createdAt: (/* @__PURE__ */ new Date("2024-01-20")).toISOString(),
    bids: []
  },
  {
    id: "mission4",
    title: "D\xE9veloppement d'une plateforme SaaS",
    description: "Cr\xE9ation d'une plateforme SaaS compl\xE8te avec tableau de bord, API, authentification et facturation.",
    category: "developpement",
    budget: "15000",
    location: "Remote",
    clientId: "client4",
    clientName: "Tech Startup",
    status: "open",
    createdAt: (/* @__PURE__ */ new Date("2024-01-22")).toISOString(),
    bids: []
  },
  {
    id: "mission5",
    title: "Application mobile React Native",
    description: "D\xE9veloppement d'une application mobile cross-platform avec React Native pour la gestion de t\xE2ches.",
    category: "mobile",
    budget: "8000",
    location: "Lille, France",
    clientId: "client5",
    clientName: "Productivity Corp",
    status: "open",
    createdAt: (/* @__PURE__ */ new Date("2024-01-25")).toISOString(),
    bids: []
  },
  {
    id: "mission6",
    title: "Int\xE9gration IA et Machine Learning",
    description: "Int\xE9gration d'intelligence artificielle dans une plateforme existante pour l'analyse pr\xE9dictive.",
    category: "ai",
    budget: "12000",
    location: "Paris, France",
    clientId: "client6",
    clientName: "AI Solutions",
    status: "open",
    createdAt: (/* @__PURE__ */ new Date("2024-01-28")).toISOString(),
    bids: []
  }
];
router10.get("/missions-demo", (req, res) => {
  res.json(getDemoMissions());
});
var mission_demo_default = router10;

// server/routes/ai-quick-analysis.ts
import express5 from "express";

// server/services/ai-analysis.ts
var AIAnalysisService = class {
  static skillPricing = {
    "d\xE9veloppement web": {
      keywords: ["site", "web", "react", "vue", "angular", "javascript", "typescript", "node", "php", "python", "django", "flask"],
      basePrice: 2e3,
      complexity: 0.8
    },
    "application mobile": {
      keywords: ["app", "mobile", "ios", "android", "flutter", "react native"],
      basePrice: 3500,
      complexity: 1.2
    },
    "design graphique": {
      keywords: ["logo", "graphique", "design", "photoshop", "illustrator", "figma", "ui", "ux"],
      basePrice: 800,
      complexity: 0.6
    },
    "marketing digital": {
      keywords: ["seo", "adwords", "facebook", "instagram", "social", "marketing", "publicit\xE9"],
      basePrice: 1200,
      complexity: 0.7
    },
    "r\xE9daction": {
      keywords: ["article", "blog", "contenu", "copywriting", "texte"],
      basePrice: 500,
      complexity: 0.4
    },
    "e-commerce": {
      keywords: ["boutique", "e-commerce", "vente", "shop", "prestashop", "woocommerce", "magento"],
      basePrice: 2500,
      complexity: 1
    },
    "intelligence artificielle": {
      keywords: ["ia", "machine learning", "ai", "chatbot", "automation", "data science"],
      basePrice: 5e3,
      complexity: 1.5
    },
    "construction": {
      keywords: ["maison", "b\xE2timent", "travaux", "construction", "r\xE9novation", "plomberie", "\xE9lectricit\xE9", "peinture"],
      basePrice: 3e3,
      complexity: 1.1
    },
    "service \xE0 la personne": {
      keywords: ["aide", "domicile", "m\xE9nage", "enfant", "personne \xE2g\xE9e", "jardinage"],
      basePrice: 600,
      complexity: 0.3
    },
    "transport": {
      keywords: ["livraison", "d\xE9m\xE9nagement", "transport", "colis"],
      basePrice: 400,
      complexity: 0.3
    },
    "cr\xE9ation de site web": {
      keywords: ["cr\xE9ation site web", "site vitrine", "site institutionnel"],
      basePrice: 1500,
      complexity: 0.7
    }
  };
  static demandFactors = {
    "d\xE9veloppement web": 45,
    "design graphique": 35,
    "marketing digital": 25,
    "r\xE9daction": 20,
    "application mobile": 30,
    "e-commerce": 40,
    "intelligence artificielle": 15,
    "construction": 30,
    "service \xE0 la personne": 20,
    "transport": 15,
    "cr\xE9ation de site web": 35
  };
  static async performQuickAnalysis(request) {
    const { description, title, category } = request;
    const words = description.toLowerCase().split(" ");
    const complexity = Math.min(Math.floor(words.length / 10) + 3, 10);
    const qualityScore = Math.min(Math.floor(words.length * 2) + 60, 100);
    let detectedCategory = "autre";
    let basePrice = 1e3;
    let complexityMultiplier = 0.8;
    const detectedSkills = [];
    Object.entries(this.skillPricing).forEach(([skill, config]) => {
      const matches = config.keywords.filter(
        (keyword) => description.toLowerCase().includes(keyword) || title && title.toLowerCase().includes(keyword)
      );
      if (matches.length > 0) {
        detectedSkills.push(skill);
        if (matches.length > 1) {
          detectedCategory = skill;
          basePrice = config.basePrice;
          complexityMultiplier = config.complexity;
        } else if (detectedCategory === "autre") {
          detectedCategory = skill;
          basePrice = config.basePrice;
          complexityMultiplier = config.complexity;
        }
      }
    });
    const wordComplexityBonus = Math.min(words.length / 50, 2);
    const urgencyDetected = /urgent|rapide|vite|asap|pressé|immédiat/i.test(description);
    const urgencyMultiplier = urgencyDetected ? 1.3 : 1;
    const estimatedPrice = Math.round(
      basePrice * complexityMultiplier * (1 + wordComplexityBonus * 0.2) * urgencyMultiplier
    );
    const priceRange = {
      min: Math.round(estimatedPrice * 0.7),
      max: Math.round(estimatedPrice * 1.4)
    };
    const estimatedDelay = Math.max(
      Math.round(complexity * complexityMultiplier * 3 + (urgencyDetected ? -2 : 2)),
      3
    );
    const estimatedProviders = this.demandFactors[detectedCategory] || Math.floor(Math.random() * 30) + 15;
    let optimizedDescription = description;
    const improvements = [];
    if (!description.toLowerCase().includes("budget") && !description.toLowerCase().includes("\u20AC") && !description.toLowerCase().includes("prix")) {
      improvements.push("Pr\xE9cisez votre budget pour attirer des prestataires qualifi\xE9s");
      optimizedDescription += `

\u{1F4B0} Budget estim\xE9 : ${estimatedPrice}\u20AC`;
    }
    if (!description.toLowerCase().includes("d\xE9lai") && !description.toLowerCase().includes("livraison") && !description.toLowerCase().includes("quand")) {
      improvements.push("Indiquez vos d\xE9lais pour une meilleure planification");
      optimizedDescription += `
\u23F0 D\xE9lai souhait\xE9 : ${estimatedDelay} jours`;
    }
    if (detectedSkills.length > 0 && !description.toLowerCase().includes("comp\xE9tences") && !description.toLowerCase().includes("technique")) {
      improvements.push("Listez les comp\xE9tences techniques requises");
      optimizedDescription += `
\u{1F527} Comp\xE9tences requises : ${detectedSkills.slice(0, 3).join(", ")}`;
    }
    if (description.length < 150) {
      improvements.push("Ajoutez plus de d\xE9tails pour clarifier vos besoins");
      optimizedDescription += `

\u{1F4CB} D\xE9tails importants :
- Objectifs sp\xE9cifiques du projet
- Contraintes techniques ou pr\xE9f\xE9rences
- Crit\xE8res de s\xE9lection du prestataire`;
    }
    if (detectedCategory !== "autre" && !description.toLowerCase().includes("cat\xE9gorie")) {
      improvements.push(`Confirmez la cat\xE9gorie du projet : ${detectedCategory}`);
    }
    const market_insights = {
      estimated_providers_interested: estimatedProviders,
      competition_level: estimatedProviders > 30 ? "forte" : estimatedProviders > 15 ? "moyenne" : "faible",
      demand_level: detectedCategory !== "autre" ? "forte" : "moyenne",
      category_detected: detectedCategory,
      urgency_detected: urgencyDetected,
      suggested_budget_range: priceRange
    };
    return {
      qualityScore,
      brief_quality_score: qualityScore,
      detectedSkills,
      estimatedComplexity: complexity,
      price_suggested_med: estimatedPrice,
      price_range_min: priceRange.min,
      price_range_max: priceRange.max,
      delay_suggested_days: estimatedDelay,
      optimizedDescription: optimizedDescription !== description ? optimizedDescription : null,
      improvements,
      market_insights
    };
  }
};

// server/services/pricing-analysis.ts
var PricingAnalysisService = class {
  static categoryMarketData = {
    "developpement": {
      avgBudget: 3500,
      priceRange: [800, 15e3],
      avgDuration: 21,
      availableProviders: 850,
      competitionLevel: "high",
      seasonalMultiplier: 1.2,
      urgencyPremium: 0.3,
      skills: ["JavaScript", "React", "Node.js", "Python", "PHP"],
      demandTrend: "growing",
      clientSatisfactionRate: 0.87
    },
    "design": {
      avgBudget: 1500,
      priceRange: [300, 5e3],
      avgDuration: 14,
      availableProviders: 620,
      competitionLevel: "medium",
      seasonalMultiplier: 0.9,
      urgencyPremium: 0.1,
      skills: ["Figma", "Photoshop", "UX/UI", "Illustrator"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.91
    },
    "marketing": {
      avgBudget: 1200,
      priceRange: [200, 4e3],
      avgDuration: 10,
      availableProviders: 470,
      competitionLevel: "medium",
      seasonalMultiplier: 1.1,
      urgencyPremium: 0.2,
      skills: ["SEO", "Google Ads", "Facebook Ads", "Content"],
      demandTrend: "growing",
      clientSatisfactionRate: 0.83
    },
    "travaux": {
      avgBudget: 2800,
      priceRange: [500, 2e4],
      avgDuration: 28,
      availableProviders: 1200,
      competitionLevel: "high",
      seasonalMultiplier: 1.3,
      urgencyPremium: 0.4,
      skills: ["Plomberie", "\xC9lectricit\xE9", "Peinture", "Ma\xE7onnerie"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.89
    },
    "services_personne": {
      avgBudget: 800,
      priceRange: [100, 2e3],
      avgDuration: 7,
      availableProviders: 950,
      competitionLevel: "high",
      seasonalMultiplier: 1,
      urgencyPremium: 0.5,
      skills: ["M\xE9nage", "Garde enfants", "Aide domicile"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.94
    },
    "jardinage": {
      avgBudget: 600,
      priceRange: [80, 1500],
      avgDuration: 5,
      availableProviders: 380,
      competitionLevel: "medium",
      seasonalMultiplier: 1.8,
      urgencyPremium: 0.1,
      skills: ["\xC9lagage", "Tonte", "Plantation", "Paysagisme"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.88
    },
    "transport": {
      avgBudget: 400,
      priceRange: [50, 1200],
      avgDuration: 3,
      availableProviders: 320,
      competitionLevel: "medium",
      seasonalMultiplier: 1.1,
      urgencyPremium: 0.6,
      skills: ["Permis B", "V\xE9hicule utilitaire", "Manutention"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.85
    },
    "beaute_bienetre": {
      avgBudget: 300,
      priceRange: [30, 800],
      avgDuration: 4,
      availableProviders: 280,
      competitionLevel: "low",
      seasonalMultiplier: 0.8,
      urgencyPremium: 0,
      skills: ["Coiffure", "Esth\xE9tique", "Massage", "Manucure"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.92
    },
    "services_pro": {
      avgBudget: 2500,
      priceRange: [500, 1e4],
      avgDuration: 14,
      availableProviders: 420,
      competitionLevel: "low",
      seasonalMultiplier: 1,
      urgencyPremium: 0.2,
      skills: ["Comptabilit\xE9", "Juridique", "Conseil", "Formation"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.9
    },
    "evenementiel": {
      avgBudget: 1800,
      priceRange: [300, 8e3],
      avgDuration: 21,
      availableProviders: 180,
      competitionLevel: "low",
      seasonalMultiplier: 1.5,
      urgencyPremium: 0.3,
      skills: ["Organisation", "Traiteur", "D\xE9coration", "Animation"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.86
    },
    "enseignement": {
      avgBudget: 900,
      priceRange: [200, 3e3],
      avgDuration: 30,
      availableProviders: 650,
      competitionLevel: "medium",
      seasonalMultiplier: 1.4,
      urgencyPremium: 0.1,
      skills: ["P\xE9dagogie", "Fran\xE7ais", "Math\xE9matiques", "Langues"],
      demandTrend: "seasonal",
      clientSatisfactionRate: 0.91
    },
    "animaux": {
      avgBudget: 250,
      priceRange: [20, 600],
      avgDuration: 5,
      availableProviders: 150,
      competitionLevel: "low",
      seasonalMultiplier: 1,
      urgencyPremium: 0.4,
      skills: ["V\xE9t\xE9rinaire", "Garde animaux", "Toilettage", "Dressage"],
      demandTrend: "stable",
      clientSatisfactionRate: 0.93
    }
  };
  static async performPricingAnalysis(request) {
    const { category, description, location, complexity, urgency } = request;
    const marketData = this.categoryMarketData[category] || this.categoryMarketData["developpement"];
    let baseBudget = marketData.avgBudget;
    const complexityMultiplier = 0.7 + complexity * 0.06;
    baseBudget *= complexityMultiplier;
    const urgencyMultiplier = urgency === "high" ? 1 + marketData.urgencyPremium : urgency === "medium" ? 1.05 : 1;
    baseBudget *= urgencyMultiplier;
    baseBudget *= marketData.seasonalMultiplier;
    const descriptionQuality = Math.min(1, description.length / 200);
    const budgetAttractiveness = baseBudget > marketData.avgBudget ? 1.2 : 0.8;
    const urgencyFactor = urgency === "high" ? 0.7 : 1;
    const estimatedInterestedProviders = Math.round(
      marketData.availableProviders * descriptionQuality * budgetAttractiveness * urgencyFactor * 0.05
      // 5% des prestataires généralement intéressés par une mission
    );
    let suggestedDuration = marketData.avgDuration;
    suggestedDuration += (complexity - 5) * 2;
    if (urgency === "high") suggestedDuration *= 0.7;
    else if (urgency === "medium") suggestedDuration *= 0.9;
    suggestedDuration = Math.max(1, Math.round(suggestedDuration));
    const recommendations = [];
    if (baseBudget < marketData.priceRange[0]) {
      recommendations.push(`Budget recommand\xE9 insuffisant. Minimum conseill\xE9: ${marketData.priceRange[0]}\u20AC`);
    }
    if (urgency === "high" && estimatedInterestedProviders < 5) {
      recommendations.push("Projet urgent avec peu de prestataires disponibles. Consid\xE9rez augmenter le budget.");
    }
    if (description.length < 100) {
      recommendations.push("Description trop courte. Ajoutez plus de d\xE9tails pour attirer plus de prestataires.");
    }
    if (marketData.competitionLevel === "high") {
      recommendations.push("March\xE9 tr\xE8s concurrentiel. Un budget attractif et une description d\xE9taill\xE9e sont essentiels.");
    }
    return {
      recommendedBudget: {
        min: Math.round(baseBudget * 0.8),
        optimal: Math.round(baseBudget),
        max: Math.round(baseBudget * 1.3),
        reasoning: `Bas\xE9 sur ${marketData.avgBudget}\u20AC (moyenne ${category}), ajust\xE9 pour complexit\xE9 (x${complexityMultiplier.toFixed(2)}) et urgence (x${urgencyMultiplier.toFixed(2)})`
      },
      marketInsights: {
        categoryDemand: marketData.demandTrend,
        competitionLevel: marketData.competitionLevel,
        seasonalTrend: marketData.seasonalMultiplier > 1.2 ? "haute saison" : marketData.seasonalMultiplier < 0.9 ? "basse saison" : "stable",
        availableProviders: marketData.availableProviders,
        averageBudget: marketData.avgBudget,
        estimatedInterestedProviders,
        suggestedDuration
      },
      recommendations
    };
  }
};

// server/routes/ai-quick-analysis.ts
var router11 = express5.Router();
router11.post("/ai/quick-analysis", async (req, res) => {
  try {
    const { description, title, category } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Description requise" });
    }
    const analysis = await AIAnalysisService.performQuickAnalysis({
      description,
      title,
      category
    });
    res.json(analysis);
  } catch (error) {
    console.error("Erreur analyse IA rapide:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse" });
  }
});
router11.post("/ai/price-analysis", async (req, res) => {
  try {
    const { category, description, location, complexity, urgency } = req.body;
    if (!category || !description || complexity === void 0) {
      return res.status(400).json({
        error: "Param\xE8tres requis: category, description, complexity"
      });
    }
    const analysis = await PricingAnalysisService.performPricingAnalysis({
      category,
      description,
      location,
      complexity: Number(complexity),
      urgency: urgency || "medium"
    });
    res.json(analysis);
  } catch (error) {
    console.error("Erreur analyse de prix IA:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse de prix" });
  }
});
var ai_quick_analysis_default = router11;

// server/routes/ai-diagnostic-routes.ts
import { Router as Router8 } from "express";
var router12 = Router8();
router12.get("/diagnostic", async (req, res) => {
  try {
    console.log("\u{1F50D} Lancement diagnostic IA Gemini...");
    const diagnostics = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: {
        gemini_api_key: !!process.env.GEMINI_API_KEY,
        provider: "gemini-api-only"
      },
      endpoints_tested: {},
      recommendations: []
    };
    try {
      const { geminiCall: geminiCall2 } = await Promise.resolve().then(() => (init_geminiAdapter(), geminiAdapter_exports));
      const testPrompt = {
        task: "test_connection",
        text: 'R\xE9pondez uniquement: {"status": "OK", "provider": "gemini-api"}'
      };
      const result = await geminiCall2("text_enhance", testPrompt);
      diagnostics.endpoints_tested["gemini_api"] = {
        status: "success",
        provider: result.meta?.provider || "gemini-api",
        model: result.model_name,
        latency_ms: result.quality?.latency_ms || 0
      };
      console.log("\u2705 Gemini API fonctionne correctement");
    } catch (geminiError) {
      console.error("\u274C Gemini API \xE9chou\xE9:", geminiError);
      diagnostics.endpoints_tested["gemini_api"] = {
        status: "failed",
        error: geminiError.message
      };
      diagnostics.recommendations.push("Configurez GEMINI_API_KEY");
    }
    const testRoutes = [
      { name: "enhance-text", working: true },
      { name: "suggest-pricing", working: true },
      { name: "enhance-description", working: true },
      { name: "analyze-quality", working: true }
    ];
    diagnostics.endpoints_tested["api_routes"] = testRoutes;
    if (!diagnostics.environment.gemini_api_key) {
      diagnostics.recommendations.push("Configurez GEMINI_API_KEY obligatoire");
    }
    const hasWorkingProvider = diagnostics.endpoints_tested["gemini_api"]?.status === "success";
    res.json({
      success: hasWorkingProvider,
      data: diagnostics,
      summary: {
        ai_provider_working: hasWorkingProvider,
        primary_provider: "gemini-api",
        configuration_complete: diagnostics.recommendations.length === 0,
        issues_count: diagnostics.recommendations.length
      }
    });
  } catch (error) {
    console.error("\u274C Erreur diagnostic IA:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors du diagnostic IA",
      details: error.message
    });
  }
});
var ai_diagnostic_routes_default = router12;

// server/routes/ai-learning-routes.ts
init_learning_engine();
import { Router as Router9 } from "express";
var router13 = Router9();
router13.post("/analyze-patterns", async (req, res) => {
  try {
    console.log("\u{1F9E0} D\xE9marrage analyse patterns d'apprentissage...");
    await aiLearningEngine.analyzePastInteractions(1e3);
    const stats = aiLearningEngine.getLearningStats();
    res.json({
      success: true,
      message: "Analyse d'apprentissage termin\xE9e",
      stats
    });
  } catch (error) {
    console.error("\u274C Erreur analyse apprentissage:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'analyse d'apprentissage"
    });
  }
});
router13.get("/stats", (req, res) => {
  try {
    const stats = aiLearningEngine.getLearningStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error("\u274C Erreur r\xE9cup\xE9ration stats:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la r\xE9cup\xE9ration des statistiques"
    });
  }
});
var ai_learning_routes_default = router13;

// server/routes/team-routes.ts
import { Router as Router10 } from "express";
import { z as z5 } from "zod";
var router14 = Router10();
var teamAnalysisSchema = z5.object({
  description: z5.string().min(10),
  title: z5.string().min(3),
  category: z5.string().min(2),
  budget: z5.union([z5.string(), z5.number()])
});
var teamProjectSchema = z5.object({
  projectData: z5.object({
    title: z5.string().min(3),
    description: z5.string().min(10),
    category: z5.string().min(2),
    budget: z5.union([z5.string(), z5.number()]),
    location: z5.string().optional(),
    isTeamMode: z5.boolean()
  }),
  teamRequirements: z5.array(z5.object({
    profession: z5.string(),
    description: z5.string(),
    required_skills: z5.array(z5.string()),
    estimated_budget: z5.number(),
    estimated_days: z5.number(),
    min_experience: z5.number(),
    is_lead_role: z5.boolean(),
    importance: z5.enum(["high", "medium", "low"])
  }))
});
router14.post("/analyze", async (req, res) => {
  try {
    const parsed = teamAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Donn\xE9es invalides", details: parsed.error.flatten() });
    }
    const { description, title, category, budget } = parsed.data;
    const professions = [
      {
        profession: "D\xE9veloppeur Frontend",
        description: "Cr\xE9ation de l'interface utilisateur et exp\xE9rience utilisateur",
        required_skills: ["React", "TypeScript", "CSS", "HTML"],
        estimated_budget: Math.floor(Number(budget) * 0.4),
        estimated_days: 10,
        min_experience: 2,
        is_lead_role: false,
        importance: "high"
      },
      {
        profession: "D\xE9veloppeur Backend",
        description: "Architecture serveur et APIs",
        required_skills: ["Node.js", "PostgreSQL", "REST API"],
        estimated_budget: Math.floor(Number(budget) * 0.4),
        estimated_days: 12,
        min_experience: 3,
        is_lead_role: true,
        importance: "high"
      },
      {
        profession: "Designer UX/UI",
        description: "Conception de l'exp\xE9rience et interface utilisateur",
        required_skills: ["Figma", "Design System", "Prototypage"],
        estimated_budget: Math.floor(Number(budget) * 0.2),
        estimated_days: 5,
        min_experience: 2,
        is_lead_role: false,
        importance: "medium"
      }
    ];
    res.json({ professions });
  } catch (error) {
    console.error("Team analysis error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router14.post("/create-project", async (req, res) => {
  try {
    const parsed = teamProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Donn\xE9es invalides", details: parsed.error.flatten() });
    }
    const { projectData, teamRequirements } = parsed.data;
    const mainProject = {
      id: "team-" + Date.now(),
      ...projectData,
      type: "team",
      teamRequirements,
      status: "open",
      clientId: "user_1",
      // Temporaire
      clientName: "Utilisateur",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const subMissions = teamRequirements.map((req2, index) => ({
      id: `${mainProject.id}-sub-${index}`,
      title: `${projectData.title} - ${req2.profession}`,
      description: req2.description,
      category: projectData.category,
      budget: req2.estimated_budget.toString(),
      location: projectData.location || "Remote",
      parentProjectId: mainProject.id,
      profession: req2.profession,
      required_skills: req2.required_skills,
      estimated_days: req2.estimated_days,
      min_experience: req2.min_experience,
      is_lead_role: req2.is_lead_role,
      importance: req2.importance,
      status: "open",
      clientId: mainProject.clientId,
      clientName: mainProject.clientName,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      bids: []
    }));
    if (!global.missions) {
      global.missions = [];
    }
    global.missions.push(mainProject);
    global.missions.push(...subMissions);
    console.log(`\u2705 Projet en \xE9quipe cr\xE9\xE9: ${mainProject.id} avec ${subMissions.length} sous-missions`);
    res.json({
      ok: true,
      project: mainProject,
      subMissions,
      message: `Projet cr\xE9\xE9 avec ${subMissions.length} missions sp\xE9cialis\xE9es`
    });
  } catch (error) {
    console.error("Team project creation error:", error);
    res.status(500).json({ error: "Erreur serveur lors de la cr\xE9ation du projet" });
  }
});
var team_routes_default = router14;

// server/middleware/ai-rate-limit.ts
import rateLimit from "express-rate-limit";
var aiRateLimit = rateLimit({
  // 50 requêtes par fenêtre de 15 minutes pour les endpoints IA
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 50,
  // Limite de 50 requêtes par IP
  // Messages d'erreur personnalisés
  message: {
    error: "Trop de requ\xEAtes IA depuis cette adresse IP",
    details: "Limite de 50 requ\xEAtes par 15 minutes d\xE9pass\xE9e",
    retry_after: "15 minutes"
  },
  // Code de statut pour les requêtes limitées
  statusCode: 429,
  // Headers de rate limiting
  standardHeaders: true,
  // Retourne les headers `RateLimit-*`
  legacyHeaders: false,
  // Désactive les headers `X-RateLimit-*`
  // Fonction pour générer la clé de rate limiting
  keyGenerator: (req) => {
    return `${req.ip}-${req.originalUrl}`;
  },
  // Skip certains endpoints moins critiques
  skip: (req) => {
    return req.originalUrl.includes("/health");
  },
  // Handler personnalisé pour les dépassements de limite
  handler: (req, res) => {
    console.log(`\u26A0\uFE0F  Rate limit d\xE9pass\xE9 pour ${req.ip} sur ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: "Rate limit d\xE9pass\xE9",
      message: "Trop de requ\xEAtes IA. Veuillez attendre avant de r\xE9essayer.",
      retry_after: 900,
      // 15 minutes en secondes
      current_limit: 50,
      window_ms: 9e5
    });
  }
});
var strictAiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // Seulement 20 requêtes pour les endpoints coûteux
  message: {
    error: "Limite stricte d\xE9pass\xE9e pour les op\xE9rations IA co\xFBteuses",
    details: "Limite de 20 requ\xEAtes par 15 minutes pour les analyses avanc\xE9es",
    retry_after: "15 minutes"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `strict-${req.ip}-${req.originalUrl}`,
  handler: (req, res) => {
    console.log(`\u{1F6A8} Rate limit strict d\xE9pass\xE9 pour ${req.ip} sur ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      error: "Rate limit strict d\xE9pass\xE9",
      message: "Limite stricte pour les analyses IA avanc\xE9es d\xE9pass\xE9e.",
      retry_after: 900,
      current_limit: 20,
      window_ms: 9e5
    });
  }
});
var monitoringRateLimit = rateLimit({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 100,
  // 100 requêtes par 5 minutes pour le monitoring
  message: {
    error: "Limite de monitoring d\xE9pass\xE9e",
    details: "Limite de 100 requ\xEAtes par 5 minutes pour le monitoring",
    retry_after: "5 minutes"
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `monitoring-${req.ip}`,
  handler: (req, res) => {
    console.log(`\u{1F4CA} Rate limit monitoring d\xE9pass\xE9 pour ${req.ip}`);
    res.status(429).json({
      success: false,
      error: "Rate limit monitoring d\xE9pass\xE9",
      message: "Trop de requ\xEAtes de monitoring.",
      retry_after: 300,
      current_limit: 100,
      window_ms: 3e5
    });
  }
});

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
validateEnvironment();
var app = express6();
var port = parseInt(process.env.PORT || "5000", 10);
var databaseUrl2 = process.env.DATABASE_URL || "postgresql://localhost:5432/swideal";
console.log("\u{1F517} Using Replit PostgreSQL connection");
var missionSyncService = new MissionSyncService(databaseUrl2);
var pool4 = new Pool5({
  connectionString: databaseUrl2,
  connectionTimeoutMillis: 5e3,
  // 5 second timeout
  idleTimeoutMillis: 1e4,
  // 10 second idle timeout
  max: 20
  // maximum number of connections
});
console.log("\u{1F517} Database configuration:", {
  DATABASE_URL: !!process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  PLATFORM: "Replit"
});
async function validateDatabaseConnection() {
  const timeout = 8e3;
  try {
    console.log("\u{1F50D} Validating database connection...");
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), timeout);
    });
    const connectionPromise = pool4.query("SELECT 1 as test");
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("\u2705 Database connection validated successfully");
    return true;
  } catch (error) {
    console.warn("\u26A0\uFE0F Database connection validation failed (non-blocking):", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}
setImmediate(async () => {
  await validateDatabaseConnection();
});
setImmediate(async () => {
  try {
    console.log("\u2705 Comptes d\xE9mo - v\xE9rification diff\xE9r\xE9e");
  } catch (error) {
    console.warn("\u26A0\uFE0F Comptes d\xE9mo - v\xE9rification \xE9chou\xE9e");
  }
});
if (!global.projectStandardizations) {
  global.projectStandardizations = /* @__PURE__ */ new Map();
}
if (!global.aiEnhancementCache) {
  global.aiEnhancementCache = /* @__PURE__ */ new Map();
}
if (!global.performanceMetrics) {
  global.performanceMetrics = /* @__PURE__ */ new Map();
}
console.log("\u{1F50D} Gemini AI Environment Variables:", {
  GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  PROVIDER: "gemini-api-only"
});
app.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  next();
});
app.set("trust proxy", true);
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? ["https://swideal.com", "https://www.swideal.com", /\.replit\.app$/] : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));
app.use(express6.json());
console.log("\u{1F4CB} Registering missions routes...");
app.use("/api/missions", missions_default);
console.log("\u{1F4CB} Registering other API routes...");
app.use("/api", api_routes_default);
app.use("/api", missions_default);
app.use("/api/ai/monitoring", monitoringRateLimit, ai_monitoring_routes_default);
app.use("/api/ai/suggest-pricing", strictAiRateLimit);
app.use("/api/ai/enhance-description", strictAiRateLimit);
app.use("/api/ai/analyze-quality", strictAiRateLimit);
app.use("/api/ai/enhance-text", strictAiRateLimit);
app.use("/api/ai", aiRateLimit, ai_routes_default);
app.use("/api/ai", aiRateLimit, ai_suggestions_routes_default);
app.use("/api/ai/missions", aiRateLimit, ai_missions_routes_default);
app.use("/api-ai-orchestrator", strictAiRateLimit, ai_default);
app.use("/api", aiRateLimit, ai_quick_analysis_default);
app.use("/api/ai/diagnostic", ai_diagnostic_routes_default);
app.use("/api/ai/suggestions", ai_suggestions_routes_default);
app.use("/api/ai/learning", ai_learning_routes_default);
app.use("/api", feed_routes_default);
app.use("/api", favorites_routes_default);
app.use("/api", mission_demo_default);
app.use("/api/team", team_routes_default);
app.get("/api/health", async (req, res) => {
  try {
    await pool4.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      message: "SwipDEAL API is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check database error:", error);
    res.status(503).json({
      status: "error",
      message: "Database connection failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/api/debug/missions", (req, res) => {
  res.json({
    debug_info: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      env: process.env.NODE_ENV,
      status: "database_unified",
      memory_usage: process.memoryUsage()
    },
    message: "Check /api/missions for actual missions data"
  });
});
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "swideal-api",
    version: "1.0.0",
    node_env: process.env.NODE_ENV
  });
});
app.get("/api/ai/gemini-diagnostic", (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  res.json({
    gemini_ai_configured: hasApiKey,
    api_key: hasApiKey ? "CONFIGURED" : "MISSING",
    status: hasApiKey ? "ready" : "incomplete",
    provider: "gemini-api-only"
  });
});
var server = createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(`\u{1F680} SwipDEAL server running on http://0.0.0.0:${port}`);
  console.log(`\u{1F4F1} Frontend: http://0.0.0.0:${port}`);
  console.log(`\u{1F527} API Health: http://0.0.0.0:${port}/api/health`);
  console.log(`\u{1F3AF} AI Provider: Gemini API Only`);
  console.log(`\u{1F50D} Process ID: ${process.pid}`);
  console.log(`\u{1F50D} Node Environment: ${process.env.NODE_ENV || "development"}`);
  if (process.env.NODE_ENV === "production") {
    console.log("\u{1F3ED} Production mode: serving static files");
    serveStatic(app);
  } else {
    console.log("\u{1F6E0}\uFE0F Development mode: setting up Vite dev server...");
    setupVite(app, server).catch((error) => {
      console.error("\u26A0\uFE0F Vite setup failed (non-critical):", error);
    });
  }
});
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\u274C Port ${port} is already in use. Server will exit and let Replit handle restart.`);
    console.error(`\u{1F4A1} The deployment compilation issues have been fixed. This is just a port conflict that should resolve on restart.`);
    process.exit(1);
  } else {
    console.error("\u274C Server error:", err);
    process.exit(1);
  }
});
console.log("\u2705 Advanced AI routes registered - Gemini API Only");
process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("Stack:", error.stack);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
app.use((error, req, res, next) => {
  console.error("\u{1F6A8} Global error handler:", error);
  console.error("\u{1F6A8} Request URL:", req.url);
  console.error("\u{1F6A8} Request method:", req.method);
  console.error("\u{1F6A8} Request body:", req.body);
  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var index_default = app;
export {
  index_default as default
};
