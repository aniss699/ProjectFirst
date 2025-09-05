
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY client/package*.json ./client/ 2>/dev/null || true
COPY server/package*.json ./server/ 2>/dev/null || true

# Installer toutes les dépendances
RUN npm ci --include=dev

# Copier le code source nécessaire
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/ 2>/dev/null || true
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Build du frontend avec Vite
RUN npm run build

# Bundle du serveur avec esbuild
RUN npm run build

# Stage de production
FROM node:20-alpine
WORKDIR /app

# Installer curl pour le healthcheck
RUN apk add --no-cache curl

# Copier seulement les fichiers nécessaires pour la production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Installer seulement les dépendances de production pour le serveur
RUN npm ci --omit=dev --ignore-scripts

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=8080

# Exposer le port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Démarrer l'application
CMD ["node", "dist/index.js"]
