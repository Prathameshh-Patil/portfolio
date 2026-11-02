# Build context is the repo root (see docker-compose.yml): the workspace lockfile lives there.

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/contracts packages/contracts
# --ignore-scripts: the root postinstall would build the contracts before TypeScript is ready; it's done next.
RUN npm ci -w apps/web -w @portfolio/contracts --ignore-scripts
RUN npm run build -w @portfolio/contracts
COPY apps/web apps/web
# NEXT_PUBLIC_* values are inlined into the browser bundle during `next build`, so this is a build arg,
# not a runtime env var. It is the API address as seen from the visitor's browser.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build -w apps/web

# ---- runtime stage: the standalone server plus static files, no node_modules install ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static apps/web/.next/static
COPY --from=build /app/apps/web/public apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
