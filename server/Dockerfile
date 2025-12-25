# Production Dockerfile for Trackd Backend
# Multi-stage build for optimized image size and security

#==========================================================
# Stage 1: Dependencies
#==========================================================
FROM node:20-alpine AS dependencies

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

#==========================================================
# Stage 2: Build
#==========================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

ENV DATABASE_URL="postgresql://user:pass@localhost:5432/tradkd"
# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

#==========================================================
# Stage 3: Production
#==========================================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

# Copy package.json for running migrations
COPY --chown=nestjs:nodejs package*.json ./

# Generate Prisma Client in production
# RUN npx prisma generate

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]

