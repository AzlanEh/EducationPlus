FROM node:20-alpine AS base
WORKDIR /app

RUN npm i -g pnpm@10.20.0

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter server build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/package.json ./apps/server/package.json
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]

