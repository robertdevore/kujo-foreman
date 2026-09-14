FROM rust:1.86-bookworm AS kujo-runtime
ARG KUJO_RUNTIME_REF=1395f49ff794707380728df3b80ed363788461c0
RUN git clone https://github.com/kujolang/kujo.git /src/kujo \
    && cd /src/kujo \
    && git checkout "$KUJO_RUNTIME_REF" \
    && cargo build --release --locked

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
COPY --from=kujo-runtime /src/kujo/target/release/kujo /usr/local/bin/kujo
COPY --from=bridge /app/strands-bridge/node_modules ./strands-bridge/node_modules
COPY --from=bridge /app/strands-bridge/dist ./strands-bridge/dist
COPY main.kujo kujo.toml ./
COPY src ./src
COPY abilities ./abilities
ENV NODE_ENV=production PORT=8080 FOREMAN_MODE=bedrock KUJO_BIN=/usr/local/bin/kujo
USER foreman
EXPOSE 8080
CMD ["node", "strands-bridge/dist/server.js"]
