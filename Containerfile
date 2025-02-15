# Base Node.js image
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Build the project
FROM base AS builder

# libc6-compat might be needed for some dependencies
RUN apk add --no-cache libc6-compat

# Copy source files
COPY . .

# Detect package manager and store it as an argument
RUN ls -la /app && \
  if [ -f yarn.lock ]; then \
    echo "yarn" > /app/.pkg_manager; \
  elif [ -f package-lock.json ]; then \
    echo "npm" > /app/.pkg_manager; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && echo "pnpm" > /app/.pkg_manager; \
  else \
    echo "No valid lockfile found! Please include yarn.lock, package-lock.json, or pnpm-lock.yaml." && exit 1; \
  fi

# Install dependencies based on detected package manager
RUN PKG_MANAGER=$(cat /app/.pkg_manager) && \
  if [ "$PKG_MANAGER" = "yarn" ]; then \
    yarn --frozen-lockfile; \
  elif [ "$PKG_MANAGER" = "npm" ]; then \
    npm ci; \
  elif [ "$PKG_MANAGER" = "pnpm" ]; then \
    pnpm install --frozen-lockfile; \
  fi

# Set environment variables and build arguments
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept environment variables as build arguments
# All NEXT_PUBLIC_ environment variables have to be provided at build time
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}

# Run the build command using detected package manager
RUN PKG_MANAGER=$(cat /app/.pkg_manager) && \
  if [ "$PKG_MANAGER" = "yarn" ]; then \
    yarn build:container; \
  elif [ "$PKG_MANAGER" = "npm" ]; then \
    npm run build:container; \
  elif [ "$PKG_MANAGER" = "pnpm" ]; then \
    pnpm run build:container; \
  fi

# Production image
FROM base AS runner

# Add environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add app-specific user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --disabled-password --gecos "" nextjs

# Copy build artifacts and public files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=1001:1001 /app/.next/standalone ./
COPY --from=builder --chown=1001:1001 /app/.next/static ./.next/static

# Use app-specific user
USER nextjs

# Expose port 3000 and start server
EXPOSE 3000
CMD ["node", "server.js"]
