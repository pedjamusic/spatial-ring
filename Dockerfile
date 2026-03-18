# ==========================================
# Stage 1: Build the Frontend (Web)
# ==========================================
FROM node:20-alpine AS web-builder
WORKDIR /app
# 1. Copy ROOT config first
COPY package.json package-lock.json ./
# 2. Copy CHILD configs (so npm ci knows about workspaces)
COPY web/package.json web/
COPY api/package.json api/
# 3. Install ALL dependencies at root (hoisting)
RUN npm ci

# 4. Copy Web Source and Build
COPY web/ ./web/
WORKDIR /app/web
RUN npm run build

# ==========================================
# Stage 2: Build the Backend (API)
# ==========================================
FROM node:20-alpine AS api-builder
WORKDIR /app
# 1. Copy ROOT config
COPY package.json package-lock.json ./
# 2. Copy CHILD configs
COPY web/package.json web/
COPY api/package.json api/
# 3. Install dependencies
RUN npm ci

# 4. Copy API Source
COPY api/ ./api/
WORKDIR /app/api
# 5. Generate Prisma Client (Critical for your API)
RUN npx prisma generate

# ==========================================
# Stage 3: Final Production Image
# ==========================================
FROM node:20-alpine

# Install Nginx and Supervisor
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# --- Setup App & Dependencies ---
# Copy the entire node_modules from builder (simplest for monorepo)
# This includes the root node_modules where everything is installed
COPY --from=api-builder /app/node_modules /app/node_modules
COPY --from=api-builder /app/package.json /app/package.json

# Copy API Source Code
COPY --from=api-builder /app/api /app/api

# --- Setup Web Static Files ---
COPY --from=web-builder /app/web/dist /usr/share/nginx/html

# --- Configuration ---
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf

# Entrypoint setup
COPY web/inject-env.sh /docker-entrypoint.d/40-inject-env.sh
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh /docker-entrypoint.d/40-inject-env.sh

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Start
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
