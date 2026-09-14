FROM public.ecr.aws/docker/library/ubuntu:24.04 AS kujo-runtime
ARG KUJO_VERSION=1.4.0
ARG TARGETARCH
ARG KUJO_SHA256_AMD64=49a4803b70b51a5d6cba04b5aba2bbe8786d19ec15861c18b67c3bac8670233c
ARG KUJO_SHA256_ARM64=d5faf688f33a651d41a614706733d5e3428f9f686915076aff1cb7365d764014
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && case "${TARGETARCH}" in \
         amd64) kujo_arch=x64; kujo_sha="${KUJO_SHA256_AMD64}" ;; \
         arm64) kujo_arch=arm64; kujo_sha="${KUJO_SHA256_ARM64}" ;; \
         *) echo "unsupported target architecture: ${TARGETARCH}" >&2; exit 1 ;; \
       esac \
    && curl -fsSLo /tmp/kujo.tar.gz "https://github.com/kujolang/kujo/releases/download/v${KUJO_VERSION}/kujo-v${KUJO_VERSION}-linux-${kujo_arch}.tar.gz" \
    && echo "${kujo_sha}  /tmp/kujo.tar.gz" | sha256sum -c - \
    && tar -xzf /tmp/kujo.tar.gz -C /usr/local/bin

FROM public.ecr.aws/docker/library/node:22-bookworm-slim AS bridge
WORKDIR /app/strands-bridge
COPY strands-bridge/package*.json ./
RUN npm ci
COPY strands-bridge/tsconfig.json ./
COPY strands-bridge/src ./src
RUN npm run build && npm prune --omit=dev

FROM public.ecr.aws/docker/library/ubuntu:24.04
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
COPY demo ./demo
ENV NODE_ENV=production PORT=8080 FOREMAN_MODE=bedrock KUJO_BIN=/usr/local/bin/kujo FOREMAN_STATE_ROOT=/tmp/kujo-foreman
USER foreman
EXPOSE 8080
CMD ["node", "strands-bridge/dist/server.js"]
