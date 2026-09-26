# Static build of the DataSuite documentation site (Nextra export) served by Caddy - no Node process at runtime.
# Build context: this folder. The DataSuite deployment builds it as the `docs` service behind the main Caddy.
FROM node:22 AS build
WORKDIR /site
# The PDF/playwright tooling is not needed to build the site.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
# next build (static export to ./out) + pagefind search index (postbuild)
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /site/out /srv
COPY Caddyfile.static /etc/caddy/Caddyfile
