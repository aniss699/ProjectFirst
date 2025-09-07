
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
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Build frontend
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /app

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA
COPY infra/nginx.conf /etc/nginx/nginx.conf

# Add serve.json for SPA routing
RUN echo '{ \
  "public": "/usr/share/nginx/html", \
  "rewrites": [ \
    { "source": "**", "destination": "/index.html" } \
  ], \
  "headers": [ \
    { \
      "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg)", \
      "headers": [ \
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } \
      ] \
    } \
  ] \
}' > /usr/share/nginx/html/serve.json

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
