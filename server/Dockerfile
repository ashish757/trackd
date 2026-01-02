#==========================================================
# Stage 1: Build
#==========================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy configuration and package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Copy the entire source code (apps, libs, etc.)
COPY . .

# Build Argument to specify which microservice to build
ARG APP_NAME

# Generate Prisma Client (needed for build)
#RUN npx prisma generate

# Build the specific app
RUN npx nest build ${APP_NAME}

#==========================================================
# Stage 2: Production
#==========================================================
FROM node:20-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Build Argument again to use in the runner stage
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Copy production node_modules from build stage
# (For monorepos, keeping full node_modules is safer for shared libs)
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy the specific built app and shared prisma
COPY --from=build --chown=nestjs:nodejs /app/dist/apps/${APP_NAME} ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

EXPOSE 3000

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the specific app
# Note: Since Nest builds to dist/apps/APP_NAME/main.js,
# we adjust the path accordingly.
CMD ["sh", "-c", "node dist/main.js"]