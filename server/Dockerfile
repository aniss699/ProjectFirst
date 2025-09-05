FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ARG SHARED_DIR=/workspace/shared
COPY $SHARED_DIR /app/shared
ENV PORT=8080 NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
