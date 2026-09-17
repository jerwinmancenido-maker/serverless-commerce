# -------------------------------------------------------------------
# Stage 1: Base Dependencies
# -------------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ curl
COPY package*.json ./

# -------------------------------------------------------------------
# Stage 2: Development & Build Dependencies
# -------------------------------------------------------------------
FROM base AS dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# -------------------------------------------------------------------
# Stage 3: Source Builder
# -------------------------------------------------------------------
FROM dependencies AS builder
COPY . .
ENV NODE_ENV=production
RUN npm run build && mkdir -p /app/dist

# -------------------------------------------------------------------
# Stage 4: Production Runner
# -------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV PORT=9000

# Security: Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

COPY --chown=medusa:nodejs --from=builder /app/package*.json ./
COPY --chown=medusa:nodejs --from=dependencies /app/node_modules ./node_modules
COPY --chown=medusa:nodejs --from=builder /app/dist ./dist
COPY --chown=medusa:nodejs --from=builder /app/.medusa ./.medusa
COPY --chown=medusa:nodejs --from=builder /app/medusa-config.ts ./
COPY --chown=medusa:nodejs --from=builder /app/static ./static

# Ensure upload/cache permissions
RUN mkdir -p /app/uploads && chown medusa:nodejs /app/uploads

USER medusa
EXPOSE 9000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:9000/health || exit 1

CMD ["npm", "run", "start"]
