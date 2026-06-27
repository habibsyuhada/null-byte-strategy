FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/schemas/package.json packages/schemas/
COPY packages/utils/package.json packages/utils/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @null-byte-strategy/api build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
EXPOSE 3000
CMD ["node", "dist/index.js"]