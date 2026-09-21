# Multi-stage production build for ZimAgriAI Platform
# Node.js + Express + Vite + PostgreSQL client

# Stage 1: Build Frontend and Server Bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* bun.lock* ./

# Install all dependencies (including devDependencies for TypeScript & Vite)
RUN npm install --legacy-peer-deps

# Copy source code and config
COPY . .

# Run production build (vite build + esbuild server.ts bundle into dist/server.cjs)
RUN npm run build

# Stage 2: Minimal Runtime Container
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy compiled distribution output from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose standard port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start bundled production server
CMD ["node", "dist/server.cjs"]
