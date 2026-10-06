# Multi-stage production Dockerfile for @powerlift/web
# Stage 1: Build static bundle with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/engines/package.json ./packages/engines/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source trees
COPY packages/shared/ ./packages/shared/
COPY packages/engines/ ./packages/engines/
COPY apps/web/ ./apps/web/

# Build Web distribution
WORKDIR /app/apps/web
RUN npm run build

# Stage 2: Serve with hardened Nginx
FROM nginx:alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
