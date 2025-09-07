
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ curl

# Copy dependency files
COPY package*.json ./
RUN npm ci --include=dev --no-audit --no-fund

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

# Install runtime dependencies
RUN apk add --no-cache curl dumb-init

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Install Prisma CLI and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy migration script
COPY --from=builder /app/prisma/migrate.js ./prisma/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S swideal -u 1001 -G nodejs

# Change ownership
RUN chown -R swideal:nodejs /app
USER swideal

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Run migrations before starting the app
CMD ["sh", "-c", "node prisma/migrate.js && node dist/index.js"]
