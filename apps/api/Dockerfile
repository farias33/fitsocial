FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# ── Deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json ./
# pnpm-lock.yaml é gerado na primeira instalação — não forçamos frozen em dev
RUN pnpm install

# ── Dev (hot reload via volume mount) ─────────────────────────────────────────
FROM deps AS development
COPY . .
RUN pnpm run db:generate
CMD ["pnpm", "run", "dev"]

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN pnpm run db:generate
RUN pnpm run build

# ── Production ────────────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
CMD ["node", "dist/main"]
