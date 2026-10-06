# Multi-stage production Dockerfile for @powerlift/api
# Stage 1: Build & bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native builds
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package manifests
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/engines/package.json ./packages/engines/
COPY packages/shared/package.json ./packages/shared/

# Install all monorepo dependencies
RUN npm ci

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY packages/engines/ ./packages/engines/
COPY apps/api/ ./apps/api/

# Generate Prisma Client & build TypeScript
WORKDIR /app/apps/api
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Add non-root security user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 powerlift

# Install production dependencies only
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/engines/package.json ./packages/engines/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --omit=dev --ignore-scripts

# Copy generated Prisma client and built dist artifacts
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Run as non-root user
USER powerlift

EXPOSE 5001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/healthz || exit 1

CMD ["node", "dist/server.js"]
