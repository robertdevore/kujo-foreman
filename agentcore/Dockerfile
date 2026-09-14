FROM debian:bookworm-slim AS kujo-runtime
ARG KUJO_VERSION=1.4.0
ARG KUJO_ARCHIVE_SHA256=49a4803b70b51a5d6cba04b5aba2bbe8786d19ec15861c18b67c3bac8670233c
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSLo /tmp/kujo.tar.gz "https://github.com/kujolang/kujo/releases/download/v${KUJO_VERSION}/kujo-v${KUJO_VERSION}-linux-x64.tar.gz" \
    && echo "${KUJO_ARCHIVE_SHA256}  /tmp/kujo.tar.gz" | sha256sum -c - \
    && tar -xzf /tmp/kujo.tar.gz -C /usr/local/bin

FROM node:22-bookworm-slim AS bridge
WORKDIR /app/strands-bridge
COPY strands-bridge/package*.json ./
RUN npm ci
COPY strands-bridge/tsconfig.json ./
COPY strands-bridge/src ./src
RUN npm run build && npm prune --omit=dev

FROM debian:bookworm-slim
RUN useradd --create-home --uid 10001 foreman \
    && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=bridge /usr/local/bin/node /usr/local/bin/node
COPY --from=kujo-runtime /usr/local/bin/kujo /usr/local/bin/kujo
COPY --from=bridge /app/strands-bridge/node_modules ./strands-bridge/node_modules
COPY --from=bridge /app/strands-bridge/dist ./strands-bridge/dist
COPY main.kujo kujo.toml ./
COPY src ./src
COPY abilities ./abilities
ENV NODE_ENV=production PORT=8080 FOREMAN_MODE=bedrock KUJO_BIN=/usr/local/bin/kujo
USER foreman
EXPOSE 8080
CMD ["node", "strands-bridge/dist/server.js"]
