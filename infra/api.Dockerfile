FROM node:20-alpine
WORKDIR /app

# 1) dépendances API avec fallback si pas de lock
COPY server/package*.json ./server/
WORKDIR /app/server
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# 2) code API + shared
WORKDIR /app
COPY server ./server
# shared est optionnel; copie seulement s'il existe
COPY shared ./shared
WORKDIR /app/server

# 3) Exécution
ENV PORT=8080 NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
