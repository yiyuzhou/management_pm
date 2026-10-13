FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:20-bookworm-slim AS builder
WORKDIR /app
ENV npm_config_registry=https://registry.npmmirror.com
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000 \
    TZ=Asia/Shanghai
COPY --from=builder /app/.output ./.output
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && mkdir -p /var/log/manage-ai
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
