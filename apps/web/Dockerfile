FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN pnpm install

FROM deps AS development
COPY . .
ENV CHOKIDAR_USEPOLLING=true
CMD ["pnpm", "run", "dev"]

FROM deps AS builder
COPY . .
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
