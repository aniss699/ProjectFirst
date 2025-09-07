
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci --include=dev

# Copy source code
COPY client/ ./client/
COPY shared/ ./shared/
COPY server/ ./server/
COPY apps/ ./apps/
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Build frontend and API
RUN npm run build

# Production stage  
FROM node:20-alpine
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/ 2>/dev/null || true

# Install production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Install Prisma
COPY prisma ./prisma/
RUN npx prisma generate

# Copy migration script
COPY --from=builder /app/prisma/migrate.js ./prisma/

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
