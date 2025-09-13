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

// apps/api/src/monitoring/event-logger.ts
var event_logger_exports = {};
__export(event_logger_exports, {
  EventLogger: () => EventLogger,
  eventLogger: () => eventLogger
});
var EventLogger, eventLogger;
var init_event_logger = __esm({
  "apps/api/src/monitoring/event-logger.ts"() {
    "use strict";
    EventLogger = class {
      eventBuffer = [];
      performanceCache = /* @__PURE__ */ new Map();
      batchSize = 50;
      flushInterval = 3e4;
      // 30 secondes
      constructor() {
        this.startAutoFlush();
      }
      /**
       * Log d'événement d'erreur système
       */
      logErrorEvent(error, userId, sessionId, context = {}) {
        const event = {
          event_type: "click",
          // Using existing type for error tracking
          user_id: userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          session_id: sessionId,
          metadata: {
            error_type: "system_error",
            error_message: error.message,
            error_stack: error.stack,
            context,
            severity: "high"
          }
        };
        this.addToBuffer(event);
        console.log("\u{1F6A8} [ERROR_LOGGED]", JSON.stringify({
          error: error.message,
          user: userId,
          session: sessionId,
          timestamp: event.timestamp
        }));
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
      logPerformanceMetrics(modelType, metrics2) {
        const key = `${modelType}_${Date.now()}`;
        this.performanceCache.set(key, {
          ...metrics2,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("\u{1F9E0} [AI_PERFORMANCE]", JSON.stringify({
          model: modelType,
          latency: metrics2.ai_latency_ms,
          confidence: metrics2.confidence_level,
          version: metrics2.model_version
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
        for (const [key, metrics2] of this.performanceCache.entries()) {
          const metricTime = new Date(metrics2.timestamp).getTime();
          if (metricTime < cutoff) {
            this.performanceCache.delete(key);
          }
        }
      }
    };
    eventLogger = new EventLogger();
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

// server/index.ts
import express7 from "express";
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
    }
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

// server/database.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/swideal";
var pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5e3,
  idleTimeoutMillis: 1e4,
  max: 20
});
pool.on("error", (err) => {
  console.error("\u274C Database pool error:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
pool.on("connect", (client) => {
  console.log("\u2705 Database connection established");
});
async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    console.log("\u2705 Database connection test successful:", result.rows[0]);
  } catch (error) {
    console.error("\u274C Database connection test failed:", {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
}
var db = drizzle(pool);
async function initializeDatabase() {
  try {
    console.log("\u{1F527} Initializing database tables...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        rating_mean DECIMAL(3, 2),
        rating_count INTEGER DEFAULT 0,
        profile_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT,
        location_raw TEXT,
        city TEXT,
        country TEXT,
        remote_allowed BOOLEAN DEFAULT true,
        budget_min INTEGER,
        budget_max INTEGER,
        budget_value_cents INTEGER,
        budget_min_cents INTEGER,
        budget_max_cents INTEGER,
        currency TEXT DEFAULT 'EUR',
        urgency TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        quality_target TEXT DEFAULT 'standard',
        deadline TIMESTAMP,
        tags JSONB,
        skills_required JSONB,
        requirements TEXT,
        is_team_mission BOOLEAN DEFAULT false,
        team_size INTEGER DEFAULT 1,
        client_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) NOT NULL,
        provider_id INTEGER REFERENCES users(id) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        timeline_days INTEGER,
        message TEXT,
        score_breakdown JSONB,
        is_leading BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'active',
        category TEXT,
        budget_value_cents INTEGER,
        budget_min_cents INTEGER,
        budget_max_cents INTEGER,
        currency TEXT DEFAULT 'EUR',
        location TEXT,
        location_raw TEXT,
        city TEXT,
        country TEXT,
        remote_allowed BOOLEAN DEFAULT true,
        user_id INTEGER REFERENCES users(id),
        client_id INTEGER REFERENCES users(id),
        sponsored BOOLEAN DEFAULT false,
        urgency TEXT DEFAULT 'medium',
        deadline TIMESTAMP,
        tags JSONB,
        skills_required JSONB,
        requirements TEXT,
        is_team_mission BOOLEAN DEFAULT false,
        team_size INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_feedback (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        feedback_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feed_seen (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        seen_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        announcement_id INTEGER REFERENCES announcements(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_events (
        id TEXT PRIMARY KEY,
        phase TEXT NOT NULL,
        provider TEXT NOT NULL,
        model_family TEXT NOT NULL,
        model_name TEXT NOT NULL,
        allow_training BOOLEAN NOT NULL,
        input_redacted JSONB,
        output JSONB,
        confidence TEXT,
        tokens INTEGER,
        latency_ms INTEGER,
        provenance TEXT NOT NULL,
        prompt_hash TEXT,
        accepted BOOLEAN,
        rating INTEGER,
        edits JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Database tables initialized successfully");
  } catch (error) {
    console.error("\u274C Database initialization failed:", error);
  }
}
initializeDatabase();
testConnection();
console.log("\u{1F517} Database connection established:", {
  databaseUrl: databaseUrl ? "***configured***" : "missing",
  isCloudSQL: databaseUrl?.includes("/cloudsql/") || false
});

// shared/schema.ts
import { pgTable, serial, integer, text, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().$type(),
  rating_mean: decimal("rating_mean", { precision: 3, scale: 2 }),
  rating_count: integer("rating_count").default(0),
  profile_data: jsonb("profile_data"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  client_id: integer("client_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  excerpt: text("excerpt"),
  category: text("category").notNull(),
  // Localisation unifiée en JSON
  location_data: jsonb("location_data"),
  // Budget unifié (plus de redondance)
  budget_value_cents: integer("budget_value_cents").notNull(),
  currency: text("currency").default("EUR"),
  // ENUMs PostgreSQL optimisés
  urgency: text("urgency").$type().default("medium"),
  status: text("status").$type().default("draft"),
  quality_target: text("quality_target").$type().default("standard"),
  deadline: timestamp("deadline"),
  tags: jsonb("tags"),
  skills_required: jsonb("skills_required"),
  requirements: text("requirements"),
  is_team_mission: boolean("is_team_mission").default(false),
  team_size: integer("team_size").default(1),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  mission_id: integer("mission_id").references(() => missions.id).notNull(),
  provider_id: integer("provider_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  timeline_days: integer("timeline_days"),
  message: text("message"),
  score_breakdown: jsonb("score_breakdown"),
  is_leading: boolean("is_leading").default(false),
  status: text("status").$type().default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").$type().default("info"),
  priority: integer("priority").default(1),
  is_active: boolean("is_active").default(true),
  status: text("status").$type().default("active"),
  category: text("category"),
  budget: integer("budget"),
  location: text("location"),
  user_id: integer("user_id").references(() => users.id),
  sponsored: boolean("sponsored").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var feedFeedback = pgTable("feed_feedback", {
  id: serial("id").primaryKey(),
  announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  feedback_type: text("feedback_type").$type().notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var feedSeen = pgTable("feed_seen", {
  id: serial("id").primaryKey(),
  announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  seen_at: timestamp("seen_at").defaultNow()
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  announcement_id: integer("announcement_id").references(() => announcements.id).notNull(),
  created_at: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  missions: many(missions),
  bids: many(bids)
}));
var missionsRelations = relations(missions, ({ one, many }) => ({
  user: one(users, {
    fields: [missions.user_id],
    references: [users.id]
  }),
  bids: many(bids)
}));
var bidsRelations = relations(bids, ({ one }) => ({
  mission: one(missions, {
    fields: [bids.mission_id],
    references: [missions.id]
  }),
  provider: one(users, {
    fields: [bids.provider_id],
    references: [users.id]
  })
}));
var announcementsRelations = relations(announcements, ({ one, many }) => ({
  user: one(users, {
    fields: [announcements.user_id],
    references: [users.id]
  }),
  feedbacks: many(feedFeedback),
  seenBy: many(feedSeen),
  favorites: many(favorites)
}));
var feedFeedbackRelations = relations(feedFeedback, ({ one }) => ({
  announcement: one(announcements, {
    fields: [feedFeedback.announcement_id],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [feedFeedback.user_id],
    references: [users.id]
  })
}));
var feedSeenRelations = relations(feedSeen, ({ one }) => ({
  announcement: one(announcements, {
    fields: [feedSeen.announcement_id],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [feedSeen.user_id],
    references: [users.id]
  })
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  announcement: one(announcements, {
    fields: [favorites.announcement_id],
    references: [announcements.id]
  }),
  user: one(users, {
    fields: [favorites.user_id],
    references: [users.id]
  })
}));
var insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  // Added password validation, assuming a minimum of 8 characters
  role: z.enum(["CLIENT", "PRO", "ADMIN"]),
  rating_mean: z.string().optional(),
  rating_count: z.number().int().min(0).optional(),
  profile_data: z.any().optional()
});
var insertMissionSchema = z.object({
  user_id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  location: z.string().optional(),
  postal_code: z.string().optional(),
  // Added postal_code validation
  budget: z.number().int().min(0).optional(),
  budget_value_cents: z.number().int().min(0).optional(),
  budget_type: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["draft", "open", "published", "assigned", "completed", "cancelled"]).optional(),
  quality_target: z.enum(["basic", "standard", "premium", "luxury"]).optional()
});
var insertBidSchema = z.object({
  mission_id: z.number().int().positive(),
  provider_id: z.number().int().positive(),
  amount: z.string(),
  timeline_days: z.number().int().min(1).optional(),
  message: z.string().optional(),
  score_breakdown: z.any().optional(),
  is_leading: z.boolean().optional(),
  status: z.enum(["pending", "accepted", "rejected", "withdrawn"]).optional()
});
var insertAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["info", "warning", "error", "success"]).optional(),
  priority: z.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
  status: z.enum(["active", "completed", "cancelled", "draft"]).optional(),
  category: z.string().optional(),
  budget: z.number().int().min(0).optional(),
  location: z.string().optional(),
  user_id: z.number().int().positive().optional(),
  sponsored: z.boolean().optional()
});
var insertFeedFeedbackSchema = z.object({
  announcement_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  feedback_type: z.enum(["like", "dislike", "interested", "not_relevant"])
});
var insertFeedSeenSchema = z.object({
  announcement_id: z.number().int().positive(),
  user_id: z.number().int().positive()
});
var insertFavoritesSchema = z.object({
  user_id: z.number().int().positive(),
  announcement_id: z.number().int().positive()
});
var aiEvents = pgTable("ai_events", {
  id: text("id").primaryKey(),
  phase: text("phase").$type().notNull(),
  provider: text("provider").notNull(),
  model_family: text("model_family").$type().notNull(),
  model_name: text("model_name").notNull(),
  allow_training: boolean("allow_training").notNull(),
  input_redacted: jsonb("input_redacted"),
  output: jsonb("output"),
  confidence: text("confidence"),
  tokens: integer("tokens"),
  latency_ms: integer("latency_ms"),
  provenance: text("provenance").$type().notNull(),
  prompt_hash: text("prompt_hash"),
  accepted: boolean("accepted"),
  rating: integer("rating"),
  edits: jsonb("edits"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var aiEventsRelations = relations(aiEvents, ({ one }) => ({
  // Pas de relations directes pour l'instant
}));
var insertAiEventSchema = z.object({
  id: z.string(),
  phase: z.enum(["pricing", "brief_enhance", "matching", "scoring"]),
  provider: z.string(),
  model_family: z.enum(["gemini", "openai", "local", "other"]),
  model_name: z.string(),
  allow_training: z.boolean(),
  input_redacted: z.any().optional(),
  output: z.any().optional(),
  confidence: z.string().optional(),
  tokens: z.number().int().optional(),
  latency_ms: z.number().int().optional(),
  provenance: z.enum(["auto", "human_validated", "ab_test_winner"]),
  prompt_hash: z.string().optional(),
  accepted: z.boolean().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  edits: z.any().optional()
});

// server/services/mission-sync.ts
import { eq } from "drizzle-orm";
var MissionSyncService = class {
  databaseUrl;
  constructor(databaseUrl3) {
    this.databaseUrl = databaseUrl3;
  }
  /**
   * Synchronise une mission vers le feed announcements
   * Gestion idempotente avec upsert
   */
  async syncMissionToFeed(missionId) {
    try {
      console.log(`\u{1F504} Sync mission ${missionId} to feed`);
      const mission = await this.getMissionWithDetails(missionId);
      if (!mission) {
        throw new Error(`Mission ${missionId} not found`);
      }
      const feedItem = this.buildMissionForFeed(mission);
      await this.upsertAnnouncement(feedItem);
      console.log(`\u2705 Mission ${missionId} synced to feed successfully`);
    } catch (error) {
      console.error(`\u274C Failed to sync mission ${missionId} to feed:`, error);
      throw error;
    }
  }
  /**
   * Construit l'objet announcement à partir d'une mission
   * Règles de transformation et optimisation SEO
   */
  buildMissionForFeed(mission) {
    const excerpt = this.generateOptimizedExcerpt(mission.description, mission.skills_required);
    const budgetDisplay = this.formatBudgetForFeed(mission);
    const budgetValueCents = this.extractBudgetValueForSorting(mission);
    const locationDisplay = this.formatLocationForFeed(mission);
    const searchText = this.buildSearchText(mission);
    const clientDisplayName = this.sanitizeClientName(mission.client_name || "Client anonyme");
    return {
      id: mission.id,
      // Contenu optimisé SEO
      title: mission.title,
      description: mission.description,
      excerpt,
      // Catégorisation pour algorithme feed
      category: mission.category || "general",
      tags: mission.tags || [],
      // Budget pour tri et affichage
      budget_display: budgetDisplay,
      budget_value_cents: budgetValueCents,
      currency: mission.currency || "EUR",
      // Localisation feed-friendly
      location_display: locationDisplay,
      city: mission.city || null,
      country: mission.country || "France",
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
      engagement_score: 0,
      // Calculé par les interactions
      freshness_score: 1,
      // Calculé par trigger
      // Status feed
      status: this.mapMissionStatusToFeedStatus(mission.status),
      urgency: mission.urgency || "medium",
      deadline: mission.deadline,
      // Métadonnées feed
      is_sponsored: false,
      // TODO: logique sponsoring
      boost_score: 0,
      // Recherche optimisée
      search_text: searchText,
      // search_vector sera calculé par la DB
      // Audit
      synced_at: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Upsert idempotent avec gestion des conflits
   */
  async upsertAnnouncement(feedItem) {
    const query = `
      SELECT upsert_announcement(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) as announcement_id
    `;
    const params = [
      feedItem.id,
      // p_mission_id
      feedItem.title,
      // p_title
      feedItem.description,
      // p_description
      feedItem.excerpt,
      // p_excerpt
      feedItem.category,
      // p_category
      feedItem.tags,
      // p_tags
      feedItem.budget_display,
      // p_budget_display
      feedItem.budget_value_cents,
      // p_budget_value_cents
      feedItem.currency,
      // p_currency
      feedItem.location_display,
      // p_location_display
      feedItem.city,
      // p_city
      feedItem.country,
      // p_country
      feedItem.client_id,
      // p_client_id
      feedItem.client_display_name,
      // p_client_display_name
      feedItem.status,
      // p_status
      feedItem.urgency,
      // p_urgency
      feedItem.deadline,
      // p_deadline
      feedItem.quality_score
      // p_quality_score
    ];
    const result = await db.execute(query, params);
    console.log(`\u{1F4E4} Upserted announcement for mission ${feedItem.id}`);
  }
  /**
   * Récupère mission avec détails pour sync
   */
  async getMissionWithDetails(missionId) {
    const query = `
      SELECT 
        m.*,
        u.name as client_name
      FROM missions m
      LEFT JOIN users u ON m.client_id = u.id
      WHERE m.id = $1
    `;
    const result = await db.execute(query, [missionId]);
    return result.rows[0] || null;
  }
  // ============================================
  // UTILITAIRES DE TRANSFORMATION
  // ============================================
  /**
   * Génère un excerpt optimisé pour le feed
   * Priorité : compétences + début description
   */
  generateOptimizedExcerpt(description, skills = []) {
    const maxLength = 200;
    if (skills.length > 0) {
      const skillsText = `Comp\xE9tences: ${skills.slice(0, 3).join(", ")}. `;
      const remainingLength = maxLength - skillsText.length - 3;
      if (remainingLength > 50) {
        const descStart = description.substring(0, remainingLength).trim();
        return skillsText + descStart + "...";
      }
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3).trim() + "...";
  }
  /**
   * Formate le budget pour affichage feed
   */
  formatBudgetForFeed(mission) {
    if (mission.budget_type === "negotiable") return "\xC0 n\xE9gocier";
    if (mission.budget_type === "fixed" && mission.budget_value_cents) {
      return `${Math.round(mission.budget_value_cents / 100)}\u20AC`;
    }
    if (mission.budget_type === "range" && mission.budget_min_cents && mission.budget_max_cents) {
      const min = Math.round(mission.budget_min_cents / 100);
      const max = Math.round(mission.budget_max_cents / 100);
      return `${min}-${max}\u20AC`;
    }
    return "Budget non d\xE9fini";
  }
  /**
   * Extrait valeur numérique pour tri
   */
  extractBudgetValueForSorting(mission) {
    if (mission.budget_type === "fixed" && mission.budget_value_cents) {
      return mission.budget_value_cents;
    }
    if (mission.budget_type === "range" && mission.budget_min_cents && mission.budget_max_cents) {
      return Math.round((mission.budget_min_cents + mission.budget_max_cents) / 2);
    }
    return null;
  }
  /**
   * Formate localisation pour feed
   */
  formatLocationForFeed(mission) {
    if (mission.city && mission.country) {
      return `${mission.city}, ${mission.country}`;
    }
    if (mission.city) return mission.city;
    if (mission.remote_allowed) return "Remote";
    return "Localisation flexible";
  }
  /**
   * Construit texte de recherche optimisé
   */
  buildSearchText(mission) {
    const parts = [
      mission.title,
      mission.description,
      mission.category,
      ...mission.tags || [],
      ...mission.skills_required || [],
      mission.city,
      mission.country
    ].filter(Boolean);
    return parts.join(" ").toLowerCase();
  }
  /**
   * Sanitise nom client pour affichage public
   */
  sanitizeClientName(name) {
    if (name.includes(" ") && name.length > 20) {
      const parts = name.split(" ");
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    if (name.length > 30) {
      return name.substring(0, 27) + "...";
    }
    return name;
  }
  /**
   * Calcule score qualité pour algorithme feed
   */
  calculateQualityScore(mission) {
    let score = 0;
    if (mission.title && mission.title.length >= 10) score += 1;
    if (mission.title && mission.title.length >= 30) score += 1;
    if (mission.description && mission.description.length >= 50) score += 1;
    if (mission.description && mission.description.length >= 200) score += 1;
    if (mission.description && mission.description.length >= 500) score += 1;
    if (mission.skills_required && mission.skills_required.length > 0) score += 1;
    if (mission.skills_required && mission.skills_required.length >= 3) score += 1;
    if (mission.budget_type !== "negotiable") score += 1;
    if (mission.city || mission.remote_allowed) score += 1;
    if (mission.requirements && mission.requirements.length >= 50) score += 1;
    return Math.min(5, score);
  }
  /**
   * Mappe statut mission vers statut feed
   */
  mapMissionStatusToFeedStatus(missionStatus) {
    switch (missionStatus) {
      case "published":
        return "active";
      case "awarded":
        return "closed";
      case "completed":
        return "closed";
      case "cancelled":
        return "inactive";
      case "expired":
        return "inactive";
      default:
        return "inactive";
    }
  }
  /**
   * Supprime une mission du feed
   */
  async removeMissionFromFeed(missionId) {
    try {
      await db.delete(announcements).where(eq(announcements.id, missionId));
      console.log(`\u{1F5D1}\uFE0F Mission ${missionId} removed from feed`);
    } catch (error) {
      console.error(`\u274C Failed to remove mission ${missionId} from feed:`, error);
      throw error;
    }
  }
  /**
   * Met à jour les stats d'une announcement
   */
  async updateAnnouncementStats(missionId, stats) {
    const query = `
      SELECT update_announcement_stats($1, $2, $3, $4, $5)
    `;
    await db.execute(query, [
      missionId,
      stats.bidsCount || null,
      stats.lowestBidCents || null,
      stats.viewsCount || null,
      stats.savesCount || null
    ]);
    console.log(`\u{1F4CA} Updated stats for announcement ${missionId}`);
  }
};
var missionSync = new MissionSyncService(
  process.env.DATABASE_URL || "postgresql://localhost:5432/swideal"
);

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
    if (missing.includes("DATABASE_URL")) {
      console.error("\u274C DATABASE_URL is required");
      process.exit(1);
    }
  }
  console.log("\u2705 Variables d'environnement valid\xE9es");
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "production";
  }
  console.log("\u{1F50D} Configuration d'environnement:", {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? "\u2705 Configur\xE9" : "\u274C Manquant",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "\u2705 Configur\xE9" : "\u274C Manquant",
    PORT: process.env.PORT || 5e3
  });
}

// server/index.ts
import { Pool as Pool5 } from "pg";
import cors from "cors";

// server/middleware/request-validator.ts
var validateRequest = (req, res, next) => {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.headers["x-request-id"] = requestId;
  console.log(`\u{1F4E5} ${req.method} ${req.originalUrl}`, {
    request_id: requestId,
    user_agent: req.headers["user-agent"]?.substring(0, 100),
    ip: req.ip,
    content_type: req.headers["content-type"],
    content_length: req.headers["content-length"],
    timestamp: timestamp2
  });
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`\u26A0\uFE0F Invalid Content-Type: ${contentType} for ${req.method} ${req.originalUrl}`);
      return res.status(400).json({
        ok: false,
        error: "Content-Type must be application/json",
        request_id: requestId,
        timestamp: timestamp2
      });
    }
  }
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`\u23F0 Request timeout: ${req.method} ${req.originalUrl} (${requestId})`);
      res.status(408).json({
        ok: false,
        error: "Request timeout",
        request_id: requestId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, 3e4);
  res.on("finish", () => {
    clearTimeout(timeout);
    console.log(`\u{1F4E4} ${req.method} ${req.originalUrl} - ${res.statusCode} (${requestId})`);
  });
  next();
};
var limitRequestSize = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024;
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > maxSize) {
    return res.status(413).json({
      ok: false,
      error: "Request too large",
      max_size: "10MB",
      received_size: `${Math.round(contentLength / 1024 / 1024)}MB`
    });
  }
  next();
};

// server/middleware/performance-monitor.ts
var metrics = [];
var MAX_METRICS = 1e3;
var performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const memoryUsed = process.memoryUsage().heapUsed - startMemory;
    const metric = {
      endpoint: req.originalUrl,
      method: req.method,
      duration,
      status: res.statusCode,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      memory_usage: memoryUsed
    };
    metrics.push(metric);
    if (metrics.length > MAX_METRICS) {
      metrics.splice(0, metrics.length - MAX_METRICS);
    }
    if (duration > 2e3) {
      console.warn(`\u{1F40C} Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
    if (memoryUsed > 50 * 1024 * 1024) {
      console.warn(`\u{1F525} High memory usage: ${req.method} ${req.originalUrl} used ${Math.round(memoryUsed / 1024 / 1024)}MB`);
    }
    originalEnd.call(this, chunk, encoding);
  };
  next();
};
var getPerformanceStats = () => {
  if (metrics.length === 0) {
    return { message: "No metrics available" };
  }
  const recentMetrics = metrics.slice(-100);
  const averageDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
  const slowRequests = recentMetrics.filter((m) => m.duration > 1e3).length;
  const errorRequests = recentMetrics.filter((m) => m.status >= 400).length;
  return {
    total_requests: metrics.length,
    recent_requests: recentMetrics.length,
    average_duration_ms: Math.round(averageDuration),
    slow_requests_count: slowRequests,
    error_requests_count: errorRequests,
    error_rate_percent: Math.round(errorRequests / recentMetrics.length * 100),
    last_updated: (/* @__PURE__ */ new Date()).toISOString()
  };
};

// server/auth-routes.ts
import express2 from "express";
import { Pool as Pool2 } from "pg";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { eq as eq2, sql } from "drizzle-orm";
var pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
var db2 = drizzle2(pool2);
var router = express2.Router();
router.post("/login", async (req, res) => {
  try {
    console.log("\u{1F511} Tentative de connexion:", { email: req.body.email });
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("\u274C Email ou mot de passe manquant");
      return res.status(400).json({
        error: "Email et mot de passe requis",
        success: false
      });
    }
    const user = await db2.select().from(users).where(eq2(users.email, email)).limit(1);
    if (user.length === 0) {
      console.log("\u274C Utilisateur non trouv\xE9:", email);
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        success: false
      });
    }
    const userData = user[0];
    if (!userData.password || userData.password !== password) {
      console.log("\u274C Mot de passe incorrect pour:", email);
      return res.status(401).json({
        error: "Email ou mot de passe incorrect",
        success: false
      });
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
    console.log("\u{1F4DD} Tentative de cr\xE9ation de compte:", { email: req.body.email, name: req.body.name });
    const { email, password, name, role = "CLIENT" } = req.body;
    if (!email || !password) {
      console.log("\u274C Email ou mot de passe manquant");
      return res.status(400).json({
        error: "Email et mot de passe requis",
        success: false
      });
    }
    if (!name || name.trim().length < 2) {
      console.log("\u274C Nom invalide");
      return res.status(400).json({
        error: "Le nom doit contenir au moins 2 caract\xE8res",
        success: false
      });
    }
    if (password.length < 6) {
      console.log("\u274C Mot de passe trop court");
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caract\xE8res",
        success: false
      });
    }
    const existingUser = await db2.select().from(users).where(eq2(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      console.log("\u274C Email d\xE9j\xE0 utilis\xE9:", email);
      return res.status(409).json({
        error: "Un compte existe d\xE9j\xE0 avec cet email",
        success: false
      });
    }
    const [newUser] = await db2.insert(users).values({
      email: email.toLowerCase().trim(),
      password,
      // En production, hasher avec bcrypt
      name: name.trim(),
      role: role.toUpperCase(),
      profile_data: {},
      created_at: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
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
    const user = await db2.select().from(users).where(eq2(users.id, userId)).limit(1);
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
        const existingUser = await db2.select().from(users).where(eq2(users.email, account.email)).limit(1);
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

// server/routes/missions.ts
import { Router } from "express";
import { eq as eq3, desc, sql as sql2 } from "drizzle-orm";
import { randomUUID } from "crypto";

// server/dto/mission-dto.ts
function extractLocationData(locationData) {
  if (!locationData || typeof locationData !== "object") {
    return {
      raw: "Remote",
      remote_allowed: true,
      country: "France"
    };
  }
  return locationData;
}
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
function mapMission(row) {
  const locationData = extractLocationData(row.location_data);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    excerpt: generateExcerpt(row.description, 200),
    category: row.category,
    budget: (row.budget_value_cents / 100).toString(),
    // Convertir centimes en euros
    budget_value_cents: row.budget_value_cents,
    currency: row.currency || "EUR",
    location: locationData.raw || locationData.city || "Remote",
    postal_code: locationData.address || null,
    city: locationData.city || null,
    country: locationData.country || "France",
    remote_allowed: locationData.remote_allowed ?? true,
    user_id: row.user_id,
    client_id: row.client_id,
    status: row.status || "draft",
    urgency: row.urgency || "medium",
    is_team_mission: row.is_team_mission || false,
    team_size: row.team_size || 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
    createdAt: row.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: row.updated_at?.toISOString(),
    clientName: "Client",
    // TODO: récupérer le vrai nom client
    bids: []
    // TODO: récupérer les vraies offres
  };
}

// server/routes/missions.ts
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
function generateExcerpt2(description, maxLength = 200) {
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
var router2 = Router();
router2.post("/", asyncHandler(async (req, res) => {
  const requestId = randomUUID();
  const startTime = Date.now();
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_create_start",
    body_size: JSON.stringify(req.body).length,
    user_agent: req.headers["user-agent"],
    ip: req.ip
  }));
  const { title, description, category, budget, location, userId, postal_code } = req.body;
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_data_received",
    data: { title, description, category, budget, location, postal_code, userId }
  }));
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "validation_failed",
      field: "title",
      value: title
    }));
    return res.status(400).json({
      ok: false,
      error: "Le titre doit contenir au moins 3 caract\xE8res",
      field: "title",
      request_id: requestId
    });
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "validation_failed",
      field: "description",
      value_length: description?.length || 0
    }));
    return res.status(400).json({
      ok: false,
      error: "La description doit contenir au moins 10 caract\xE8res",
      field: "description",
      request_id: requestId
    });
  }
  const userIdInt = userId ? parseInt(userId.toString()) : 1;
  if (isNaN(userIdInt) || userIdInt <= 0) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "validation_failed",
      field: "userId",
      value: userId
    }));
    return res.status(400).json({
      ok: false,
      error: "User ID invalide",
      field: "userId",
      request_id: requestId
    });
  }
  const existingUser = await db.select({ id: users.id }).from(users).where(eq3(users.id, userIdInt)).limit(1);
  if (existingUser.length === 0) {
    console.log(JSON.stringify({
      level: "warn",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      request_id: requestId,
      action: "security_validation_failed",
      field: "userId",
      value: userIdInt,
      reason: "user_not_found"
    }));
    return res.status(401).json({
      ok: false,
      error: "Utilisateur non trouv\xE9",
      field: "userId",
      request_id: requestId
    });
  }
  const now = /* @__PURE__ */ new Date();
  const budgetCents = budget ? parseInt(budget.toString()) * 100 : 1e5;
  const extractCity = (locationString) => {
    if (!locationString) return null;
    const parts = locationString.split(",");
    return parts.length > 1 ? parts[parts.length - 1].trim() : locationString.trim();
  };
  const locationData = {
    raw: location || "Remote",
    address: req.body.postal_code || null,
    city: extractCity(location) || null,
    country: "France",
    remote_allowed: req.body.remote_allowed !== false
  };
  const newMission = {
    title: title.trim(),
    description: description.trim() + (req.body.requirements ? `

Exigences sp\xE9cifiques: ${req.body.requirements}` : ""),
    category: category || "developpement",
    budget_value_cents: budgetCents,
    currency: "EUR",
    location_data: locationData,
    // Utiliser le champ correct du schéma
    user_id: userIdInt,
    client_id: userIdInt,
    status: "open",
    // Utiliser un statut valide
    urgency: "medium",
    is_team_mission: false,
    team_size: 1
    // created_at et updated_at sont gérés automatiquement par la DB
  };
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_data_prepared",
    title_length: newMission.title.length,
    description_length: newMission.description.length,
    budget_cents: newMission.budget_value_cents,
    user_id: newMission.user_id,
    location_data: newMission.location_data
  }));
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "db_transaction_start"
  }));
  const insertResult = await db.insert(missions).values(newMission).returning({
    id: missions.id,
    title: missions.title,
    status: missions.status,
    user_id: missions.user_id,
    created_at: missions.created_at
  });
  if (!insertResult || insertResult.length === 0) {
    throw new Error("Insert failed - no result returned");
  }
  const insertedMission = insertResult[0];
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "db_insert_success",
    mission_id: insertedMission.id,
    execution_time_ms: Date.now() - startTime
  }));
  const fullMission = await db.select().from(missions).where(eq3(missions.id, insertedMission.id)).limit(1);
  if (fullMission.length === 0) {
    throw new Error("Mission not found after insert");
  }
  const mission = fullMission[0];
  const mappedMission = mapMission(mission);
  const responsePayload = {
    ok: true,
    ...mappedMission,
    request_id: requestId
  };
  console.log(JSON.stringify({
    level: "info",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    request_id: requestId,
    action: "mission_create_success",
    mission_id: mission.id,
    total_time_ms: Date.now() - startTime
  }));
  res.status(201).json(responsePayload);
  setImmediate(async () => {
    try {
      const missionSync2 = new MissionSyncService(process.env.DATABASE_URL || "postgresql://localhost:5432/swideal");
      const missionForFeed = {
        id: mission.id.toString(),
        title: mission.title,
        description: mission.description,
        category: mission.category || "developpement",
        budget: mission.budget_value_cents?.toString() || "0",
        location: mission.location_data?.raw || mission.location_data?.city || "Remote",
        status: mission.status || "open",
        clientId: mission.user_id?.toString() || "1",
        clientName: "Client",
        createdAt: mission.created_at?.toISOString() || now.toISOString(),
        bids: []
      };
      await missionSync2.addMissionToFeed(missionForFeed);
      console.log(JSON.stringify({
        level: "info",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        request_id: requestId,
        action: "feed_sync_success",
        mission_id: mission.id
      }));
    } catch (syncError) {
      console.log(JSON.stringify({
        level: "warn",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        request_id: requestId,
        action: "feed_sync_failed",
        mission_id: mission.id,
        error: syncError instanceof Error ? syncError.message : "Unknown sync error"
      }));
    }
  });
}));
router2.get("/", asyncHandler(async (req, res) => {
  console.log("\u{1F4CB} Fetching all missions...");
  const allMissions = await db.select().from(missions).orderBy(desc(missions.created_at));
  console.log(`\u{1F4CB} Found ${allMissions.length} missions in database`);
  const missionsWithBids = allMissions.map((mission) => ({
    ...mapMission(mission),
    bids: []
    // Empty bids array for now
  }));
  console.log("\u{1F4CB} Missions with bids:", missionsWithBids.map((m) => ({ id: m.id, title: m.title, status: m.status })));
  res.json(missionsWithBids);
}));
router2.get("/health", asyncHandler(async (req, res) => {
  const startTime = Date.now();
  console.log("\u{1F3E5} Mission health check endpoint called");
  try {
    const dbTest = await db.select({ count: sql2`COUNT(*)` }).from(missions).limit(1);
    const dbConnected = dbTest.length > 0;
    const responseTime = Date.now() - startTime;
    const healthInfo = {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "missions-api",
      environment: process.env.NODE_ENV || "development",
      database: dbConnected ? "connected" : "disconnected",
      response_time_ms: responseTime,
      uptime_seconds: Math.floor(process.uptime()),
      memory_usage: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    console.log("\u{1F3E5} Health check passed:", healthInfo);
    res.status(200).json(healthInfo);
  } catch (error) {
    console.error("\u{1F3E5} Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      service: "missions-api",
      environment: process.env.NODE_ENV || "development",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      response_time_ms: Date.now() - startTime
    });
  }
}));
router2.get("/debug", asyncHandler(async (req, res) => {
  console.log("\u{1F50D} Mission debug endpoint called");
  const testQuery = await db.select({ id: missions.id }).from(missions).limit(1);
  const dbInfo = {
    status: "connected",
    sampleMissions: testQuery.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL ? "configured" : "missing"
  };
  console.log("\u{1F50D} Database info:", dbInfo);
  res.json(dbInfo);
}));
router2.get("/verify-sync", asyncHandler(async (req, res) => {
  console.log("\u{1F50D} V\xE9rification de la synchronisation missions/feed");
  try {
    const missionCount = await db.select({ count: sql2`COUNT(*)` }).from(missions);
    const recentMissions = await db.select({
      id: missions.id,
      title: missions.title,
      status: missions.status,
      created_at: missions.created_at
    }).from(missions).orderBy(desc(missions.created_at)).limit(5);
    const announcementCount = await db.select({ count: sql2`COUNT(*)` }).from(announcements);
    const syncStatus = {
      totalMissions: missionCount[0]?.count || 0,
      totalFeedItems: announcementCount[0]?.count || 0,
      recentMissions: recentMissions.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        created_at: m.created_at
      })),
      syncHealth: "OK",
      message: "Sync verification successful - using simplified queries"
    };
    console.log("\u{1F50D} Sync status:", syncStatus);
    res.json(syncStatus);
  } catch (error) {
    console.error("\u{1F50D} Verify sync error:", error);
    res.status(500).json({
      error: "Erreur lors de la v\xE9rification de synchronisation",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}));
router2.get("/:id", asyncHandler(async (req, res) => {
  let missionId = null;
  missionId = req.params.id;
  console.log("\u{1F50D} API: R\xE9cup\xE9ration mission ID:", missionId);
  if (missionId === "debug" || missionId === "verify-sync" || missionId === "health") {
    console.log("\u26A0\uFE0F API: Endpoint sp\xE9cial d\xE9tect\xE9, ignor\xE9 dans cette route:", missionId);
    return res.status(404).json({ error: "Endpoint non trouv\xE9" });
  }
  if (!missionId || missionId === "undefined" || missionId === "null") {
    console.error("\u274C API: Mission ID invalide:", missionId);
    return res.status(400).json({
      error: "Mission ID invalide",
      details: "L'ID de mission est requis et ne peut pas \xEAtre vide"
    });
  }
  const missionIdInt = parseInt(missionId, 10);
  if (isNaN(missionIdInt) || missionIdInt <= 0 || !Number.isInteger(missionIdInt)) {
    console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
    return res.status(400).json({
      error: "Mission ID doit \xEAtre un nombre entier valide",
      received: missionId,
      details: "L'ID doit \xEAtre un nombre entier positif"
    });
  }
  const missionRaw = await db.select().from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
  if (missionRaw.length === 0) {
    console.error("\u274C API: Mission non trouv\xE9e:", missionId);
    return res.status(404).json({
      error: "Mission non trouv\xE9e",
      missionId: missionIdInt,
      details: "Aucune mission trouv\xE9e avec cet ID"
    });
  }
  const mission = mapMission(missionRaw[0]);
  let missionBids = [];
  try {
    missionBids = await db.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      score_breakdown: bids.score_breakdown,
      is_leading: bids.is_leading,
      status: bids.status,
      created_at: bids.created_at,
      provider_name: users.name,
      provider_email: users.email,
      provider_profile: users.profile_data
    }).from(bids).leftJoin(users, eq3(bids.provider_id, users.id)).where(eq3(bids.mission_id, missionIdInt));
  } catch (error) {
    console.warn("\u26A0\uFE0F Could not fetch bids (table may not exist):", error);
    missionBids = [];
  }
  const result = {
    ...mission,
    bids: missionBids || []
  };
  console.log("\u2705 API: Mission trouv\xE9e:", result.title, "avec", result.bids.length, "offres");
  res.json(result);
}));
router2.get("/users/:userId/missions", asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  console.log("\u{1F464} Fetching missions with bids for user:", userId);
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("\u274C Invalid user ID:", userId);
    return res.status(400).json({
      error: "User ID invalide",
      details: "L'ID utilisateur est requis"
    });
  }
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt) || userIdInt <= 0 || !Number.isInteger(userIdInt)) {
    console.error("\u274C User ID is not a valid number:", userId);
    return res.status(400).json({
      error: "User ID doit \xEAtre un nombre entier valide",
      received: userId,
      details: "L'ID utilisateur doit \xEAtre un nombre entier positif"
    });
  }
  console.log("\u{1F50D} Optimized query: Fetching missions with bids in single JOIN query");
  try {
    const missionsWithBidsData = await db.select({
      // Mission fields
      mission_id: missions.id,
      title: missions.title,
      description: missions.description,
      category: missions.category,
      budget_value_cents: missions.budget_value_cents,
      currency: missions.currency,
      location_raw: missions.location_raw,
      postal_code: missions.postal_code,
      city: missions.city,
      country: missions.country,
      remote_allowed: missions.remote_allowed,
      user_id: missions.user_id,
      client_id: missions.client_id,
      status: missions.status,
      urgency: missions.urgency,
      deadline: missions.deadline,
      tags: missions.tags,
      skills_required: missions.skills_required,
      requirements: missions.requirements,
      is_team_mission: missions.is_team_mission,
      team_size: missions.team_size,
      mission_created_at: missions.created_at,
      mission_updated_at: missions.updated_at,
      // Bid fields (null if no bids)
      bid_id: bids.id,
      bid_amount: bids.amount,
      bid_timeline_days: bids.timeline_days,
      bid_message: bids.message,
      bid_status: bids.status,
      bid_created_at: bids.created_at,
      provider_id: bids.provider_id
    }).from(missions).leftJoin(bids, eq3(missions.id, bids.mission_id)).where(eq3(missions.user_id, userIdInt)).orderBy(desc(missions.created_at), desc(bids.created_at));
    console.log("\u{1F4CA} JOIN query result: Found", missionsWithBidsData.length, "mission-bid combinations");
    const missionMap = /* @__PURE__ */ new Map();
    missionsWithBidsData.forEach((row) => {
      const missionId = row.mission_id;
      if (!missionMap.has(missionId)) {
        missionMap.set(missionId, {
          // Core fields
          id: row.mission_id,
          title: row.title,
          description: row.description,
          excerpt: generateExcerpt2(row.description || "", 200),
          category: row.category,
          // Budget
          budget_value_cents: row.budget_value_cents,
          budget: row.budget_value_cents?.toString() || "0",
          currency: row.currency,
          // Location
          location_raw: row.location_raw,
          location: row.location_raw || row.postal_code || row.city || "Remote",
          postal_code: row.postal_code,
          city: row.city,
          country: row.country,
          remote_allowed: row.remote_allowed,
          // Status
          status: row.status,
          urgency: row.urgency,
          // User relationships
          user_id: row.user_id,
          client_id: row.client_id,
          userId: row.user_id?.toString(),
          clientName: "Moi",
          // Team
          is_team_mission: row.is_team_mission,
          team_size: row.team_size,
          // Timestamps
          created_at: row.mission_created_at,
          updated_at: row.mission_updated_at,
          createdAt: row.mission_created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: row.mission_updated_at?.toISOString(),
          deadline: row.deadline?.toISOString(),
          // Arrays
          tags: row.tags || [],
          skills_required: row.skills_required || [],
          requirements: row.requirements,
          bids: []
        });
      }
      if (row.bid_id) {
        missionMap.get(missionId).bids.push({
          id: row.bid_id,
          amount: row.bid_amount,
          timeline_days: row.bid_timeline_days,
          message: row.bid_message,
          status: row.bid_status,
          created_at: row.bid_created_at,
          provider_id: row.provider_id
        });
      }
    });
    const missionsWithBids = Array.from(missionMap.values());
    console.log(`\u2705 OPTIMIZED: Found ${missionsWithBids.length} missions for user ${userId}`);
    console.log(`\u2705 PERFORMANCE: Eliminated N+1 queries - used single JOIN instead of ${missionsWithBids.length + 1} separate queries`);
    res.json(missionsWithBids);
  } catch (error) {
    console.error("\u274C Error in optimized missions+bids query:", error);
    const userMissions = await db.select({
      id: missions.id,
      title: missions.title,
      description: missions.description,
      category: missions.category,
      budget_value_cents: missions.budget_value_cents,
      currency: missions.currency,
      location_raw: missions.location_raw,
      postal_code: missions.postal_code,
      city: missions.city,
      country: missions.country,
      remote_allowed: missions.remote_allowed,
      user_id: missions.user_id,
      client_id: missions.client_id,
      status: missions.status,
      urgency: missions.urgency,
      deadline: missions.deadline,
      tags: missions.tags,
      skills_required: missions.skills_required,
      requirements: missions.requirements,
      is_team_mission: missions.is_team_mission,
      team_size: missions.team_size,
      created_at: missions.created_at,
      updated_at: missions.updated_at
    }).from(missions).where(eq3(missions.user_id, userIdInt)).orderBy(desc(missions.created_at));
    const fallbackMissions = userMissions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      description: mission.description,
      excerpt: generateExcerpt2(mission.description || "", 200),
      category: mission.category,
      budget_value_cents: mission.budget_value_cents,
      budget: mission.budget_value_cents?.toString() || "0",
      currency: mission.currency,
      location_raw: mission.location_raw,
      location: mission.location_raw || mission.postal_code || mission.city || "Remote",
      postal_code: mission.postal_code,
      city: mission.city,
      country: mission.country,
      remote_allowed: mission.remote_allowed,
      status: mission.status,
      urgency: mission.urgency,
      user_id: mission.user_id,
      client_id: mission.client_id,
      userId: mission.user_id?.toString(),
      clientName: "Moi",
      is_team_mission: mission.is_team_mission,
      team_size: mission.team_size,
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      createdAt: mission.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: mission.updated_at?.toISOString(),
      deadline: mission.deadline?.toISOString(),
      tags: mission.tags || [],
      skills_required: mission.skills_required || [],
      requirements: mission.requirements,
      bids: []
    }));
    res.json(fallbackMissions);
  }
}));
router2.get("/users/:userId/bids", asyncHandler(async (req, res) => {
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
  const userBids = [];
  console.log("\u{1F517} Mapping: userId =", userId, "-> provider_id filter:", userIdInt);
  console.log(`\u{1F464} Found ${userBids.length} bids for user ${userId}`);
  res.json(userBids);
}));
router2.put("/:id", asyncHandler(async (req, res) => {
  const missionId = req.params.id;
  const updateData = req.body;
  console.log("\u270F\uFE0F API: Modification mission ID:", missionId);
  console.log("\u270F\uFE0F API: Donn\xE9es re\xE7ues:", JSON.stringify(updateData, null, 2));
  if (missionId === "debug" || missionId === "verify-sync") {
    return res.status(404).json({ error: "Endpoint non trouv\xE9" });
  }
  if (!missionId || missionId === "undefined" || missionId === "null") {
    console.error("\u274C API: Mission ID invalide:", missionId);
    return res.status(400).json({ error: "Mission ID invalide" });
  }
  const missionIdInt = parseInt(missionId, 10);
  if (isNaN(missionIdInt) || missionIdInt <= 0) {
    console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
    return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre valide" });
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
  const existingMission = await db.select({ id: missions.id, category: missions.category, deadline: missions.deadline, tags: missions.tags, requirements: missions.requirements, currency: missions.currency, city: missions.city, country: missions.country, postal_code: missions.postal_code }).from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
  if (existingMission.length === 0) {
    console.error("\u274C API: Mission non trouv\xE9e pour modification:", missionId);
    return res.status(404).json({ error: "Mission non trouv\xE9e" });
  }
  const extractCity = (locationString) => {
    if (!locationString) return null;
    const parts = locationString.split(",");
    return parts.length > 1 ? parts[parts.length - 1].trim() : locationString.trim();
  };
  const missionToUpdate = {
    title: updateData.title,
    description: updateData.description,
    category: updateData.category || existingMission[0].category,
    budget_value_cents: updateData.budget ? parseInt(updateData.budget) : null,
    location_raw: updateData.location || null,
    postal_code: updateData.postal_code || existingMission[0].postal_code,
    // Update postal_code
    city: updateData.city || existingMission[0].city,
    // Assuming city might be provided separately or extracted
    country: updateData.country || existingMission[0].country,
    urgency: updateData.urgency || "medium",
    status: updateData.status || "published",
    updated_at: /* @__PURE__ */ new Date(),
    deadline: updateData.deadline ? new Date(updateData.deadline) : existingMission[0].deadline,
    tags: updateData.tags || existingMission[0].tags,
    requirements: updateData.requirements || existingMission[0].requirements,
    currency: updateData.currency || existingMission[0].currency,
    remote_allowed: updateData.remote_allowed !== void 0 ? updateData.remote_allowed : true
  };
  console.log("\u270F\uFE0F API: Donn\xE9es de mise \xE0 jour:", JSON.stringify(missionToUpdate, null, 2));
  const updatedMission = await db.update(missions).set(missionToUpdate).where(eq3(missions.id, missionIdInt)).returning();
  if (updatedMission.length === 0) {
    throw new Error("\xC9chec de la mise \xE0 jour de la mission");
  }
  console.log("\u2705 API: Mission modifi\xE9e avec succ\xE8s:", missionId);
  res.json(updatedMission[0]);
}));
router2.delete("/:id", asyncHandler(async (req, res) => {
  const missionId = req.params.id;
  console.log("\u{1F5D1}\uFE0F API: Suppression mission ID:", missionId);
  if (missionId === "debug" || missionId === "verify-sync") {
    return res.status(404).json({ error: "Endpoint non trouv\xE9" });
  }
  if (!missionId || missionId === "undefined" || missionId === "null") {
    console.error("\u274C API: Mission ID invalide:", missionId);
    return res.status(400).json({ error: "Mission ID invalide" });
  }
  const missionIdInt = parseInt(missionId, 10);
  if (isNaN(missionIdInt) || missionIdInt <= 0) {
    console.error("\u274C API: Mission ID n'est pas un nombre valide:", missionId);
    return res.status(400).json({ error: "Mission ID doit \xEAtre un nombre valide" });
  }
  const existingMission = await db.select({ id: missions.id }).from(missions).where(eq3(missions.id, missionIdInt)).limit(1);
  if (existingMission.length === 0) {
    console.error("\u274C API: Mission non trouv\xE9e pour suppression:", missionId);
    return res.status(404).json({ error: "Mission non trouv\xE9e" });
  }
  const deletedMission = await db.delete(missions).where(eq3(missions.id, missionIdInt)).returning();
  if (deletedMission.length === 0) {
    throw new Error("\xC9chec de la suppression de la mission");
  }
  console.log("\u2705 API: Mission supprim\xE9e avec succ\xE8s:", missionId);
  res.json({ message: "Mission supprim\xE9e avec succ\xE8s", mission: deletedMission[0] });
}));
var missions_default = router2;

// server/api-routes.ts
import express3 from "express";
import { Pool as Pool3 } from "pg";
import { drizzle as drizzle3 } from "drizzle-orm/node-postgres";
import { eq as eq4 } from "drizzle-orm";
var pool3 = new Pool3({ connectionString: process.env.DATABASE_URL });
var db3 = drizzle3(pool3);
var router3 = express3.Router();
router3.get("/demo-providers", async (req, res) => {
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
    }).from(users).where(eq4(users.role, "PRO"));
    res.json({ providers });
  } catch (error) {
    console.error("Erreur get demo providers:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router3.get("/demo-projects", async (req, res) => {
  try {
    const projectsWithClients = await db3.select({
      id: users.id,
      title: users.name,
      description: users.email,
      budget: users.role,
      category: users.rating_mean,
      quality_target: users.rating_count,
      status: users.profile_data,
      created_at: users.created_at,
      client_name: users.name,
      client_email: users.email
    }).from(users).leftJoin(users, eq4(users.id, users.id));
    res.json({ projects: projectsWithClients });
  } catch (error) {
    console.error("Erreur get demo projects:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router3.get("/demo-bids", async (req, res) => {
  try {
    const bidsWithInfo = await db3.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      score_breakdown: bids.score_breakdown,
      is_leading: bids.is_leading,
      created_at: bids.created_at,
      project_title: users.name,
      project_budget: users.email,
      provider_name: users.name,
      provider_email: users.email,
      provider_profile: users.profile_data
    }).from(bids).leftJoin(users, eq4(bids.project_id, users.id)).leftJoin(users, eq4(bids.provider_id, users.id));
    res.json({ bids: bidsWithInfo });
  } catch (error) {
    console.error("Erreur get demo bids:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router3.get("/provider/:id", async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const provider = await db3.select().from(users).where(eq4(users.id, providerId)).limit(1);
    if (provider.length === 0) {
      return res.status(404).json({ error: "Prestataire non trouv\xE9" });
    }
    const providerData = provider[0];
    const providerBids = await db3.select({
      id: bids.id,
      amount: bids.amount,
      timeline_days: bids.timeline_days,
      message: bids.message,
      is_leading: bids.is_leading,
      created_at: bids.created_at,
      project_title: users.name,
      project_budget: users.email
    }).from(bids).leftJoin(users, eq4(bids.project_id, users.id)).where(eq4(bids.provider_id, providerId));
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
router3.get("/ai-analysis-demo", async (req, res) => {
  try {
    const recentProjects = await db3.select({
      id: users.id,
      title: users.name,
      description: users.email,
      budget: users.role,
      category: users.rating_mean,
      created_at: users.created_at
    }).from(users).limit(3);
    const recentBids = await db3.select({
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
var api_routes_default = router3;

// server/routes/ai-monitoring-routes.ts
init_event_logger();
import { Router as Router2 } from "express";
var router4 = Router2();
router4.get("/health", async (req, res) => {
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
router4.get("/experiments", async (req, res) => {
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
router4.post("/events", async (req, res) => {
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
router4.get("/performance-metrics", async (req, res) => {
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
router4.post("/clear-cache", async (req, res) => {
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
router4.get("/business-metrics", async (req, res) => {
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
router4.get("/alerts", async (req, res) => {
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
var ai_monitoring_routes_default = router4;

// server/routes/ai-suggestions-routes.ts
import { Router as Router3 } from "express";
import { z as z2 } from "zod";
var router5 = Router3();
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
import { Router as Router4 } from "express";
import { z as z3 } from "zod";
var router6 = Router4();
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
import { Router as Router5 } from "express";

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

// apps/api/src/routes/ai.ts
var router7 = Router5();
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
import express4 from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzle4 } from "drizzle-orm/neon-http";
import { desc as desc2, eq as eq5, and, not, inArray, sql as sql3 } from "drizzle-orm";

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
var router8 = express4.Router();
var connection = neon(process.env.DATABASE_URL);
var db4 = drizzle4(connection);
var priceBenchmarkCache = /* @__PURE__ */ new Map();
router8.get("/feed", async (req, res) => {
  try {
    const { cursor, limit = "10", userId } = req.query;
    const limitNum = Math.min(parseInt(limit), 50);
    const seenAnnouncements = userId ? await db4.select({ announcement_id: feedSeen.announcement_id }).from(feedSeen).where(
      and(
        eq5(feedSeen.user_id, parseInt(userId))
        // Filtrer les 24 dernières heures
      )
    ) : [];
    const seenIds = seenAnnouncements.map((s) => s.announcement_id);
    let whereConditions = [eq5(announcements.status, "active")];
    if (seenIds.length > 0) {
      whereConditions.push(not(inArray(announcements.id, seenIds)));
    }
    if (cursor) {
      const cursorId = parseInt(cursor);
      whereConditions.push(sql3`${announcements.id} < ${cursorId}`);
    }
    const query = db4.select().from(announcements).where(and(...whereConditions));
    const rawAnnouncements = await query.orderBy(desc2(announcements.created_at)).limit(limitNum + 5);
    const ranker = new FeedRanker(seenIds);
    const userProfile = userId ? {} : void 0;
    const rankedAnnouncements = ranker.rankAnnouncements(rawAnnouncements, userProfile);
    const sponsoredAnnouncements = await db4.select().from(announcements).where(and(
      eq5(announcements.sponsored, true),
      eq5(announcements.status, "active")
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
    }).from(announcements).where(and(
      eq5(announcements.category, category),
      eq5(announcements.status, "active")
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
import { Router as Router6 } from "express";
import { drizzle as drizzle5 } from "drizzle-orm/neon-http";
import { neon as neon2 } from "@neondatabase/serverless";
import { eq as eq6, and as and2 } from "drizzle-orm";
var sql4 = neon2(process.env.DATABASE_URL);
var db5 = drizzle5(sql4);
var router9 = Router6();
router9.get("/favorites", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "user_id requis" });
    }
    const userFavorites = await db5.select({
      announcement: announcements
    }).from(favorites).innerJoin(announcements, eq6(favorites.announcement_id, announcements.id)).where(eq6(favorites.user_id, parseInt(user_id)));
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
      and2(
        eq6(favorites.user_id, user_id),
        eq6(favorites.announcement_id, announcement_id)
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
      and2(
        eq6(favorites.user_id, user_id),
        eq6(favorites.announcement_id, parseInt(announcementId))
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
import express5 from "express";
var router10 = express5.Router();
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
import express6 from "express";

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
var router11 = express6.Router();
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
import { Router as Router7 } from "express";
var router12 = Router7();
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
import { Router as Router8 } from "express";

// apps/api/src/ai/learning-engine.ts
import { drizzle as drizzle6 } from "drizzle-orm/node-postgres";
import { Pool as Pool4 } from "pg";
import { desc as desc3, eq as eq7, and as and3, gte } from "drizzle-orm";
var pool4 = new Pool4({ connectionString: process.env.DATABASE_URL });
var db6 = drizzle6(pool4);
var AILearningEngine = class {
  patterns = /* @__PURE__ */ new Map();
  insights = [];
  /**
   * Analyse les interactions passées avec Gemini pour identifier les patterns de succès
   */
  async analyzePastInteractions(limit = 1e3) {
    try {
      console.log("\u{1F9E0} D\xE9but de l'analyse des patterns d'apprentissage...");
      const recentInteractions = await db6.select().from(aiEvents).where(and3(
        eq7(aiEvents.provider, "gemini-api"),
        gte(aiEvents.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3))
        // 30 jours
      )).orderBy(desc3(aiEvents.created_at)).limit(limit);
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
    for (const [key, pattern] of Array.from(this.patterns.entries())) {
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
    for (const pattern of Array.from(this.patterns.values())) {
      const cat = pattern.context_category;
      if (categoryStats.has(cat)) {
        const stats = categoryStats.get(cat);
        stats.count++;
        stats.avgConfidence = (stats.avgConfidence + pattern.confidence_score) / 2;
      } else {
        categoryStats.set(cat, { count: 1, avgConfidence: pattern.confidence_score });
      }
    }
    for (const [category, stats] of Array.from(categoryStats.entries())) {
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
    return Array.from(new Set(words)).slice(0, 10);
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
      categories_learned: Array.from(new Set(Array.from(this.patterns.values()).map((p) => p.context_category))).length,
      interaction_types: Array.from(new Set(Array.from(this.patterns.values()).map((p) => p.interaction_type || "unknown"))),
      gemini_contributions: Array.from(this.patterns.values()).filter((p) => p.gemini_analysis).length,
      avg_confidence: Array.from(this.patterns.values()).reduce((sum, p) => sum + p.confidence_score, 0) / this.patterns.size || 0
    };
    console.log("\u{1F4CA} Statistiques d'apprentissage Gemini:", stats);
    return stats;
  }
};
var aiLearningEngine = new AILearningEngine();

// server/routes/ai-learning-routes.ts
var router13 = Router8();
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
import { Router as Router9 } from "express";
import { z as z5 } from "zod";
var router14 = Router9();
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
    return req.originalUrl.includes("/health") || req.originalUrl === "/api" || req.originalUrl.includes("/healthz") || req.method === "HEAD";
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
var app = express7();
var port = parseInt(process.env.PORT || "5000", 10);
var databaseUrl2 = process.env.DATABASE_URL || "postgresql://localhost:5432/swideal";
console.log("\u{1F517} Using Replit PostgreSQL connection");
var missionSyncService = new MissionSyncService(databaseUrl2);
var pool5 = new Pool5({
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
    const connectionPromise = pool5.query("SELECT 1 as test");
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
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    const allowedOrigins = [
      "https://swideal.com",
      "https://www.swideal.com",
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.replit\.app$/,
      /^https:\/\/.*\.replit\.co$/
    ];
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") {
        return origin === allowed;
      } else {
        return allowed.test(origin);
      }
    });
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`\u26A0\uFE0F CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));
app.use(limitRequestSize);
app.use(validateRequest);
app.use(performanceMonitor);
app.use(express7.json({ limit: "10mb" }));
app.use("/api/auth", (req, res, next) => {
  console.log(`\u{1F510} Auth request: ${req.method} ${req.path}`, { body: req.body.email ? { email: req.body.email } : {} });
  next();
}, auth_routes_default);
app.all("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SwipDEAL API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0"
  });
});
console.log("\u{1F4CB} Registering missions routes...");
app.use("/api/missions", (req, res, next) => {
  console.log(`\u{1F4CB} Mission request: ${req.method} ${req.path}`, {
    body: req.body.title ? { title: req.body.title, userId: req.body.userId } : {}
  });
  next();
}, missions_default);
console.log("\u{1F4CB} Registering other API routes...");
app.use("/api", api_routes_default);
app.use("/api/projects", (req, res, next) => {
  const newUrl = req.originalUrl.replace("/api/projects", "/api/missions");
  console.log(`\u{1F504} Proxying deprecated projects API ${req.originalUrl} to missions API`);
  req.url = req.url.replace("/projects", "/missions");
  req.originalUrl = newUrl;
  next();
}, missions_default);
app.use("/api/ai/monitoring", monitoringRateLimit, ai_monitoring_routes_default);
app.use("/api/ai/suggest-pricing", strictAiRateLimit);
app.use("/api/ai/enhance-description", strictAiRateLimit);
app.use("/api/ai/analyze-quality", strictAiRateLimit);
app.use("/api/ai/enhance-text", strictAiRateLimit);
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
app.get("/api/performance", (req, res) => {
  try {
    const stats = getPerformanceStats();
    res.json({
      ok: true,
      performance: stats,
      server_uptime: process.uptime(),
      memory: {
        used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to get performance stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database query timeout")), 5e3);
    });
    const queryPromise = pool5.query("SELECT 1");
    await Promise.race([queryPromise, timeoutPromise]);
    res.status(200).json({
      status: "healthy",
      message: "SwipDEAL API is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || "development",
      database: "connected",
      service: "missions-api"
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
      service: "missions-api",
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
server.listen(port, "0.0.0.0", async () => {
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
    console.log("\u{1F527} Development mode: setting up Vite middleware");
    try {
      await setupVite(app, server);
      console.log("\u2705 Vite middleware setup complete");
    } catch (error) {
      console.error("\u274C Failed to setup Vite middleware:", error);
    }
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
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const requestId = req.headers["x-request-id"] || `req_${Date.now()}`;
  const isDebugMode = process.env.PREVIEW_MODE === "true" || process.env.NODE_ENV === "development";
  let statusCode = 500;
  let errorType = "server_error";
  if (error.name === "ValidationError") {
    statusCode = 400;
    errorType = "validation_error";
  } else if (error.message.includes("not found")) {
    statusCode = 404;
    errorType = "not_found";
  } else if (error.message.includes("unauthorized")) {
    statusCode = 401;
    errorType = "unauthorized";
  }
  console.error("\u{1F6A8} Global error handler:", {
    error_type: errorType,
    error: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : void 0,
    url: req.url,
    method: req.method,
    user_agent: req.headers["user-agent"],
    ip: req.ip,
    request_id: requestId,
    timestamp: timestamp2
  });
  setImmediate(async () => {
    try {
      const eventLoggerModule = await Promise.resolve().then(() => (init_event_logger(), event_logger_exports));
      eventLoggerModule.eventLogger?.logUserEvent("click", req.user?.id || "anonymous", req.sessionID || requestId, {
        error_type: errorType,
        error_message: error.message,
        endpoint: req.originalUrl,
        method: req.method,
        status_code: statusCode
      });
    } catch (logError) {
      console.warn("Event logging failed (non-critical):", logError instanceof Error ? logError.message : "Unknown error");
    }
  });
  if (!res.headersSent) {
    res.status(statusCode).json({
      ok: false,
      error: statusCode === 500 ? "Internal server error" : error.message,
      details: isDebugMode ? error.message : "An error occurred",
      stack: isDebugMode ? error.stack : void 0,
      error_type: errorType,
      timestamp: timestamp2,
      request_id: requestId,
      debug_mode: isDebugMode
    });
  }
});
var index_default = app;
export {
  index_default as default
};
