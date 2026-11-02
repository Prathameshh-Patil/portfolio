# Build context is the repo root (see docker-compose.yml): the workspace lockfile lives there.

# ---- build stage: compile TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/contracts packages/contracts
# --ignore-scripts: the root postinstall would build the contracts before TypeScript is ready; it's done next.
RUN npm ci -w apps/api -w @portfolio/contracts --ignore-scripts
RUN npm run build -w @portfolio/contracts
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/src apps/api/src
RUN npm run build -w apps/api

# ---- runtime stage: only production dependencies and compiled JS ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/contracts/package.json packages/contracts/
RUN npm ci -w apps/api --omit=dev --ignore-scripts && npm cache clean --force
# The shared contracts package, compiled: the API imports its schemas at runtime.
COPY --from=build /app/packages/contracts/dist packages/contracts/dist
COPY --from=build /app/apps/api/dist apps/api/dist
COPY apps/api/drizzle apps/api/drizzle
WORKDIR /app/apps/api
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:4000/health || exit 1
# Apply pending migrations, load the starter projects (skips existing slugs), then start the API.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js && node dist/server.js"]
