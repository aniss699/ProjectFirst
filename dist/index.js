var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
import { pgTable, serial, varchar, text, integer, timestamp, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, missions, offers, aiEvents, announcements, feedFeedback, feedSeen, insertFeedFeedbackSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      password: varchar("password", { length: 255 }).notNull(),
      role: varchar("role", { length: 50 }).default("CLIENT").notNull(),
      rating_mean: decimal("rating_mean", { precision: 3, scale: 2 }).default("0"),
      rating_count: integer("rating_count").default(0),
      profile_data: jsonb("profile_data"),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    missions = pgTable("missions", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      description: text("description").notNull(),
      category: varchar("category", { length: 100 }),
      budget: integer("budget"),
      location: varchar("location", { length: 255 }),
      user_id: integer("user_id").references(() => users.id).notNull(),
      status: varchar("status", { length: 50 }).default("active").notNull(),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    offers = pgTable("offers", {
      id: serial("id").primaryKey(),
      mission_id: integer("mission_id").references(() => missions.id).notNull(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      amount: integer("amount").notNull(),
      message: text("message"),
      status: varchar("status", { length: 50 }).default("pending").notNull(),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    aiEvents = pgTable("ai_events", {
      id: varchar("id").primaryKey(),
      phase: varchar("phase", { length: 50 }).notNull(),
      provider: varchar("provider", { length: 100 }).notNull(),
      model_family: varchar("model_family", { length: 50 }).notNull(),
      model_name: varchar("model_name", { length: 100 }).notNull(),
      allow_training: boolean("allow_training").notNull(),
      input_redacted: jsonb("input_redacted"),
      output: jsonb("output"),
      confidence: varchar("confidence"),
      tokens: integer("tokens"),
      latency_ms: integer("latency_ms"),
      provenance: varchar("provenance", { length: 100 }).notNull(),
      prompt_hash: varchar("prompt_hash", { length: 64 }).notNull(),
      accepted: boolean("accepted"),
      rating: integer("rating"),
      edits: text("edits"),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    announcements = pgTable("announcements", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 500 }).notNull(),
      description: text("description").notNull(),
      category: varchar("category", { length: 100 }),
      budget_min: integer("budget_min"),
      budget_max: integer("budget_max"),
      location: varchar("location", { length: 255 }),
      user_id: integer("user_id").references(() => users.id).notNull(),
      status: varchar("status", { length: 50 }).default("active").notNull(),
      tags: jsonb("tags"),
      sponsored: boolean("sponsored").default(false),
      created_at: timestamp("created_at").defaultNow().notNull(),
      updated_at: timestamp("updated_at").defaultNow().notNull()
    });
    feedFeedback = pgTable("feed_feedback", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
      feedback_type: varchar("feedback_type", { length: 50 }).notNull(),
      // 'like', 'dislike', 'not_interested'
      feedback_reason: varchar("feedback_reason", { length: 200 }),
      action: varchar("action", { length: 100 }),
      dwell_ms: integer("dwell_ms"),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    feedSeen = pgTable("feed_seen", {
      id: serial("id").primaryKey(),
      user_id: integer("user_id").references(() => users.id).notNull(),
      announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
      seen_at: timestamp("seen_at").defaultNow().notNull()
    });
    insertFeedFeedbackSchema = createInsertSchema(feedFeedback);
  }
});

// apps/api/src/ai/aiOrchestrator.ts
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
import { desc as desc2, eq as eq4, and, gte } from "drizzle-orm";
var pool4, db4, AILearningEngine, aiLearningEngine;
var init_learning_engine = __esm({
  "apps/api/src/ai/learning-engine.ts"() {
    "use strict";
    init_schema();
    pool4 = new Pool4({ connectionString: process.env.DATABASE_URL });
    db4 = drizzle4(pool4);
    AILearningEngine = class {
      patterns = /* @__PURE__ */ new Map();
      insights = [];
      /**
       * Analyse les interactions passées avec Gemini pour identifier les patterns de succès
       */
      async analyzePastInteractions(limit = 1e3) {
        try {
          console.log("\u{1F9E0} D\xE9but de l'analyse des patterns d'apprentissage...");
          const recentInteractions = await db4.select().from(aiEvents).where(and(
            eq4(aiEvents.provider, "gemini-api"),
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
import express3 from "express";
import cors from "cors";

// server/database.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var isPreviewMode = process.env.PREVIEW_MODE === "true" || process.env.NODE_ENV === "production";
var databaseUrl = isPreviewMode ? process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING : process.env.DATABASE_URL || process.env.CLOUD_SQL_CONNECTION_STRING || "postgresql://localhost:5432/swideal";
var pool = new Pool({
  connectionString: databaseUrl
});
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});
pool.on("connect", () => {
  console.log("\u2705 Database connection established");
});
var db = drizzle(pool);
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("\u2705 Database connection test successful");
    client.release();
  } catch (error) {
    console.error("\u274C Database connection test failed:", error);
  }
}
console.log("\u{1F517} Database connection established:", {
  databaseUrl: databaseUrl ? "***configured***" : "missing",
  isCloudSQL: databaseUrl?.includes("/cloudsql/") || false
});

// server/auth-routes.ts
init_schema();
import express from "express";
import { Pool as Pool2 } from "pg";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
var pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
var db2 = drizzle2(pool2);
var router = express.Router();
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const user = await db2.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }
    const userData = user[0];
    if (userData.password !== password) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }
    const userSession = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rating_mean: userData.rating_mean,
      rating_count: userData.rating_count,
      profile_data: userData.profile_data,
      created_at: userData.created_at
    };
    res.json({
      success: true,
      user: userSession,
      message: `Bienvenue ${userData.name || userData.email} !`
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role = "CLIENT" } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const existingUser = await db2.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Un compte existe d\xE9j\xE0 avec cet email" });
    }
    const [newUser] = await db2.insert(users).values({
      email,
      password,
      // En production, hasher avec bcrypt
      name,
      role,
      profile_data: {}
    }).returning();
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      rating_mean: newUser.rating_mean,
      rating_count: newUser.rating_count,
      profile_data: newUser.profile_data,
      created_at: newUser.created_at
    };
    res.status(201).json({
      success: true,
      user: userSession,
      message: "Compte cr\xE9\xE9 avec succ\xE8s !"
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ error: "Erreur serveur lors de la cr\xE9ation du compte" });
  }
});
router.get("/profile/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await db2.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouv\xE9" });
    }
    const userData = user[0];
    const userProfile = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      rating_mean: userData.rating_mean,
      rating_count: userData.rating_count,
      profile_data: userData.profile_data,
      created_at: userData.created_at
    };
    res.json({ user: userProfile });
  } catch (error) {
    console.error("Erreur get profile:", error);
    res.status(500).json({ error: "Erreur serveur lors de la r\xE9cup\xE9ration du profil" });
  }
});
router.get("/demo-users", async (req, res) => {
  try {
    const demoUsers = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      profile_data: users.profile_data
    }).from(users);
    res.json({
      users: demoUsers,
      message: "Utilisateurs de d\xE9monstration disponibles"
    });
  } catch (error) {
    console.error("Erreur get demo users:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/demo-accounts/verify", async (req, res) => {
  try {
    const demoEmails = ["demo@swideal.com", "prestataire@swideal.com", "admin@swideal.com"];
    const demoAccounts = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at
    }).from(users).where(sql`${users.email} = ANY(${demoEmails})`);
    const accountsStatus = {
      client: demoAccounts.find((u) => u.email === "demo@swideal.com"),
      provider: demoAccounts.find((u) => u.email === "prestataire@swideal.com"),
      admin: demoAccounts.find((u) => u.email === "admin@swideal.com"),
      total: demoAccounts.length
    };
    res.json({
      success: true,
      accounts: accountsStatus,
      allPresent: demoAccounts.length === 3
    });
  } catch (error) {
    console.error("Erreur v\xE9rification comptes d\xE9mo:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la v\xE9rification des comptes d\xE9mo"
    });
  }
});
router.get("/debug/demo-accounts", async (req, res) => {
  try {
    console.log("\u{1F50D} Diagnostic des comptes d\xE9mo...");
    const allUsers = await db2.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at
    }).from(users);
    const demoUsers = await db2.select().from(users).where(sql`${users.email} IN ('demo@swideal.com', 'prestataire@swideal.com', 'admin@swideal.com')`);
    res.json({
      debug: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database_url_exists: !!process.env.DATABASE_URL,
      total_users: allUsers.length,
      all_users: allUsers,
      demo_accounts_found: demoUsers.length,
      demo_accounts: demoUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        password_length: user.password?.length || 0,
        password_is_demo123: user.password === "demo123",
        password_is_admin123: user.password === "admin123",
        created_at: user.created_at
      }))
    });
  } catch (error) {
    console.error("\u274C Erreur diagnostic:", error);
    res.status(500).json({
      error: "Erreur lors du diagnostic",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
router.post("/debug/create-demo-accounts", async (req, res) => {
  try {
    console.log("\u{1F6E0}\uFE0F Cr\xE9ation forc\xE9e des comptes d\xE9mo...");
    const demoAccounts = [
      {
        email: "demo@swideal.com",
        password: "demo123",
        name: "Emma Rousseau",
        role: "CLIENT",
        rating_mean: "0",
        rating_count: 0,
        profile_data: {
          company: "TechStart Innovation",
          sector: "SaaS",
          projects_posted: 0,
          total_budget_spent: 0,
          verified: true,
          phone: "+33 1 45 67 89 12",
          location: "Paris, France"
        }
      },
      {
        email: "prestataire@swideal.com",
        password: "demo123",
        name: "Julien Moreau",
        role: "PRO",
        rating_mean: "0",
        rating_count: 0,
        profile_data: {
          specialties: ["React", "Node.js", "TypeScript", "Python"],
          hourly_rate: 65,
          availability: "Disponible",
          experience_years: 5,
          completed_projects: 0,
          success_rate: 0,
          response_time_hours: 4,
          certifications: ["React Developer"],
          portfolio_url: "https://julienmoreau.dev",
          linkedin: "https://linkedin.com/in/julienmoreau",
          phone: "+33 6 78 90 12 34",
          location: "Lyon, France"
        }
      },
      {
        email: "admin@swideal.com",
        password: "admin123",
        name: "Clara Dubois",
        role: "ADMIN",
        profile_data: {
          department: "Platform Management",
          access_level: "full",
          phone: "+33 1 56 78 90 12"
        }
      }
    ];
    const results = [];
    for (const account of demoAccounts) {
      try {
        const existingUser = await db2.select().from(users).where(eq(users.email, account.email)).limit(1);
        if (existingUser.length > 0) {
          results.push({
            email: account.email,
            status: "exists",
            message: "Compte d\xE9j\xE0 existant"
          });
        } else {
          const [newUser] = await db2.insert(users).values(account).returning();
          results.push({
            email: account.email,
            status: "created",
            id: newUser.id,
            message: "Compte cr\xE9\xE9 avec succ\xE8s"
          });
        }
      } catch (error) {
        results.push({
          email: account.email,
          status: "error",
          message: error.message
        });
      }
    }
    res.json({
      success: true,
      message: "Cr\xE9ation des comptes d\xE9mo termin\xE9e",
      results,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("\u274C Erreur cr\xE9ation comptes d\xE9mo:", error);
    res.status(500).json({
      error: "Erreur lors de la cr\xE9ation des comptes d\xE9mo",
      details: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var auth_routes_default = router;

// server/api-routes.ts
init_schema();
import express2 from "express";
import { Pool as Pool3 } from "pg";
import { drizzle as drizzle3 } from "drizzle-orm/node-postgres";
import { eq as eq2 } from "drizzle-orm";
var pool3 = new Pool3({ connectionString: process.env.DATABASE_URL });
var db3 = drizzle3(pool3);
var router2 = express2.Router();
router2.get("/demo-providers", async (req, res) => {
  try {
    const providers = await db3.select({
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
router2.get("/demo-missions", async (req, res) => {
  try {
    const missionsWithClients = await db3.select({
      id: missions.id,
      title: missions.title,
      description: missions.description,
      budget: missions.budget,
      category: missions.category,
      location: missions.location,
      status: missions.status,
      created_at: missions.created_at,
      client_name: users.name,
      client_email: users.email
    }).from(missions).leftJoin(users, eq2(missions.user_id, users.id));
    res.json({ missions: missionsWithClients });
  } catch (error) {
    console.error("Erreur get demo missions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/demo-offers", async (req, res) => {
  try {
    const offersWithInfo = await db3.select({
      id: offers.id,
      amount: offers.amount,
      message: offers.message,
      status: offers.status,
      created_at: offers.created_at,
      mission_title: missions.title,
      mission_budget: missions.budget,
      provider_name: users.name,
      provider_email: users.email
    }).from(offers).leftJoin(missions, eq2(offers.mission_id, missions.id)).leftJoin(users, eq2(offers.user_id, users.id));
    res.json({ offers: offersWithInfo });
  } catch (error) {
    console.error("Erreur get demo offers:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/provider/:id", async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await db3.select().from(users).where(eq2(users.id, providerId)).limit(1);
    if (provider.length === 0) {
      return res.status(404).json({ error: "Prestataire non trouv\xE9" });
    }
    const providerData = provider[0];
    const providerOffers = await db3.select({
      id: offers.id,
      amount: offers.amount,
      message: offers.message,
      status: offers.status,
      created_at: offers.created_at,
      mission_title: missions.title,
      mission_budget: missions.budget
    }).from(offers).leftJoin(missions, eq2(offers.mission_id, missions.id)).where(eq2(offers.user_id, providerId));
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
        offers: providerOffers
      }
    });
  } catch (error) {
    console.error("Erreur get provider:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router2.get("/ai-analysis-demo", async (req, res) => {
  try {
    const recentMissions = await db3.select({
      id: missions.id,
      title: missions.title,
      description: missions.description,
      budget: missions.budget,
      category: missions.category,
      created_at: missions.created_at
    }).from(missions).limit(3);
    const recentOffers = await db3.select({
      id: offers.id,
      amount: offers.amount,
      message: offers.message,
      status: offers.status,
      created_at: offers.created_at
    }).from(offers).limit(5);
    const aiAnalysis = {
      totalMissions: recentMissions.length,
      totalOffers: recentOffers.length,
      averageMissionBudget: recentMissions.reduce((sum, m) => {
        return sum + (m.budget || 0);
      }, 0) / recentMissions.length || 0,
      popularCategories: Array.from(new Set(recentMissions.map((m) => m.category))),
      averageOfferAmount: recentOffers.reduce((sum, o) => sum + (o.amount || 0), 0) / recentOffers.length || 0,
      successRate: 0.87,
      timeToMatch: 2.3,
      // days
      missions: recentMissions,
      offers: recentOffers
    };
    res.json({ analysis: aiAnalysis });
  } catch (error) {
    console.error("Erreur get AI analysis:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
var api_routes_default = router2;

// server/routes/projects.ts
import { Router } from "express";
import { eq as eq3, desc } from "drizzle-orm";
init_schema();
function generateExcerpt(description, maxLength = 200) {
  if (!description || description.length <= maxLength) {
    return description || "";
  }
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace).trim() + "...";
  }
  return truncated.trim() + "...";
}
var router3 = Router();
router3.get("/users/:userId/missions", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("\u{1F464} Fetching missions for user:", userId);
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("\u274C Invalid user ID:", userId);
      return res.status(400).json({ error: "User ID invalide" });
    }
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.error("\u274C User ID is not a valid number:", userId);
      return res.status(400).json({ error: "User ID doit \xEAtre un nombre" });
    }
    console.log("\u{1F50D} Querying database: SELECT * FROM missions WHERE client_id =", userIdInt);
    const userMissions = await db.select().from(missions).where(eq3(missions.user_id, userIdInt)).orderBy(desc(missions.created_at));
    console.log("\u{1F4CA} Query result: Found", userMissions.length, "missions with user_id =", userIdInt);
    userMissions.forEach((mission) => {
      console.log("   \u{1F4CB} Mission:", mission.id, "| user_id:", mission.user_id, "| title:", mission.title);
    });
    const missionsWithExcerpt = userMissions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || "", 200),
      category: mission.category,
      budget: mission.budget?.toString() || "0",
      location: mission.location,
      status: mission.status,
      userId: mission.user_id?.toString(),
      userName: "Moi",
      // Placeholder, should be fetched or passed
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      offers: []
      // Placeholder, offers are fetched separately if needed
    }));
    console.log(`\u{1F464} Found ${missionsWithExcerpt.length} missions for user ${userId}`);
    res.json(missionsWithExcerpt);
  } catch (error) {
    console.error("\u274C Error fetching user missions:", error);
    res.status(500).json({
      error: "Failed to fetch user missions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router3.get("/:id", async (req, res) => {
  try {
    const missionId = req.params.id;
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
    const missionResult = await db.select().from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
    if (missionResult.length === 0) {
      console.error("\u274C API: Mission non trouv\xE9e:", missionId);
      return res.status(404).json({ error: "Mission non trouv\xE9e" });
    }
    const mission = missionResult[0];
    console.log("\u2705 API: Mission trouv\xE9e:", mission.title);
    const missionWithExcerpt = {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt(mission.description || "", 200),
      category: mission.category,
      budget: mission.budget?.toString() || "0",
      location: mission.location,
      status: mission.status,
      userId: mission.user_id?.toString(),
      userName: "Moi",
      // Placeholder
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      offers: []
      // Placeholder, potentially fetch offers here too if needed
    };
    res.json(missionWithExcerpt);
  } catch (error) {
    console.error("\u274C API: Erreur r\xE9cup\xE9ration mission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});
router3.get("/:id/offers", async (req, res) => {
  try {
    const missionId = req.params.id;
    console.log("\u{1F50D} API: R\xE9cup\xE9ration offers pour mission ID:", missionId);
    if (!missionId || missionId === "undefined" || missionId === "null") {
      console.error("\u274C API: Mission ID invalide:", missionId);
      return res.status(400).json({ error: "Mission ID invalide" });
    }
    const missionIdInt = parseInt(missionId, 10);
    if (isNaN(missionIdInt)) {
      console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
      return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre" });
    }
    const missionOffers = await db.select().from(offers).where(eq3(offers.mission_id, missionIdInt));
    console.log("\u2705 API: Trouv\xE9", missionOffers.length, "offers pour mission", missionId);
    res.json(missionOffers);
  } catch (error) {
    console.error("\u274C API: Erreur r\xE9cup\xE9ration offers:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});
router3.delete("/:id", async (req, res) => {
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
    const existingMission = await db.select().from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
    if (existingMission.length === 0) {
      console.error("\u274C API: Mission non trouv\xE9e pour suppression:", missionId);
      return res.status(404).json({ error: "Mission non trouv\xE9e" });
    }
    await db.delete(offers).where(eq3(offers.mission_id, missionIdInt));
    console.log("\u2705 API: Offers supprim\xE9es pour mission:", missionId);
    const deletedMission = await db.delete(missions).where(eq3(missions.id, missionIdInt)).returning();
    if (deletedMission.length === 0) {
      throw new Error("\xC9chec de la suppression de la mission");
    }
    console.log("\u2705 API: Mission supprim\xE9e avec succ\xE8s:", missionId);
    res.json({ message: "Mission supprim\xE9e avec succ\xE8s", mission: deletedMission[0] });
  } catch (error) {
    console.error("\u274C API: Erreur suppression mission:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});
var projects_default = router3;

// server/routes/team-routes.ts
import { Router as Router2 } from "express";
import { z } from "zod";
var router4 = Router2();
var teamAnalysisSchema = z.object({
  description: z.string().min(10),
  title: z.string().min(3),
  category: z.string().min(2),
  budget: z.union([z.string(), z.number()])
});
var teamProjectSchema = z.object({
  projectData: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2),
    budget: z.union([z.string(), z.number()]),
    location: z.string().optional(),
    isTeamMode: z.boolean()
  }),
  teamRequirements: z.array(z.object({
    profession: z.string(),
    description: z.string(),
    required_skills: z.array(z.string()),
    estimated_budget: z.number(),
    estimated_days: z.number(),
    min_experience: z.number(),
    is_lead_role: z.boolean(),
    importance: z.enum(["high", "medium", "low"])
  }))
});
router4.post("/analyze", async (req, res) => {
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
router4.post("/create-project", async (req, res) => {
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
router4.get("/users/:userId/missions", async (req, res) => {
  res.status(410).json({
    error: "Les missions ont \xE9t\xE9 supprim\xE9es",
    message: "Cette fonctionnalit\xE9 n'est plus disponible"
  });
});
var team_routes_default = router4;

// server/routes/ai-routes.ts
import { Router as Router3 } from "express";
import { z as z2 } from "zod";
var router5 = Router3();
var priceSuggestionSchema = z2.object({
  title: z2.string().min(5, "Titre trop court"),
  description: z2.string().min(10, "Description trop courte"),
  category: z2.string().min(1, "Cat\xE9gorie requise")
});
var enhanceDescriptionSchema = z2.object({
  description: z2.string().min(5, "Description trop courte"),
  category: z2.string().min(1, "Cat\xE9gorie requise"),
  additionalInfo: z2.string().optional()
});
var analyzeQualitySchema = z2.object({
  description: z2.string().min(5, "Description trop courte")
});
var enhanceTextSchema = z2.object({
  text: z2.string().min(1, "Texte requis"),
  fieldType: z2.enum(["title", "description", "requirements"]),
  category: z2.string().optional()
});
router5.post("/suggest-pricing", async (req, res) => {
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
    if (error instanceof z2.ZodError) {
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
router5.post("/enhance-description", async (req, res) => {
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
    if (error instanceof z2.ZodError) {
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
router5.post("/analyze-quality", async (req, res) => {
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
    if (error instanceof z2.ZodError) {
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
router5.post("/enhance-text", async (req, res) => {
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
router5.get("/health", async (req, res) => {
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
router5.get("/test-config", async (req, res) => {
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
router5.post("/analyze", async (req, res) => {
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
var ai_routes_default = router5;

// server/index.ts
var app = express3();
var port = Number(process.env.PORT) || 3001;
console.log("\u{1F680} Starting Swideal Server...");
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));
app.use(express3.json({ limit: "50mb" }));
app.use(express3.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api/auth", auth_routes_default);
app.use("/api", api_routes_default);
app.use("/api/projects", projects_default);
app.use("/api/team", team_routes_default);
app.use("/api/ai", ai_routes_default);
app.all("/api/missions*", (req, res) => {
  res.status(410).json({
    error: "API missions supprim\xE9e",
    message: "Cette fonctionnalit\xE9 a \xE9t\xE9 compl\xE8tement supprim\xE9e"
  });
});
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "swideal-api",
    environment: process.env.NODE_ENV || "development"
  });
});
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint non trouv\xE9" });
});
app.use((error, req, res, next) => {
  console.error("\u274C Erreur serveur:", error);
  res.status(500).json({
    error: "Erreur interne du serveur",
    details: process.env.NODE_ENV === "development" ? error.message : void 0
  });
});
app.listen(port, "0.0.0.0", async () => {
  console.log(`\u2705 Serveur d\xE9marr\xE9 sur le port ${port}`);
  console.log(`\u{1F310} URL: http://localhost:${port}`);
  await testConnection();
});
setImmediate(async () => {
  try {
    console.log("\u2705 Comptes d\xE9mo - v\xE9rification diff\xE9r\xE9e");
  } catch (error) {
    console.warn("\u26A0\uFE0F Comptes d\xE9mo - v\xE9rification \xE9chou\xE9e");
  }
});
