# ---------------------------------------------------------
# Build Stage — React (Vite + pnpm) usando multiplos fallbacks
# ---------------------------------------------------------
FROM node:20-alpine AS build

# Fix HTTPS/SSL: instalar certificados e curl para fallback
RUN apk add --no-cache ca-certificates curl

WORKDIR /app

# Variável com a versão do PNPM que você usa no projeto
ARG PNPM_VERSION=10.4.1

# Tenta:
# 1. corepack prepare
# 2. npm -g (registry normal)
# 3. npm -g usando registry da npmmirror (China)
RUN corepack enable \
  && (corepack prepare pnpm@"${PNPM_VERSION}" --activate \
  || npm install -g pnpm@"${PNPM_VERSION}" \
  || npm install -g pnpm@"${PNPM_VERSION}" --registry=https://registry.npmmirror.com)

# Copia manifests primeiro (cache-friendly)
COPY package.json pnpm-lock.yaml ./

# Instala dependências via pnpm
RUN pnpm install --frozen-lockfile

# Copia o projeto
COPY . .

# Build do Vite (com build args)
ARG VITE_API_URL
ARG VITE_SITE_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SITE_URL=${VITE_SITE_URL}

RUN pnpm build

# ---------------------------------------------------------
# Runtime Stage — Servindo via Nginx
# ---------------------------------------------------------
FROM nginx:alpine

# Substitui configuração padrão por nossa config de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia artefatos buildados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]